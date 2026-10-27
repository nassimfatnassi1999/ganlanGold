"use client";

import { useEffect, type RefObject } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Event-driven transforms: no React state, perpetual frame loop, or scroll interception. */
export function useOliveScroll(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    const items = [...section.querySelectorAll<HTMLElement>("[data-olive-item]")];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const gentle = matchMedia("(max-width: 767px), (pointer: coarse)");
    let visible = false;
    let frame = 0;

    const reset = () => {
      for (const item of items) item.removeAttribute("style");
      section.style.removeProperty("--oil-descent");
      section.style.removeProperty("--oil-spread");
    };

    const update = () => {
      frame = 0;
      if (reduced.matches || !visible) return;

      const viewport = window.innerHeight;
      const strength = gentle.matches ? 0.4 : 1;
      // Read stationary layout wrappers first, then write transforms on their children.
      const bounds = items.map((item) => item.getBoundingClientRect());
      const sectionBounds = section.getBoundingClientRect();

      items.forEach((item, index) => {
        const rect = bounds[index];
        const progress = clamp((viewport * 0.94 - rect.top) / Math.min(viewport * 0.76, rect.height + 180) - index * 0.045);
        const settled = 1 - Math.pow(1 - progress, 3);
        const depth = (viewport * 0.5 - rect.top - rect.height * 0.5) / viewport;
        const direction = index === 0 ? -1 : index === 2 ? 1 : 0;
        const lift = Math.sin(progress * Math.PI) * (index === 1 ? 14 : 9);

        item.style.setProperty("--olive-x", `${(direction * 46 * (1 - settled) * strength).toFixed(2)}px`);
        item.style.setProperty("--olive-y", `${((30 * (1 - settled) - lift - depth * (index === 1 ? 20 : 12)) * strength).toFixed(2)}px`);
        item.style.setProperty("--olive-turn", `${((direction || -1) * (7 * (1 - settled) + depth * 2) * strength).toFixed(2)}deg`);
        item.style.setProperty("--olive-scale", (1 - (index === 1 ? 0.065 : 0.025) * (1 - settled) * strength).toFixed(4));
        item.style.setProperty("--olive-sway", `${(Math.sin(progress * Math.PI * 2 + index) * 1.4 * strength).toFixed(2)}deg`);
      });

      const passage = clamp((viewport - sectionBounds.top) / (viewport + sectionBounds.height));
      section.style.setProperty("--oil-descent", `${((passage - 0.5) * 28 * strength).toFixed(2)}px`);
      section.style.setProperty("--oil-spread", (0.85 + passage * 0.3).toFixed(3));
    };

    const schedule = () => {
      if (!frame && visible && !reduced.matches && !document.hidden) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      section.dataset.inView = String(visible && !reduced.matches);
      if (visible) schedule();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });

    const onPreferenceChange = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      section.dataset.inView = String(visible && !reduced.matches);
      if (reduced.matches) reset();
      else schedule();
    };

    observer.observe(section);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    document.addEventListener("visibilitychange", schedule);
    reduced.addEventListener("change", onPreferenceChange);
    gentle.addEventListener("change", schedule);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      reduced.removeEventListener("change", onPreferenceChange);
      gentle.removeEventListener("change", schedule);
      delete section.dataset.inView;
      reset();
    };
  }, [ref]);
}
