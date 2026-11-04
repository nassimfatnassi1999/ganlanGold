/**
 * Déploiement GANLAN GOLD sur Tencent Cloud : COS (fichiers) + EdgeOne (cache CDN).
 *
 *   node scripts/tencent/deploy.mjs site      Envoie tout dist/ puis vide le cache EdgeOne du site.
 *   node scripts/tencent/deploy.mjs prices    Envoie seulement config/prices.json puis vide son cache.
 *   Ajouter --dry-run pour afficher ce qui serait envoyé, sans rien envoyer.
 *
 * Variables d'environnement (secrets GitHub) :
 *   TENCENT_SECRET_ID, TENCENT_SECRET_KEY   clé API d'un sous-utilisateur CAM limité à ce site
 *   COS_BUCKET                              ex. ganlangold-website-1520548234
 *   COS_REGION                              ex. ap-hongkong
 *   EDGEONE_ZONE_ID                         ex. zone-xxxxxxxx (sans lui, pas de vidage du cache)
 *   SITE_HOSTS                              ex. www.ganlangold.com (plusieurs : séparés par des virgules)
 *   EDGEONE_ENDPOINT                        facultatif ; teo.tencentcloudapi.com par défaut
 *
 * Chaque fichier reçoit un en-tête Cache-Control adapté : les pages HTML sont revalidées à
 * chaque visite (fini les anciennes pages servies par le CDN), les fichiers _next/static
 * (noms uniques) sont gardés un an, config/prices.json n'est jamais mis en cache.
 * Les anciens fichiers ne sont pas supprimés : une page encore ouverte chez un visiteur
 * peut en avoir besoin.
 */
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import COS from "cos-nodejs-sdk-v5";
import { teo } from "tencentcloud-sdk-nodejs-teo";
import { headersFor, isPage } from "./cache-rules.mjs";

const DIST = fileURLToPath(new URL("../../dist/", import.meta.url));
const SKIPPED = new Set(["_headers", ".htaccess"]); // règles Netlify / Apache, sans effet sur COS
const CONCURRENCY = 8;

async function listFiles(dir) {
  const entries = await readdir(dir, { recursive: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry);
    if ((await stat(path)).isFile()) {
      const key = relative(dir, path).split(sep).join("/");
      if (!SKIPPED.has(key)) files.push(key);
    }
  }
  return files.sort();
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Variable manquante : ${name} (à ajouter dans les secrets GitHub).`);
  return value;
}

async function runPool(items, worker) {
  let next = 0;
  const runners = Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next];
      next += 1;
      await worker(item);
    }
  });
  await Promise.all(runners);
}

async function upload(cos, bucket, region, keys) {
  let done = 0;
  await runPool(keys, async (key) => {
    const body = await readFile(join(DIST, key));
    for (let attempt = 1; ; attempt += 1) {
      try {
        await cos.putObject({ Bucket: bucket, Region: region, Key: key, Body: body, ...headersFor(key) });
        break;
      } catch (error) {
        if (attempt >= 3) throw new Error(`Échec d'envoi de ${key} : ${error?.message ?? error?.code ?? error}`);
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
      }
    }
    done += 1;
    if (done % 20 === 0 || done === keys.length) console.log(`  ${done}/${keys.length} fichiers envoyés`);
  });
}

async function purge(type, targets) {
  const zoneId = process.env.EDGEONE_ZONE_ID?.trim();
  if (!zoneId) {
    console.warn("! EDGEONE_ZONE_ID absent : cache EdgeOne non vidé. Le faire dans la console EdgeOne.");
    return;
  }
  const client = new teo.v20220901.Client({
    credential: { secretId: requireEnv("TENCENT_SECRET_ID"), secretKey: requireEnv("TENCENT_SECRET_KEY") },
    region: "",
    profile: { httpProfile: { endpoint: process.env.EDGEONE_ENDPOINT?.trim() || "teo.tencentcloudapi.com" } },
  });
  // "delete" force EdgeOne à reprendre chaque fichier sur COS, y compris ses copies compressées (gzip/brotli).
  const response = await client.CreatePurgeTask({ ZoneId: zoneId, Type: type, Method: "delete", Targets: targets });
  if (response.FailedList?.length) {
    throw new Error(`EdgeOne a refusé le vidage : ${JSON.stringify(response.FailedList)}`);
  }
  console.log(`✓ Cache EdgeOne vidé (${type} : ${targets.join(", ")}) — tâche ${response.JobId}`);
}

async function main() {
  const [mode, ...flags] = process.argv.slice(2);
  const dryRun = flags.includes("--dry-run");
  if (mode !== "site" && mode !== "prices") {
    throw new Error("Usage : node scripts/tencent/deploy.mjs site|prices [--dry-run]");
  }

  const hosts = (process.env.SITE_HOSTS || "www.ganlangold.com").split(",").map((host) => host.trim()).filter(Boolean);
  const keys = mode === "prices" ? ["config/prices.json"] : await listFiles(DIST);
  if (!keys.includes("config/prices.json") || (mode === "site" && !keys.includes("index.html"))) {
    throw new Error("dist/ est incomplet : lancer d'abord npm run build.");
  }
  const assets = keys.filter((key) => !isPage(key));
  const pages = keys.filter(isPage);

  if (dryRun) {
    for (const key of [...assets, ...pages]) console.log(`${key}  →  ${JSON.stringify(headersFor(key))}`);
    console.log(`(simulation) ${keys.length} fichiers, vidage EdgeOne pour ${hosts.join(", ")}`);
    return;
  }

  const cos = new COS({ SecretId: requireEnv("TENCENT_SECRET_ID"), SecretKey: requireEnv("TENCENT_SECRET_KEY") });
  const bucket = requireEnv("COS_BUCKET");
  const region = requireEnv("COS_REGION");

  console.log(`Envoi vers cos://${bucket} (${region}) : ${assets.length} ressources puis ${pages.length} pages`);
  await upload(cos, bucket, region, assets);
  await upload(cos, bucket, region, pages);
  console.log("✓ Fichiers envoyés sur COS");

  if (mode === "prices") {
    await purge("purge_prefix", hosts.map((host) => `https://${host}/config/`));
  } else {
    await purge("purge_host", hosts);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(`✗ ${error?.message ?? error}`);
    process.exit(1);
  });
}
