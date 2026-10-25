import { submitVisit } from "@/lib/leads/service";
import { createPublicLeadHandler, type PublicLeadHandlerOptions } from "@/lib/leads/http";

type VisitHandlerOptions = Omit<PublicLeadHandlerOptions, "scope">;

export function createVisitPostHandler(options: VisitHandlerOptions) {
  return createPublicLeadHandler({ ...options, scope: "visit" });
}

export const POST = createVisitPostHandler({
  submit: submitVisit,
  publicUrl: process.env.NEXT_PUBLIC_SITE_URL,
});
