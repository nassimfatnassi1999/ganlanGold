import { randomBytes } from "node:crypto";
import { Prisma, type NotificationStatus, type PrismaClient } from "@prisma/client";
import type { NotificationResult } from "@/lib/email/mailer";
import { sendLeadNotification } from "@/lib/email/mailer";
import { PRODUCT_SPECS } from "@/lib/products/catalog";
import { createSubmissionFingerprint } from "./fingerprint";
import {
  quoteRequestSchema,
  visitRequestSchema,
  type ParsedQuoteRequest,
  type ParsedVisitRequest,
} from "./schemas";
import type { LeadRequestContext, LeadSubmissionResult } from "./types";
import { calculateRequestedLitres } from "./volume";

const MINIMUM_LITRES = new Prisma.Decimal("7500");
const CONSENT_VERSION = "2026-10-25";
const QUOTE_CONSENT = "我同意 GANLAN GOLD 使用以上信息处理本次询价。 / I consent to GANLAN GOLD using this information to handle my quotation request.";
const VISIT_CONSENT = "我同意 GANLAN GOLD 使用以上信息处理本次考察申请。 / I consent to GANLAN GOLD using this information to handle my visit request.";

type ExistingLead = { requestId: string; notificationStatus: NotificationStatus };

export type StoredQuote = ParsedQuoteRequest & {
  requestId: string;
  submissionFingerprint: string;
  totalLitres: string;
  belowMinimum: boolean;
  consentAt: Date;
  consentText: string;
  consentVersion: string;
  status: "NEW";
  notificationStatus: NotificationStatus;
  ipHash?: string;
};

export type StoredVisit = ParsedVisitRequest & {
  requestId: string;
  submissionFingerprint: string;
  consentAt: Date;
  consentText: string;
  consentVersion: string;
  status: "NEW";
  notificationStatus: NotificationStatus;
  ipHash?: string;
};

export class DuplicateSubmissionError extends Error {
  constructor() {
    super("Duplicate submission");
    this.name = "DuplicateSubmissionError";
  }
}

export interface LeadRepository {
  findQuoteByFingerprint(fingerprint: string): Promise<ExistingLead | null>;
  createQuote(quote: StoredQuote): Promise<void>;
  updateQuoteNotification(requestId: string, result: NotificationResult): Promise<void>;
  findVisitByFingerprint(fingerprint: string): Promise<ExistingLead | null>;
  createVisit(visit: StoredVisit): Promise<void>;
  updateVisitNotification(requestId: string, result: NotificationResult): Promise<void>;
}

function notificationStatus(result: NotificationResult): NotificationStatus {
  if (result.status === "sent") return "SENT";
  if (result.status === "failed") return "FAILED";
  return "NOT_CONFIGURED";
}

function publicNotification(status: NotificationStatus): LeadSubmissionResult["notification"] {
  if (status === "SENT") return "sent";
  if (status === "FAILED") return "failed";
  return "not-configured";
}

export class MemoryLeadRepository implements LeadRepository {
  readonly quotes: StoredQuote[] = [];
  readonly visits: StoredVisit[] = [];

  async findQuoteByFingerprint(fingerprint: string): Promise<ExistingLead | null> {
    const quote = this.quotes.find((entry) => entry.submissionFingerprint === fingerprint);
    return quote ? { requestId: quote.requestId, notificationStatus: quote.notificationStatus } : null;
  }

  async createQuote(quote: StoredQuote): Promise<void> {
    if (await this.findQuoteByFingerprint(quote.submissionFingerprint)) throw new DuplicateSubmissionError();
    this.quotes.push(structuredClone(quote));
  }

  async updateQuoteNotification(requestId: string, result: NotificationResult): Promise<void> {
    const quote = this.quotes.find((entry) => entry.requestId === requestId);
    if (quote) quote.notificationStatus = notificationStatus(result);
  }

  async findVisitByFingerprint(fingerprint: string): Promise<ExistingLead | null> {
    const visit = this.visits.find((entry) => entry.submissionFingerprint === fingerprint);
    return visit ? { requestId: visit.requestId, notificationStatus: visit.notificationStatus } : null;
  }

  async createVisit(visit: StoredVisit): Promise<void> {
    if (await this.findVisitByFingerprint(visit.submissionFingerprint)) throw new DuplicateSubmissionError();
    this.visits.push(structuredClone(visit));
  }

  async updateVisitNotification(requestId: string, result: NotificationResult): Promise<void> {
    const visit = this.visits.find((entry) => entry.requestId === requestId);
    if (visit) visit.notificationStatus = notificationStatus(result);
  }
}

export class PrismaLeadRepository implements LeadRepository {
  constructor(private readonly client: PrismaClient) {}

  async findQuoteByFingerprint(fingerprint: string): Promise<ExistingLead | null> {
    return this.client.quoteRequest.findUnique({
      where: { submissionFingerprint: fingerprint },
      select: { requestId: true, notificationStatus: true },
    });
  }

  async createQuote(quote: StoredQuote): Promise<void> {
    try {
      await this.client.$transaction(async (transaction) => {
        const products = await transaction.product.findMany({
          where: { id: { in: quote.products.map((item) => item.productId) }, active: true },
        });
        if (products.length !== quote.products.length) throw new Error("One or more selected products are unavailable");
        const byId = new Map(products.map((product) => [product.id, product]));

        await transaction.quoteRequest.create({
          data: {
            requestId: quote.requestId,
            company: quote.company,
            country: quote.country,
            contactPerson: quote.contactPerson,
            email: quote.email,
            wechat: quote.wechat,
            destinationPort: quote.destinationPort,
            message: quote.message,
            totalLitres: quote.totalLitres,
            belowMinimum: quote.belowMinimum,
            consentAt: quote.consentAt,
            consentText: quote.consentText,
            consentVersion: quote.consentVersion,
            submissionFingerprint: quote.submissionFingerprint,
            ipHash: quote.ipHash,
            notificationStatus: "PENDING",
            submittedAt: quote.consentAt,
            items: {
              create: quote.products.map((item) => {
                const product = byId.get(item.productId)!;
                return {
                  productId: item.productId,
                  quantity: item.quantity,
                  capacityLitres: product.capacityLitres,
                  usdReferencePrice: product.usdPrice,
                  requestedVolumeLitres: product.capacityLitres.times(item.quantity),
                };
              }),
            },
          },
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new DuplicateSubmissionError();
      }
      throw error;
    }
  }

  async updateQuoteNotification(requestId: string, result: NotificationResult): Promise<void> {
    await this.client.quoteRequest.update({
      where: { requestId },
      data: {
        notificationStatus: notificationStatus(result),
        notificationError: result.status === "failed" ? result.errorCode : null,
      },
    });
  }

  async findVisitByFingerprint(fingerprint: string): Promise<ExistingLead | null> {
    return this.client.visitRequest.findUnique({
      where: { submissionFingerprint: fingerprint },
      select: { requestId: true, notificationStatus: true },
    });
  }

  async createVisit(visit: StoredVisit): Promise<void> {
    try {
      await this.client.visitRequest.create({
        data: {
          requestId: visit.requestId,
          company: visit.company,
          country: visit.country,
          contactPerson: visit.contactPerson,
          contact: [visit.email ? `Email: ${visit.email}` : null, visit.wechat ? `WeChat: ${visit.wechat}` : null]
            .filter(Boolean)
            .join(" | "),
          preferredPeriod: visit.preferredPeriod,
          visitors: visit.visitors,
          message: visit.message,
          consentAt: visit.consentAt,
          consentText: visit.consentText,
          consentVersion: visit.consentVersion,
          submissionFingerprint: visit.submissionFingerprint,
          ipHash: visit.ipHash,
          notificationStatus: "PENDING",
          submittedAt: visit.consentAt,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new DuplicateSubmissionError();
      }
      throw error;
    }
  }

  async updateVisitNotification(requestId: string, result: NotificationResult): Promise<void> {
    await this.client.visitRequest.update({
      where: { requestId },
      data: {
        notificationStatus: notificationStatus(result),
        notificationError: result.status === "failed" ? result.errorCode : null,
      },
    });
  }
}

type LeadDependencies = Readonly<{
  repository?: LeadRepository;
  notify?: typeof sendLeadNotification;
  fingerprintSecret?: string;
  createRequestId?: (prefix: "GGQ" | "GGV", now: Date) => string;
}>;

async function defaultRepository(): Promise<LeadRepository> {
  const { prisma } = await import("@/lib/db/client");
  return new PrismaLeadRepository(prisma);
}

function defaultRequestId(prefix: "GGQ" | "GGV", now: Date): string {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const random = randomBytes(5).toString("hex").toUpperCase();
  return `${prefix}-${date}-${random}`;
}

function fingerprintSecret(dependencies: LeadDependencies): string {
  const secret = dependencies.fingerprintSecret ?? process.env.SUBMISSION_FINGERPRINT_SECRET;
  if (!secret || secret.length < 16) throw new Error("SUBMISSION_FINGERPRINT_SECRET must contain at least 16 characters");
  return secret;
}

async function existingResult(existing: ExistingLead | null): Promise<LeadSubmissionResult | null> {
  return existing
    ? { requestId: existing.requestId, duplicate: true, notification: publicNotification(existing.notificationStatus) }
    : null;
}

export async function submitQuote(
  input: unknown,
  context: LeadRequestContext = {},
  dependencies: LeadDependencies = {},
): Promise<LeadSubmissionResult> {
  const parsed = quoteRequestSchema.parse(input);
  const repository = dependencies.repository ?? (await defaultRepository());
  const now = context.now ?? new Date();
  const fingerprint = createSubmissionFingerprint(parsed, fingerprintSecret(dependencies));
  const duplicate = await existingResult(await repository.findQuoteByFingerprint(fingerprint));
  if (duplicate) return duplicate;

  const totalLitres = calculateRequestedLitres(parsed.products);
  const requestId = (dependencies.createRequestId ?? defaultRequestId)("GGQ", now);
  const stored: StoredQuote = {
    ...parsed,
    requestId,
    submissionFingerprint: fingerprint,
    totalLitres: totalLitres.toFixed(3),
    belowMinimum: totalLitres.lt(MINIMUM_LITRES),
    consentAt: now,
    consentText: QUOTE_CONSENT,
    consentVersion: CONSENT_VERSION,
    status: "NEW",
    notificationStatus: "PENDING",
    ipHash: context.ipHash,
  };

  try {
    await repository.createQuote(stored);
  } catch (error) {
    if (!(error instanceof DuplicateSubmissionError)) throw error;
    const concurrent = await existingResult(await repository.findQuoteByFingerprint(fingerprint));
    if (concurrent) return concurrent;
    throw error;
  }

  const notify = dependencies.notify ?? sendLeadNotification;
  const result = await notify({
    subject: `New quote request ${requestId}`,
    text: [
      `Request: ${requestId}`,
      `Company: ${parsed.company}`,
      `Country: ${parsed.country}`,
      `Contact: ${parsed.contactPerson}`,
      `Total litres: ${totalLitres.toFixed(3)}`,
      `Destination port: ${parsed.destinationPort}`,
    ].join("\n"),
    replyTo: parsed.email,
  });
  await repository.updateQuoteNotification(requestId, result);
  return { requestId, duplicate: false, notification: publicNotification(notificationStatus(result)) };
}

export async function submitVisit(
  input: unknown,
  context: LeadRequestContext = {},
  dependencies: LeadDependencies = {},
): Promise<LeadSubmissionResult> {
  const parsed = visitRequestSchema.parse(input);
  const repository = dependencies.repository ?? (await defaultRepository());
  const now = context.now ?? new Date();
  const fingerprint = createSubmissionFingerprint(parsed, fingerprintSecret(dependencies));
  const duplicate = await existingResult(await repository.findVisitByFingerprint(fingerprint));
  if (duplicate) return duplicate;

  const requestId = (dependencies.createRequestId ?? defaultRequestId)("GGV", now);
  const stored: StoredVisit = {
    ...parsed,
    requestId,
    submissionFingerprint: fingerprint,
    consentAt: now,
    consentText: VISIT_CONSENT,
    consentVersion: CONSENT_VERSION,
    status: "NEW",
    notificationStatus: "PENDING",
    ipHash: context.ipHash,
  };
  try {
    await repository.createVisit(stored);
  } catch (error) {
    if (!(error instanceof DuplicateSubmissionError)) throw error;
    const concurrent = await existingResult(await repository.findVisitByFingerprint(fingerprint));
    if (concurrent) return concurrent;
    throw error;
  }

  const notify = dependencies.notify ?? sendLeadNotification;
  const result = await notify({
    subject: `New visit request ${requestId}`,
    text: [
      `Request: ${requestId}`,
      `Company: ${parsed.company}`,
      `Country: ${parsed.country}`,
      `Contact: ${parsed.contactPerson}`,
      `Preferred period: ${parsed.preferredPeriod}`,
    ].join("\n"),
    replyTo: parsed.email,
  });
  await repository.updateVisitNotification(requestId, result);
  return { requestId, duplicate: false, notification: publicNotification(notificationStatus(result)) };
}

export const GLOBAL_MINIMUM_LITRES = MINIMUM_LITRES.toNumber();
export const PUBLIC_PRODUCT_COUNT = PRODUCT_SPECS.length;
