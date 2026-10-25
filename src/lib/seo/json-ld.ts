import zh from "@/i18n/zh-CN.json";
import { PRODUCT_SPECS } from "@/lib/products/catalog";

type ContactPointJsonLd = Readonly<{
  "@type": "ContactPoint";
  name: string;
  telephone: string;
  contactType: string;
  availableLanguage: readonly string[];
}>;

type OrganizationJsonLd = Readonly<{
  "@type": "Organization";
  "@id": string;
  name: "GANLAN GOLD";
  url: string;
  description: string;
  contactPoint: readonly ContactPointJsonLd[];
}>;

type ProductJsonLd = Readonly<{
  "@type": "Product";
  "@id": string;
  name: string;
  description: string;
  image: string;
  size: string;
  brand: Readonly<{ "@type": "Brand"; name: "GANLAN GOLD" }>;
  offers: Readonly<{
    "@type": "Offer";
    url: string;
    price: string;
    priceCurrency: "USD";
    seller: Readonly<{ "@id": string }>;
  }>;
}>;

export function buildSiteJsonLd(siteUrl: string): Readonly<{
  "@context": "https://schema.org";
  "@graph": readonly [OrganizationJsonLd, ...ProductJsonLd[]];
}> {
  const origin = new URL(siteUrl).origin;
  const organizationId = `${origin}/#organization`;
  const organization: OrganizationJsonLd = {
    "@type": "Organization",
    "@id": organizationId,
    name: "GANLAN GOLD",
    url: `${origin}/`,
    description: zh.meta.description,
    contactPoint: [
      {
        "@type": "ContactPoint",
        name: "Gisèle",
        telephone: "+86 134 2751 3756",
        contactType: "中国广州本地联系人",
        availableLanguage: ["zh-CN", "fr"],
      },
      {
        "@type": "ContactPoint",
        name: "Lassad",
        telephone: "+33 6 34 14 26 32",
        contactType: "商业联系",
        availableLanguage: ["zh-CN", "en", "fr"],
      },
      {
        "@type": "ContactPoint",
        name: "Fouad",
        telephone: "+40 724 815 229",
        contactType: "摩洛哥产地联系",
        availableLanguage: ["en", "fr", "ar"],
      },
    ],
  };

  const products: ProductJsonLd[] = PRODUCT_SPECS.map((product) => {
    const size = product.id === "5l" ? "5 L" : `${product.capacityMl} ml`;
    return {
      "@type": "Product",
      "@id": `${origin}/#product-${product.id}`,
      name: `GANLAN GOLD 摩洛哥特级初榨橄榄油 ${size}`,
      description: zh.products.descriptions[product.id],
      image: new URL(product.imagePath, origin).toString(),
      size,
      brand: { "@type": "Brand", name: "GANLAN GOLD" },
      offers: {
        "@type": "Offer",
        url: `${origin}/#products`,
        price: product.referenceUsd,
        priceCurrency: "USD",
        seller: { "@id": organizationId },
      },
    };
  });

  return { "@context": "https://schema.org", "@graph": [organization, ...products] };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
