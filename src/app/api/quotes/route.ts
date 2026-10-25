import { submitQuote } from "@/lib/leads/service";
import { createPublicLeadHandler, type PublicLeadHandlerOptions } from "@/lib/leads/http";

type QuoteHandlerOptions = Omit<PublicLeadHandlerOptions, "scope">;

export function createQuotePostHandler(options: QuoteHandlerOptions) {
  return createPublicLeadHandler({ ...options, scope: "quote" });
}

export const POST = createQuotePostHandler({
  submit: submitQuote,
  publicUrl: process.env.NEXT_PUBLIC_SITE_URL,
});
