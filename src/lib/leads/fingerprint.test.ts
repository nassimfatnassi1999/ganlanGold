import { describe, expect, it } from "vitest";
import { createSubmissionFingerprint } from "./fingerprint";

describe("createSubmissionFingerprint", () => {
  it("is deterministic across object and product ordering", () => {
    const first = {
      company: "Atlas Trade",
      email: "buyer@example.cn",
      products: [
        { productId: "500ml", quantity: 10 },
        { productId: "250ml", quantity: 20 },
      ],
    };
    const second = {
      products: [
        { quantity: 20, productId: "250ml" },
        { quantity: 10, productId: "500ml" },
      ],
      email: "buyer@example.cn",
      company: "Atlas Trade",
    };
    expect(createSubmissionFingerprint(first, "secret")).toBe(createSubmissionFingerprint(second, "secret"));
  });

  it("changes when the payload or secret changes", () => {
    const payload = { company: "Atlas Trade", email: "buyer@example.cn" };
    const original = createSubmissionFingerprint(payload, "secret-a");
    expect(createSubmissionFingerprint({ ...payload, company: "Other" }, "secret-a")).not.toBe(original);
    expect(createSubmissionFingerprint(payload, "secret-b")).not.toBe(original);
  });

  it("returns only a fixed-length HMAC digest", () => {
    const fingerprint = createSubmissionFingerprint({ email: "personal@example.cn" }, "secret");
    expect(fingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(fingerprint).not.toContain("personal");
  });
});
