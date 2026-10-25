import { describe, expect, it, vi } from "vitest";
import { MemoryLeadRepository, submitQuote, submitVisit } from "./service";

const quoteInput = {
  company: "Atlas Import",
  country: "China",
  contactPerson: "Li Wei",
  email: "buyer@example.cn",
  wechat: "",
  destinationPort: "Nansha",
  products: [
    { productId: "250ml" as const, quantity: 5200 },
    { productId: "500ml" as const, quantity: 7500 },
    { productId: "750ml" as const, quantity: 3600 },
  ],
  message: "Please advise.",
  consent: true as const,
  website: "" as const,
};

const context = { ipHash: "a".repeat(64), now: new Date("2026-10-25T10:00:00Z") };

describe("submitQuote", () => {
  it("persists volume and consent before attempting notification", async () => {
    const repository = new MemoryLeadRepository();
    const notify = vi.fn(async () => {
      expect(repository.quotes).toHaveLength(1);
      return { status: "sent" as const, messageId: "mail-1" };
    });
    const result = await submitQuote(quoteInput, context, {
      repository,
      notify,
      fingerprintSecret: "fingerprint-test-secret",
      createRequestId: () => "GGQ-20261025-AAAA1111",
    });
    expect(result).toEqual({ requestId: "GGQ-20261025-AAAA1111", duplicate: false, notification: "sent" });
    expect(repository.quotes[0]).toMatchObject({ totalLitres: "7750.000", belowMinimum: false, consentVersion: "2026-10-25" });
    expect(repository.quotes[0]?.notificationStatus).toBe("SENT");
  });

  it("returns the existing request for a duplicate normalized submission", async () => {
    const repository = new MemoryLeadRepository();
    const dependencies = {
      repository,
      notify: vi.fn().mockResolvedValue({ status: "not-configured" as const }),
      fingerprintSecret: "fingerprint-test-secret",
      createRequestId: () => "GGQ-20261025-AAAA1111",
    };
    await submitQuote(quoteInput, context, dependencies);
    const duplicate = await submitQuote({ ...quoteInput, company: " Atlas Import " }, context, dependencies);
    expect(duplicate).toEqual({
      requestId: "GGQ-20261025-AAAA1111",
      duplicate: true,
      notification: "not-configured",
    });
    expect(repository.quotes).toHaveLength(1);
    expect(dependencies.notify).toHaveBeenCalledOnce();
  });

  it("flags a technically valid inquiry below the global commercial policy", async () => {
    const repository = new MemoryLeadRepository();
    await submitQuote({ ...quoteInput, products: [{ productId: "5l", quantity: 1 }] }, context, {
      repository,
      notify: vi.fn().mockResolvedValue({ status: "failed", errorCode: "delivery-failed" }),
      fingerprintSecret: "fingerprint-test-secret",
      createRequestId: () => "GGQ-20261025-BBBB2222",
    });
    expect(repository.quotes[0]).toMatchObject({ totalLitres: "5.000", belowMinimum: true, notificationStatus: "FAILED" });
  });
});

describe("submitVisit", () => {
  it("persists a request without promising a visit date", async () => {
    const repository = new MemoryLeadRepository();
    const result = await submitVisit(
      {
        company: "Atlas Import",
        country: "China",
        contactPerson: "Li Wei",
        email: "buyer@example.cn",
        wechat: "",
        preferredPeriod: "March 2027",
        visitors: 2,
        message: "Production visit",
        consent: true,
        website: "",
      },
      context,
      {
        repository,
        notify: vi.fn().mockResolvedValue({ status: "not-configured" }),
        fingerprintSecret: "fingerprint-test-secret",
        createRequestId: () => "GGV-20261025-CCCC3333",
      },
    );
    expect(result.requestId).toBe("GGV-20261025-CCCC3333");
    expect(repository.visits[0]).toMatchObject({ status: "NEW", preferredPeriod: "March 2027" });
    expect(JSON.stringify(repository.visits[0])).not.toContain("confirmed");
  });
});
