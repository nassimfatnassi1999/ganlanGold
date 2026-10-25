import { describe, expect, it } from "vitest";
import { visitUpdateSchema } from "./visits";

describe("visit administration contract", () => {
  it.each(["NEW", "CONTACTED", "SCHEDULED", "COMPLETED", "CLOSED", "DECLINED"])(
    "accepts the supported status: %s",
    (status) => {
      expect(visitUpdateSchema.safeParse({ requestId: "GGV-1", status, internalNotes: "Follow up" }).success).toBe(true);
    },
  );

  it("rejects unknown statuses and oversized notes", () => {
    expect(visitUpdateSchema.safeParse({ requestId: "GGV-1", status: "QUOTED", internalNotes: "" }).success).toBe(false);
    expect(
      visitUpdateSchema.safeParse({ requestId: "GGV-1", status: "NEW", internalNotes: "x".repeat(4001) }).success,
    ).toBe(false);
  });
});
