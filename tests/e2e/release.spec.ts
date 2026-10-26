import { expect, test } from "@playwright/test";

const widths = [320, 375, 390, 430, 768, 1024, 1440] as const;

test("release layout has no overflow or broken imagery across the required width matrix", async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  test.skip(testInfo.project.name !== "desktop-chromium", "The explicit viewport matrix supersedes device projects.");

  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 960 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "来自摩洛哥的天然馈赠" })).toBeVisible();

    for (const image of await page.locator("img").all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((element) => (element as HTMLImageElement).decode().catch(() => undefined));
    }
    await page.screenshot({ path: testInfo.outputPath(`public-${width}.png`), fullPage: true });

    const state = await page.evaluate(() => {
      const images = [...document.images];
      return {
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
        brokenImages: images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src),
      };
    });
    expect(state.documentWidth, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(state.viewportWidth);
    expect(state.brokenImages, `broken images at ${width}px`).toEqual([]);
  }
});

test("keyboard entry and reduced-motion preference retain the public journey", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "One browser covers preference semantics.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "跳至主要内容 / Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeInViewport();

  const motion = await page.evaluate(() => ({
    preference: matchMedia("(prefers-reduced-motion: reduce)").matches,
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
  }));
  expect(motion).toEqual({ preference: true, scrollBehavior: "auto" });
  await expect(page.getByRole("heading", { name: "为不同专业渠道而备" })).toBeVisible();
});

test("product and origin photography use coherent sharp reveal treatments", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Desktop covers perspective presentation.");
  await page.goto("/");

  const productRows = page.locator(".product-row[data-reveal]");
  await expect(productRows).toHaveCount(4);
  await productRows.first().scrollIntoViewIfNeeded();
  await expect(productRows.first()).toHaveAttribute("data-revealed", "true");
  await expect(page.locator(".product-index")).toHaveCount(0);

  const productPresentation = await page.locator(".product-visual").first().evaluate((element) => ({
    perspective: getComputedStyle(element).perspective,
    overflow: getComputedStyle(element).overflow,
  }));
  expect(productPresentation.perspective).not.toBe("none");
  expect(productPresentation.overflow).toBe("hidden");

  const originImage = page.locator(".origin-image");
  await originImage.scrollIntoViewIfNeeded();
  await expect(originImage).toHaveAttribute("src", /moroccan-groves-sharp\.webp$/);
  await originImage.evaluate((image) => (image as HTMLImageElement).decode());
  const originPresentation = await originImage.evaluate((image) => ({
    naturalWidth: (image as HTMLImageElement).naturalWidth,
    filter: getComputedStyle(image).filter,
  }));
  expect(originPresentation.naturalWidth).toBeGreaterThanOrEqual(768);
  expect(originPresentation.filter).toBe("none");
});

test("reduced motion renders every reveal in its final readable state", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "One browser covers reduced motion.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const states = await page.locator("[data-reveal]").evaluateAll((elements) => elements.map((element) => {
    const style = getComputedStyle(element);
    return { opacity: style.opacity, transform: style.transform };
  }));
  expect(states.length).toBeGreaterThan(8);
  expect(states.every((state) => state.opacity === "1" && state.transform === "none")).toBe(true);
});
