"use client";

import { useEffect } from "react";

const LIMIT = 1.5;

/**
 * One passive scroll listener for the whole page. Every element marked
 * `data-scroll-fx` receives `--fx`: 0 when its centre is at the centre of the
 * viewport, +1 one viewport after (scrolled up past it), −1 one viewport before.
 * CSS turns that number into 3D transforms, so the motion follows the scroll in
 * both directions and stops when scrolling stops. `--page` on <html> is the
 * overall scroll progress (0–1) used by the oil gauge under the header.
 */
export function ScrollEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const near = new Set<HTMLElement>();
    let frame = 0;

    const update = () => {
      frame = 0;
      if (reduced.matches) return;
      const viewport = window.innerHeight;
      const scrollable = root.scrollHeight - viewport;
      root.style.setProperty("--page", (scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0).toFixed(4));
      const rects = [...near].map((element) => [element, element.getBoundingClientRect()] as const);
      for (const [element, rect] of rects) {
        const offset = (viewport / 2 - (rect.top + rect.height / 2)) / viewport;
        element.style.setProperty("--fx", Math.max(-LIMIT, Math.min(LIMIT, offset)).toFixed(4));
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        if (entry.isIntersecting) near.add(element);
        else near.delete(element);
      }
      schedule();
    }, { rootMargin: "60% 0px" });

    const elements = [...document.querySelectorAll<HTMLElement>("[data-scroll-fx]")];
    const reset = () => {
      root.style.removeProperty("--page");
      for (const element of elements) element.style.removeProperty("--fx");
    };
    const onPreference = () => {
      if (reduced.matches) reset();
      else schedule();
    };

    root.dataset.scrollFx = "on";
    for (const element of elements) observer.observe(element);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    reduced.addEventListener("change", onPreference);
    schedule();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", onPreference);
      delete root.dataset.scrollFx;
      reset();
    };
  }, []);

  return null;
}
