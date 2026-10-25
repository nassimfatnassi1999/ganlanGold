import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { refreshExchangeRate } from "@/lib/currency/service";

type RefreshFunction = typeof refreshExchangeRate;

function secretMatches(header: string | null, secret: string): boolean {
  if (!header?.startsWith("Bearer ")) return false;
  const supplied = Buffer.from(header.slice(7));
  const expected = Buffer.from(secret);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export function createCronHandler({ refresh, secret }: { refresh: RefreshFunction; secret?: string }) {
  return async function cronHandler(request: Request) {
    if (!secret || secret.length < 16) {
      return NextResponse.json({ error: "Currency refresh is not configured." }, { status: 503 });
    }
    if (!secretMatches(request.headers.get("authorization"), secret)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const state = await refresh();
    return NextResponse.json(state, { status: state.status === "available" ? 200 : 503 });
  };
}

export const GET = createCronHandler({ refresh: refreshExchangeRate, secret: process.env.CRON_SECRET });
