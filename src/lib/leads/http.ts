import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { hashClientKey, getClientAddress } from "@/lib/security/client-ip";
import { assertSameOrigin, RequestSecurityError } from "@/lib/security/origin";
import { consumeRateLimit, type RateLimitDecision } from "@/lib/security/rate-limit";
import type { LeadSubmissionResult } from "./types";

type Submit = (input: unknown, context: { ipHash?: string }) => Promise<LeadSubmissionResult>;
type RateLimit = (scope: string, key: string, policy: { limit: number; windowMs: number }) => Promise<RateLimitDecision>;

export type PublicLeadHandlerOptions = Readonly<{
  scope: "quote" | "visit";
  submit: Submit;
  rateLimit?: RateLimit;
  publicUrl?: string;
  maxBytes?: number;
}>;

function validationResponse(error: ZodError) {
  const fields = Object.fromEntries(
    error.issues.slice(0, 12).map((issue) => [String(issue.path[0] ?? "form"), issue.message.slice(0, 160)]),
  );
  return NextResponse.json(
    { error: "请检查提交内容。", english: "Please check the submitted information.", fields },
    { status: 400 },
  );
}

export function createPublicLeadHandler(options: PublicLeadHandlerOptions) {
  const maxBytes = options.maxBytes ?? 32_768;
  const limiter = options.rateLimit ?? consumeRateLimit;

  return async function publicLeadHandler(request: Request) {
    try {
      assertSameOrigin(request, options.publicUrl ?? new URL(request.url).origin);
      const contentLength = Number(request.headers.get("content-length") ?? 0);
      if (contentLength > maxBytes) {
        return NextResponse.json({ error: "提交内容过大。", english: "The request is too large." }, { status: 413 });
      }

      const raw = await request.text();
      if (new TextEncoder().encode(raw).byteLength > maxBytes) {
        return NextResponse.json({ error: "提交内容过大。", english: "The request is too large." }, { status: 413 });
      }

      const address = getClientAddress(request);
      const decision = await limiter(options.scope, address, { limit: options.scope === "quote" ? 5 : 4, windowMs: 60 * 60_000 });
      if (!decision.allowed) {
        return NextResponse.json(
          { error: "提交次数过多，请稍后再试。", english: "Too many requests. Please try again later." },
          { status: 429, headers: { "retry-after": String(decision.retryAfterSeconds) } },
        );
      }

      let body: unknown;
      try {
        body = JSON.parse(raw);
      } catch {
        return NextResponse.json({ error: "提交格式无效。", english: "Invalid request format." }, { status: 400 });
      }

      const privacySecret = process.env.PRIVACY_HASH_SECRET;
      const ipHash = privacySecret && privacySecret.length >= 16 ? hashClientKey(address, privacySecret) : undefined;
      const result = await options.submit(body, { ipHash });
      return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
    } catch (error) {
      if (error instanceof RequestSecurityError) {
        return NextResponse.json({ error: "请求来源无效。", english: "Request origin is not allowed." }, { status: error.status });
      }
      if (error instanceof ZodError) return validationResponse(error);
      return NextResponse.json(
        { error: "暂时无法处理请求，请稍后重试。", english: "The request could not be processed. Please try again." },
        { status: 500 },
      );
    }
  };
}
