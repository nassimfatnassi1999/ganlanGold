"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateProduct } from "@/lib/admin/products";
import { updateQuote } from "@/lib/admin/quotes";
import { refreshExchangeRateAsAdmin } from "@/lib/admin/rates";
import { updateSetting } from "@/lib/admin/settings";
import { updateVisit } from "@/lib/admin/visits";

const value = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export async function updateProductAction(formData: FormData) {
  const id = value(formData, "id");
  await updateProduct({ id, usdPrice: value(formData, "usdPrice"), zhDescription: value(formData, "zhDescription"), enDescription: value(formData, "enDescription") });
  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect(`/admin/products?saved=${encodeURIComponent(id)}`);
}

export async function updateQuoteAction(formData: FormData) {
  const requestId = value(formData, "requestId");
  await updateQuote({ requestId, status: value(formData, "status"), internalNotes: value(formData, "internalNotes") });
  revalidatePath("/admin");
  revalidatePath("/admin/quotes");
  redirect(`/admin/quotes/${encodeURIComponent(requestId)}?saved=1`);
}

export async function updateVisitAction(formData: FormData) {
  const requestId = value(formData, "requestId");
  await updateVisit({ requestId, status: value(formData, "status"), internalNotes: value(formData, "internalNotes") });
  revalidatePath("/admin");
  revalidatePath("/admin/visits");
  redirect("/admin/visits?saved=1");
}

export async function refreshRateAction() {
  await refreshExchangeRateAsAdmin();
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/rates");
  redirect("/admin/rates?refreshed=1");
}

export async function updateSettingAction(formData: FormData) {
  const key = value(formData, "key");
  await updateSetting({ key, value: value(formData, "value") });
  revalidatePath("/");
  revalidatePath("/admin/settings");
  redirect(`/admin/settings?saved=${encodeURIComponent(key)}`);
}
