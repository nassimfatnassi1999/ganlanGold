import { PRODUCT_IDS } from "@/lib/forms/lead";

/** A toggled checkbox updates before React enables its associated input.
 * Read retained values too so reselecting a format validates the same snapshot. */
export function formValues(form: HTMLFormElement): FormData {
  const values = new FormData(form);
  for (const name of [
    "destinationPort",
    ...PRODUCT_IDS.map((id) => `quantity-${id}`),
  ]) {
    const field = form.elements.namedItem(name);
    if (field instanceof HTMLInputElement) values.set(name, field.value);
  }
  return values;
}
