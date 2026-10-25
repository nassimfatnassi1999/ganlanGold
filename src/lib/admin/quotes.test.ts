import { describe, expect, it } from "vitest";
import { quoteUpdateSchema } from "./quotes";

describe("quote administration contract", () => {
  it.each(["NEW", "CONTACTED", "IN_NEGOTIATION", "QUOTED", "CLOSED"])("accepts the supported status: %s", (status) => {
    expect(quoteUpdateSchema.safeParse({ requestId: "GGQ-1", status, internalNotes: "Follow up" }).success).toBe(true);
  });

  it("rejects unknown statuses and oversized notes", () => {
    expect(quoteUpdateSchema.safeParse({ requestId: "GGQ-1", status: "DELETED", internalNotes: "" }).success).toBe(false);
    expect(
      quoteUpdateSchema.safeParse({ requestId: "GGQ-1", status: "NEW", internalNotes: "x".repeat(4001) }).success,
    ).toBe(false);
  });
});
