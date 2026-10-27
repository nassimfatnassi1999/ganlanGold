# Olive Experience Implementation Plan

> Execute directly in the current project, as requested. Use the executing-plans and verification-before-completion skills.

**Goal:** Replace the injected olive/bottle/bowl band with three realistic olive compositions between Origin and Visit.

**Architecture:** A server-rendered client component reserves its complete layout. Three optimized, transparent botanical images receive independent transform-only scroll movement through an isolated hook. A CSS module owns responsive composition, shading, and reduced-motion fallbacks. No animation dependencies or external runtime assets.

**Tech stack:** Existing Next.js 16.4.3 / React 19, CSS modules, IntersectionObserver, passive scroll events and event-driven requestAnimationFrame.

**Spec:** User's attached olive redesign brief. Preserve every surrounding section, commercial detail, locale, navigation behavior and static export.

## Constraints and review focus

- Three coherent realistic compositions; existing deep olive / gold brand colors.
- No layout shift from client injection; images have dimensions and reserved space.
- Contained artwork at 320–1440px and on touch devices; lower mobile motion amplitude.
- Scroll produces staggered entry, rotation, a restrained settling arc and depth; no continuous idle loop.
- Reduced motion, preference changes, and JavaScript-disabled rendering retain all artwork.
- Clean up observers, frame callbacks and listeners; run work only while visible.

## Task 1: Replace the decorative band

- [x] Add browser coverage for three intact compositions, responsive containment, scroll response, reduced-motion changes, and JavaScript-disabled layout; observe the missing-section failure.
- [x] Optimize generated transparent branch images into 800px and 480px local WebP assets; register paths in `src/lib/assets.ts`.
- [x] Add `OliveScrollSection.tsx`, `OliveScrollSection.module.css`, and `useOliveScroll.ts` under `src/components/sections/`.
- [x] Render immediately after Origin in `PublicExperience.tsx`; remove legacy layout links and `public/interactive/olive-journey.{js,css}`.
- [x] Run targeted browser tests and refine desktop, tablet and mobile screenshots.

## Task 2: Verify delivery

- [x] Run lint, typecheck, full end-to-end suite, and static production build.
- [x] Verify live Next.js compilation/errors and React rendering behavior.
- [x] Inspect actual screenshots, all required widths, scroll positions, reduced motion, and static export; record results here.

## Decisions

- User explicitly requests direct implementation in this checkout; no separate worktree, design approval round, commit, or publication.
- Generated photographic assets replace vector artwork; no bottle or bowl. The optional oil detail stays restrained.
- The section is decorative and adds no text or locale keys.


## Verification results

- `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check` passed.
- Full development suite: 37 passed, 7 device-specific skips.
- Full suite against the actual exported `dist/` over HTTP: 37 passed, 7 device-specific skips.
- Scroll-response test repeated eight times against the static export: all passed after synchronizing measurements with browser frames.
- Visual screenshots inspected at desktop, tablet, and mobile sizes. Required width matrix: 320, 375, 390, 430, 768, 1024, 1440px. Additional 320×568, 844×390 touch landscape, 1024×768 touch and 1440×900 checks confirmed no page overflow and no clipping of painted artwork during entry, settling or exit. Transparent sprite padding may pass beyond the section clipping boundary.
- Reduced-motion startup and live toggles, JavaScript-disabled artwork, complete image decoding, and existing navigation/languages/forms/prices passed.
- Next.js compilation issues, configuration errors and browser session errors were empty. Scroll profiling showed no olive-component React renders.
- Independent read-only review found no actionable issues.
- The first static checks exposed test frame-sampling races and limitations of the temporary preview server. Waiting for initialization/render frames and using a concurrent server with directory redirects resolved these verification issues; no application behavior change was needed.
- Generated `dist/` was rebuilt. Legacy olive-journey assets and HTML references are absent; exactly one replacement section exists in static HTML.
