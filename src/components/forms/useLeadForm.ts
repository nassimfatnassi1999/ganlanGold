"use client";

import { useState, type FormEvent } from "react";
import { useHydrated } from "@/components/ui/useHydrated";

type Result = Readonly<{ requestId: string; duplicate: boolean; notification: string }>;

export function useLeadForm<T>(options: {
  endpoint: string;
  validate: (form: HTMLFormElement) => { data?: T; errors: string[] };
}) {
  const [state, setState] = useState<
    | { status: "idle" | "submitting" }
    | { status: "error"; errors: string[] }
    | { status: "success"; result: Result }
  >({ status: "idle" });
  const hydrated = useHydrated();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = options.validate(event.currentTarget);
    if (!validation.data || validation.errors.length) {
      setState({ status: "error", errors: validation.errors.length ? validation.errors : ["请填写所有必填信息。"] });
      return;
    }
    setState({ status: "submitting" });
    try {
      const response = await fetch(options.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validation.data),
      });
      const body = (await response.json()) as Partial<Result> & { error?: string; english?: string; fields?: Record<string, string> };
      if (!response.ok || !body.requestId) {
        const errors = body.fields ? Object.values(body.fields) : [body.error ?? "提交未完成，请稍后重试。"];
        setState({ status: "error", errors });
        return;
      }
      setState({ status: "success", result: body as Result });
      event.currentTarget?.reset?.();
    } catch {
      setState({ status: "error", errors: ["提交未完成，请检查网络后重试。"] });
    }
  }

  return { state, submit, hydrated };
}

export function text(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}
