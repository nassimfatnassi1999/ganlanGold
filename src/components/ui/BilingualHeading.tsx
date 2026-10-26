import { TranslatedText } from "@/i18n/TranslatedText";

type BilingualHeadingProps = Readonly<{
  id?: string;
  eyebrow: string;
  englishEyebrow: string;
  title: string;
  english: string;
  align?: "left" | "center";
  light?: boolean;
}>;

export function BilingualHeading({ id, eyebrow, englishEyebrow, title, english, align = "left", light = false }: BilingualHeadingProps) {
  return (
    <header className={`section-heading section-heading--${align}${light ? " section-heading--light" : ""}`}>
      <p className="section-eyebrow"><TranslatedText zh={eyebrow} en={englishEyebrow} /></p>
      <h2 id={id}><TranslatedText zh={title} en={english} /></h2>
    </header>
  );
}
