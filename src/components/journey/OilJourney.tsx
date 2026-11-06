"use client";

import { ArrowDown } from "lucide-react";
import { useEffect, useRef } from "react";
import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { TranslatedText } from "@/i18n/TranslatedText";
import type { Journey } from "./journeyScene";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Pinned 3D scroll story. The text steps are ordinary HTML in the page flow
 * (readable without JavaScript); three.js is loaded only when the section
 * approaches and never for visitors who prefer reduced motion.
 */
export function OilJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const lowPower = matchMedia("(max-width: 767px), (pointer: coarse)").matches || (navigator.hardwareConcurrency || 8) <= 4;
    let journey: Journey | null = null;
    let loading = false;
    let disposed = false;
    let visible = false;
    let frame = 0;

    const progress = (rect = section.getBoundingClientRect()) => {
      const travel = rect.height - window.innerHeight;
      return travel > 0 ? clamp(-rect.top / travel) : 0;
    };

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      // Start three.js only once the visitor scrolls towards the scene (not on page load,
      // and not when jumping straight to a section further down).
      if (!journey && rect.top < window.innerHeight * 0.75 && rect.bottom > 0) void load();
      const value = progress(rect);
      section.style.setProperty("--journey", value.toFixed(4));
      const step = String(Math.min(3, Math.round(value * 3)));
      if (section.dataset.step !== step) section.dataset.step = step;
      journey?.setProgress(value);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const syncActive = () => journey?.setActive(visible && !reduced.matches && !document.hidden);

    const load = async () => {
      if (journey || loading || disposed || reduced.matches) return;
      loading = true;
      section.dataset.webgl = "loading";
      try {
        const { createJourney } = await import("./journeyScene");
        if (disposed) return;
        const created = await createJourney(canvas, { labelUrl: "/images/3d/label-750ml.webp", lowPower });
        if (disposed) {
          created.dispose();
          return;
        }
        journey = created;
        section.dataset.webgl = "ready";
        journey.setProgress(progress());
        syncActive();
      } catch {
        section.dataset.webgl = "unavailable";
      } finally {
        loading = false;
      }
    };

    const onScreen = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      syncActive();
      if (visible) schedule();
    });

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !visible) return;
      journey?.setPointer((event.clientX / window.innerWidth) * 2 - 1, -((event.clientY / window.innerHeight) * 2 - 1));
    };
    const onResize = () => {
      journey?.resize();
      schedule();
    };
    const onPreference = () => {
      if (reduced.matches) {
        journey?.setActive(false);
        section.dataset.webgl = journey ? "paused" : "off";
      } else if (journey) {
        section.dataset.webgl = "ready";
        syncActive();
      } else {
        schedule();
      }
    };
    const onLost = () => {
      section.dataset.webgl = "unavailable";
    };

    if (reduced.matches) section.dataset.webgl = "off";
    onScreen.observe(section);
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", syncActive);
    reduced.addEventListener("change", onPreference);
    canvas.addEventListener("journey-lost", onLost);

    return () => {
      disposed = true;
      onScreen.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", syncActive);
      reduced.removeEventListener("change", onPreference);
      canvas.removeEventListener("journey-lost", onLost);
      journey?.dispose();
      journey = null;
    };
  }, []);

  return (
    <section ref={sectionRef} id="journey" className="journey" aria-labelledby="journey-title" data-step="0" data-webgl="pending">
      <div className="journey-sticky" aria-hidden="true">
        <div className="journey-backdrop" />
        <div className="journey-poster" />
        <canvas ref={canvasRef} className="journey-canvas" />
        <div className="journey-rail">
          {zh.journey.steps.map((step, index) => <span key={step.title} data-index={index} />)}
          <i />
        </div>
        <p className="journey-caption"><TranslatedText zh={zh.journey.caption} en={en.journey.caption} /></p>
      </div>
      <div className="journey-steps">
        {zh.journey.steps.map((step, index) => (
          <div className={`journey-step journey-step--${index % 2 ? "right" : "left"}`} key={step.title} data-scroll-fx="">
            <div className="journey-card">
              <span className="journey-number">0{index + 1}<small>/04</small></span>
              {index === 0 ? (
                <>
                  <p className="section-eyebrow"><TranslatedText zh={zh.journey.eyebrow} en={en.journey.eyebrow} /></p>
                  <h2 id="journey-title"><TranslatedText zh={step.title} en={en.journey.steps[index].title} /></h2>
                </>
              ) : (
                <h3><TranslatedText zh={step.title} en={en.journey.steps[index].title} /></h3>
              )}
              <p className="journey-body"><TranslatedText zh={step.body} en={en.journey.steps[index].body} /></p>
              {index === 0 ? (
                <p className="journey-hint"><ArrowDown size={16} aria-hidden="true" /><TranslatedText zh={zh.journey.scroll} en={en.journey.scroll} /></p>
              ) : null}
              {index === 3 ? (
                <a className="button button--gold journey-cta" href="#products"><TranslatedText zh={zh.journey.explore} en={en.journey.explore} /></a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
