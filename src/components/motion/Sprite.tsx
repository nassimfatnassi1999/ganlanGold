/** Rendered 3D sprites (scripts/media/render-media.mjs) shown as decorative depth layers. */
export type SpriteName =
  | "olive-green-a"
  | "olive-green-b"
  | "olive-turning"
  | "olive-ripe"
  | "leaf-a"
  | "leaf-b"
  | "sprig"
  | "oil-drop"
  | "bottle-750ml";

/**
 * A CSS background instead of <img>: purely decorative, invisible to assistive
 * technology, and not downloaded at all where a breakpoint hides it.
 * The outer span carries the scroll transform, the inner one the idle float.
 */
export function Sprite({ name, className }: Readonly<{ name: SpriteName; className?: string }>) {
  return (
    <span className={`sprite${className ? ` ${className}` : ""}`} aria-hidden="true">
      <span className={`sprite__image sprite--${name}`} />
    </span>
  );
}
