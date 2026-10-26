"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type ScrollRevealProps = Readonly<{
  as?: "article" | "div" | "li";
  children: ReactNode;
  className?: string;
  direction?: "up" | "left" | "right";
  delay?: number;
}>;

export function ScrollReveal({ as: Tag = "div", children, className, direction = "up", delay = 0 }: ScrollRevealProps) {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      element.dataset.revealed = "true";
      return;
    }

    element.dataset.revealReady = "true";
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      element.dataset.revealed = "true";
      observer.disconnect();
    }, { threshold: 0.14, rootMargin: "0px 0px -7% 0px" });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={elementRef as never}
      className={className}
      data-reveal=""
      data-direction={direction}
      data-revealed="false"
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

