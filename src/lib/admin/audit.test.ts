import { describe, expect, it } from "vitest";
import { createAuditEntry } from "./audit";

describe("createAuditEntry", () => {
  it("records actor, target, and before/after state", () => {
    expect(
      createAuditEntry({
        actorId: "admin-1",
        action: "product.price.update",
        entityType: "Product",
        entityId: "500ml",
        before: { usdPrice: "7.30" },
        after: { usdPrice: "7.35" },
        ipHash: "a".repeat(64),
      }),
    ).toEqual({
      actorId: "admin-1",
      action: "product.price.update",
      entityType: "Product",
      entityId: "500ml",
      before: { usdPrice: "7.30" },
      after: { usdPrice: "7.35" },
      ipHash: "a".repeat(64),
    });
  });
});
