type BilingualHeadingProps = Readonly<{
  eyebrow: string;
  title: string;
  english: string;
  align?: "left" | "center";
  light?: boolean;
}>;

export function BilingualHeading({ eyebrow, title, english, align = "left", light = false }: BilingualHeadingProps) {
  return (
    <header className={`section-heading section-heading--${align}${light ? " section-heading--light" : ""}`}>
      <p className="section-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="section-english" lang="en">
        {english}
      </p>
    </header>
  );
}
