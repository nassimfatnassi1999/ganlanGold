import { expect, test, type Page } from "@playwright/test";

const ORIGINAL_PRODUCT_PHOTOS = [
  "/images/products/product-250ml.webp",
  "/images/products/product-500ml.webp",
  "/images/products/product-750ml.webp",
  "/images/products/product-5l.webp",
];

async function scrollJourney(page: Page, progress: number) {
  await page.evaluate(async (value) => {
    const section = document.querySelector<HTMLElement>("#journey")!;
    const top = section.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: top + (section.offsetHeight - innerHeight) * value, behavior: "instant" });
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  }, progress);
}

test("the 3D journey sits between the hero and the products with four readable steps", async ({ page }) => {
  await page.goto("/");
  const journey = page.locator("#journey");
  await expect(journey).toHaveCount(1);
  const order = await page.evaluate(() => [...document.querySelectorAll("main > section")].map((section) => section.id).slice(0, 3));
  expect(order).toEqual(["top", "journey", "products"]);
  await expect(journey.getByRole("heading", { level: 2, name: "一颗橄榄的旅程" })).toBeAttached();
  await expect(journey.locator(".journey-card")).toHaveCount(4);
  await expect(journey.locator(".journey-card h3 .language-content--zh")).toHaveText(["采收与压榨", "灌装协调", "四种规格，整装待发"]);
  await expect(journey.getByRole("link", { name: "查看四种规格" })).toHaveAttribute("href", "#products");
});

test("scroll progress drives the journey forwards and backwards", async ({ page }) => {
  await page.goto("/");
  const journey = page.locator("#journey");
  await scrollJourney(page, 0.05);
  await expect(journey).toHaveAttribute("data-step", "0");
  await scrollJourney(page, 0.68);
  await expect(journey).toHaveAttribute("data-step", "2");
  const forward = Number(await journey.evaluate((element) => getComputedStyle(element).getPropertyValue("--journey")));
  expect(forward).toBeGreaterThan(0.6);
  await scrollJourney(page, 0.3);
  await expect(journey).toHaveAttribute("data-step", "1");
  const back = Number(await journey.evaluate((element) => getComputedStyle(element).getPropertyValue("--journey")));
  expect(back).toBeLessThan(forward);
  // WebGL either renders or the static poster stays: never an empty stage.
  await expect.poll(() => journey.getAttribute("data-webgl"), { timeout: 15_000 }).toMatch(/ready|unavailable/);
});

test("reduced motion never loads WebGL and keeps the static poster", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const journey = page.locator("#journey");
  await scrollJourney(page, 0.5);
  await page.waitForTimeout(500);
  await expect(journey).toHaveAttribute("data-webgl", "off");
  await expect(journey.locator(".journey-poster")).toBeVisible();
  const opacity = await journey.locator(".journey-card").first().evaluate((element) => getComputedStyle(element).opacity);
  expect(opacity).toBe("1");
  const videosPlaying = await page.locator("video").evaluateAll((videos) => videos.filter((video) => !(video as HTMLVideoElement).paused).length);
  expect(videosPlaying).toBe(0);
});

test("journey text and poster exist without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(new URL("/", baseURL).href);
    const journey = page.locator("#journey");
    await expect(journey.locator(".journey-card")).toHaveCount(4);
    await journey.locator(".journey-card").last().scrollIntoViewIfNeeded();
    await expect(journey.locator(".journey-card").last()).toBeVisible();
    await expect(journey.locator(".journey-poster")).toBeVisible();
  } finally {
    await context.close();
  }
});

test("existing product photographs are kept unchanged inside the 3D cards", async ({ page }) => {
  await page.goto("/");
  const sources = await page.locator(".product-visual img").evaluateAll((images) => images.map((image) => new URL((image as HTMLImageElement).src).pathname));
  expect(sources).toEqual(ORIGINAL_PRODUCT_PHOTOS);
  await expect(page.locator(".product-stage[data-scroll-fx]")).toHaveCount(4);
});

test("background videos are lazy, silent and provide WebM, MP4 and a poster", async ({ page }) => {
  await page.goto("/");
  const videos = await page.locator("video").evaluateAll((elements) => elements.map((element) => {
    const video = element as HTMLVideoElement;
    return {
      muted: video.muted,
      loop: video.loop,
      preload: video.preload,
      poster: new URL(video.poster).pathname,
      sources: [...video.querySelectorAll("source")].map((source) => source.type),
      hidden: video.getAttribute("aria-hidden"),
    };
  }));
  expect(videos).toEqual([
    { muted: true, loop: true, preload: "none", poster: "/media/liquid-gold-poster.webp", sources: ["video/webm", "video/mp4"], hidden: "true" },
    { muted: true, loop: true, preload: "none", poster: "/media/grove-light-poster.webp", sources: ["video/webm", "video/mp4"], hidden: "true" },
  ]);
  for (const path of ["/media/liquid-gold.mp4", "/media/liquid-gold.webm", "/media/grove-light.mp4", "/media/grove-light.webm", "/images/3d/label-750ml.webp"]) {
    const response = await page.request.get(path);
    expect(response.ok(), path).toBe(true);
  }
});

test("scroll effects update while scrolling and settle when scrolling stops", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "One browser covers the scroll driver.");
  await page.goto("/");
  const stage = page.locator(".product-stage").first();
  await stage.scrollIntoViewIfNeeded();
  const read = () => stage.evaluate((element) => element.style.getPropertyValue("--fx"));
  await expect.poll(read).not.toBe("");
  const before = await read();
  await page.mouse.wheel(0, 300);
  await expect.poll(read).not.toBe(before);
  const settled = await read();
  await page.waitForTimeout(300);
  expect(await read()).toBe(settled);
  const gauge = await page.evaluate(() => Number(document.documentElement.style.getPropertyValue("--page")));
  expect(gauge).toBeGreaterThan(0);
});
