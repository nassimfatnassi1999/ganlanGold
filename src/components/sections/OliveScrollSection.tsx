"use client";

import Image from "next/image";
import { useRef } from "react";
import { ASSET_PATHS } from "@/lib/assets";
import { useOliveScroll } from "./useOliveScroll";
import styles from "./OliveScrollSection.module.css";

type Composition = keyof typeof ASSET_PATHS.olives;

function OliveComposition({ position }: { position: Composition }) {
  const asset = ASSET_PATHS.olives[position];
  return (
    <div className={`${styles.composition} ${styles[position]}`} data-olive-item>
      <div className={styles.motion} data-olive-motion>
        <picture className={styles.branch}>
          <source media="(max-width: 767px)" srcSet={`/${asset.mobile}`} />
          <Image
            src={`/${asset.desktop}`}
            alt=""
            width={800}
            height={800}
            sizes="(max-width: 767px) 260px, (max-width: 1023px) 30vw, 400px"
            draggable={false}
          />
        </picture>
      </div>
    </div>
  );
}

/** Decorative botanical interlude. All artwork and its space exist before hydration. */
export function OliveScrollSection() {
  const ref = useRef<HTMLDivElement>(null);
  useOliveScroll(ref);

  return (
    <div ref={ref} className={styles.section} data-olive-section aria-hidden="true">
      <div className={styles.light} />
      <div className={styles.stage}>
        <OliveComposition position="left" />
        <OliveComposition position="center" />
        <OliveComposition position="right" />
      </div>
      <div className={styles.oil}>
        <svg className={styles.drop} viewBox="0 0 24 40" fill="none">
          <defs>
            <linearGradient id="olive-oil-light" x1="4" y1="10" x2="22" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f5e5ac" />
              <stop offset=".38" stopColor="#c9a95f" />
              <stop offset=".7" stopColor="#91752b" />
              <stop offset="1" stopColor="#e4cb7c" />
            </linearGradient>
          </defs>
          <path d="M12 2C12 12 3 19 3 27a9 9 0 0 0 18 0C21 19 12 12 12 2Z" fill="url(#olive-oil-light)" />
          <path d="M8 22c-3 6-2 9 1 11" stroke="#fff2c7" strokeWidth="1.2" strokeLinecap="round" opacity=".7" />
        </svg>
        <span className={styles.ripple} />
      </div>
    </div>
  );
}
