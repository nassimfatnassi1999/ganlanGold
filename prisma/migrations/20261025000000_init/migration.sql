-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('NEW', 'CONTACTED', 'IN_NEGOTIATION', 'QUOTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('NEW', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CLOSED', 'DECLINED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('NOT_CONFIGURED', 'PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "ExchangeRateStatus" AS ENUM ('VALID', 'FAILED');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" UUID NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "idleExpiresAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" VARCHAR(16) NOT NULL,
    "slug" VARCHAR(32) NOT NULL,
    "capacityMl" INTEGER NOT NULL,
    "capacityLitres" DECIMAL(8,3) NOT NULL,
    "usdPrice" DECIMAL(10,2) NOT NULL,
    "imagePath" VARCHAR(255) NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "professional" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTranslation" (
    "productId" VARCHAR(16) NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "label" VARCHAR(180) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductTranslation_pkey" PRIMARY KEY ("productId","locale")
);

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" UUID NOT NULL,
    "requestId" VARCHAR(40) NOT NULL,
    "company" VARCHAR(200) NOT NULL,
    "country" VARCHAR(120) NOT NULL,
    "contactPerson" VARCHAR(160) NOT NULL,
    "email" VARCHAR(320),
    "wechat" VARCHAR(160),
    "destinationPort" VARCHAR(180) NOT NULL,
    "message" TEXT,
    "totalLitres" DECIMAL(14,3) NOT NULL,
    "belowMinimum" BOOLEAN NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "consentText" TEXT NOT NULL,
    "consentVersion" VARCHAR(32) NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'NEW',
    "internalNotes" TEXT,
    "submissionFingerprint" CHAR(64) NOT NULL,
    "ipHash" CHAR(64),
    "notificationStatus" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "notificationError" VARCHAR(500),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteRequestItem" (
    "id" UUID NOT NULL,
    "quoteRequestId" UUID NOT NULL,
    "productId" VARCHAR(16) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "capacityLitres" DECIMAL(8,3) NOT NULL,
    "usdReferencePrice" DECIMAL(10,2) NOT NULL,
    "requestedVolumeLitres" DECIMAL(14,3) NOT NULL,

    CONSTRAINT "QuoteRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitRequest" (
    "id" UUID NOT NULL,
    "requestId" VARCHAR(40) NOT NULL,
    "company" VARCHAR(200) NOT NULL,
    "contactPerson" VARCHAR(160) NOT NULL,
    "country" VARCHAR(120) NOT NULL,
    "contact" VARCHAR(320) NOT NULL,
    "preferredPeriod" VARCHAR(180) NOT NULL,
    "visitors" INTEGER,
    "message" TEXT,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "consentText" TEXT NOT NULL,
    "consentVersion" VARCHAR(32) NOT NULL,
    "status" "VisitStatus" NOT NULL DEFAULT 'NEW',
    "internalNotes" TEXT,
    "submissionFingerprint" CHAR(64) NOT NULL,
    "ipHash" CHAR(64),
    "notificationStatus" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "notificationError" VARCHAR(500),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" UUID NOT NULL,
    "source" VARCHAR(32) NOT NULL DEFAULT 'ECB',
    "status" "ExchangeRateStatus" NOT NULL,
    "eurUsd" DECIMAL(18,8),
    "eurCny" DECIMAL(18,8),
    "usdCny" DECIMAL(18,8),
    "referenceDate" DATE,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "errorCode" VARCHAR(80),
    "errorMessage" VARCHAR(500),

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "key" VARCHAR(120) NOT NULL,
    "value" JSONB NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(80) NOT NULL,
    "entityId" VARCHAR(120),
    "before" JSONB,
    "after" JSONB,
    "ipHash" CHAR(64),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "id" UUID NOT NULL,
    "scope" VARCHAR(80) NOT NULL,
    "keyHash" CHAR(64) NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_userId_revokedAt_idx" ON "AdminSession"("userId", "revokedAt");

-- CreateIndex
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_displayOrder_key" ON "Product"("displayOrder");

-- CreateIndex
CREATE INDEX "ProductTranslation_locale_idx" ON "ProductTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteRequest_requestId_key" ON "QuoteRequest"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteRequest_submissionFingerprint_key" ON "QuoteRequest"("submissionFingerprint");

-- CreateIndex
CREATE INDEX "QuoteRequest_status_submittedAt_idx" ON "QuoteRequest"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "QuoteRequest_company_idx" ON "QuoteRequest"("company");

-- CreateIndex
CREATE INDEX "QuoteRequest_country_idx" ON "QuoteRequest"("country");

-- CreateIndex
CREATE INDEX "QuoteRequestItem_productId_idx" ON "QuoteRequestItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteRequestItem_quoteRequestId_productId_key" ON "QuoteRequestItem"("quoteRequestId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "VisitRequest_requestId_key" ON "VisitRequest"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "VisitRequest_submissionFingerprint_key" ON "VisitRequest"("submissionFingerprint");

-- CreateIndex
CREATE INDEX "VisitRequest_status_submittedAt_idx" ON "VisitRequest"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "VisitRequest_company_idx" ON "VisitRequest"("company");

-- CreateIndex
CREATE INDEX "ExchangeRate_status_referenceDate_idx" ON "ExchangeRate"("status", "referenceDate");

-- CreateIndex
CREATE INDEX "ExchangeRate_attemptedAt_idx" ON "ExchangeRate"("attemptedAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "RateLimitBucket_windowStart_idx" ON "RateLimitBucket"("windowStart");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimitBucket_scope_keyHash_windowStart_key" ON "RateLimitBucket"("scope", "keyHash", "windowStart");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTranslation" ADD CONSTRAINT "ProductTranslation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequestItem" ADD CONSTRAINT "QuoteRequestItem_quoteRequestId_fkey" FOREIGN KEY ("quoteRequestId") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequestItem" ADD CONSTRAINT "QuoteRequestItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
