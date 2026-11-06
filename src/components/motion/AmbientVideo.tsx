"use client";

import { useEffect, useRef } from "react";

type AmbientVideoProps = Readonly<{ name: "liquid-gold" | "grove-light"; className?: string }>;

/**
 * Silent decorative loop. Nothing is downloaded until the video is near the
 * screen (preload="none"); it pauses off screen, in background tabs, with
 * reduced motion or when the visitor asked to save data. The poster stays.
 */
export function AmbientVideo({ name, className }: AmbientVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    let visible = false;
    video.muted = true;

    const sync = () => {
      if (visible && !reduced.matches && !saveData && !document.hidden) {
        video.play().then(() => { video.dataset.playing = "true"; }).catch(() => undefined);
      } else {
        video.pause();
        delete video.dataset.playing;
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      sync();
    }, { rootMargin: "25% 0px" });

    observer.observe(video);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      video.pause();
    };
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      poster={`/media/${name}-poster.webp`}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={`/media/${name}.webm`} type="video/webm" />
      <source src={`/media/${name}.mp4`} type="video/mp4" />
    </video>
  );
}
