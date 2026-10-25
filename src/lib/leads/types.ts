import type { ProductId } from "@/lib/products/catalog";

export type RequestedProduct = {
  productId: ProductId;
  quantity: number;
};

export type LeadRequestContext = {
  ipHash?: string;
  userAgent?: string;
  now?: Date;
};

export type LeadSubmissionResult = {
  requestId: string;
  duplicate: boolean;
  notification: "sent" | "failed" | "not-configured";
};
