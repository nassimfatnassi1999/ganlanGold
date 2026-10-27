import { expect, test } from "@playwright/test";

test("three olive compositions remain intact across phone, tablet and desktop layouts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Explicit viewport matrix covers the layouts.");
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/");
    const scene = page.locator("[data-olive-section]");
    await expect(scene.locator("img")).toHaveCount(3);
    await scene.scrollIntoViewIfNeeded();
    for (const image of await scene.locator("img").all()) {
      await image.evaluate((element) => (element as HTMLImageElement).decode());
    }
    const state = await scene.evaluate((element) => {
      const section = element.getBoundingClientRect();
      return {
        fits: [...element.querySelectorAll("img")].every((image) => {
          const rect = image.getBoundingClientRect();
          return image.naturalWidth > 0 && rect.width > 160
            && rect.left >= section.left && rect.right <= section.right
            && rect.top >= section.top && rect.bottom <= section.bottom;
        }),
        overflow: document.documentElement.scrollWidth > innerWidth,
        nextSection: element.nextElementSibling?.id,
        previousSection: element.previousElementSibling?.id,
      };
    });
    expect(state, `${width}px composition`).toEqual({ fits: true, overflow: false, nextSection: "visit", previousSection: "origin" });
    await scene.screenshot({ path: testInfo.outputPath(`olives-${width}.png`) });
  }
});

test("olive motion responds to scrolling and settles without an idle loop", async ({ page }) => {
  await page.goto("/");
  const scene = page.locator("[data-olive-section]");
  await expect(scene.locator("img")).toHaveCount(3);
  const scrollTo = async (offset: number) => {
    await scene.evaluate(async (element, value) => {
      window.scrollTo({ top: element.getBoundingClientRect().top + scrollY - innerHeight * value, behavior: "instant" });
      // A scroll event and its transform update run in successive rendering steps.
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    }, offset);
  };
  const transforms = () => scene.locator("[data-olive-motion]").evaluateAll((elements) => elements.map((element) => getComputedStyle(element).transform));
  await scrollTo(0.8);
  await expect(scene).toHaveAttribute("data-in-view", "true");
  await expect.poll(async () => (await transforms()).every((value) => value !== "none")).toBe(true);
  const before = await transforms();
  await scrollTo(0.2);
  await expect.poll(transforms).not.toEqual(before);
  const settled = await transforms();
  await expect.poll(transforms).toEqual(settled);
  expect(await scene.evaluate((element) => element.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length)).toBe(0);
});

test("reduced motion retains the complete stationary scene, including preference changes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const scene = page.locator("[data-olive-section]");
  await expect(scene.locator("img")).toHaveCount(3);
  await scene.scrollIntoViewIfNeeded();
  const staticState = () => scene.locator("[data-olive-motion]").evaluateAll((elements) => elements.every((element) => {
    const style = getComputedStyle(element);
    return style.transform === "none" && style.opacity === "1";
  }));
  await expect.poll(staticState).toBe(true);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(staticState).toBe(false);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(staticState).toBe(true);
  expect(await scene.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
});

test("olive artwork and its reserved space exist without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(new URL("/", baseURL).href);
    const scene = page.locator("[data-olive-section]");
    await expect(scene.locator("img")).toHaveCount(3);
    await scene.scrollIntoViewIfNeeded();
    expect((await scene.boundingBox())?.height).toBeGreaterThan(300);
    for (const image of await scene.locator("img").all()) await expect(image).toBeVisible();
  } finally {
    await context.close();
  }
});
