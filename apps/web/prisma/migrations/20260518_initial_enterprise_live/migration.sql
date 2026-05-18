DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
    CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ANALYST', 'ADMIN');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DetectionAssetType') THEN
    CREATE TYPE "DetectionAssetType" AS ENUM ('IMAGE', 'VIDEO');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DetectionStatus') THEN
    CREATE TYPE "DetectionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILURE');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentProvider') THEN
    CREATE TYPE "PaymentProvider" AS ENUM ('PAYGATE', 'STRIPE');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CheckoutSessionStatus') THEN
    CREATE TYPE "CheckoutSessionStatus" AS ENUM ('PENDING', 'REDIRECTED', 'COMPLETED', 'FAILED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuditStatus') THEN
    CREATE TYPE "AuditStatus" AS ENUM ('SUCCESS', 'FAILURE', 'PENDING');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuditActorType') THEN
    CREATE TYPE "AuditActorType" AS ENUM ('USER', 'SYSTEM', 'SERVICE');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE,
  "name" TEXT,
  "image" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "detection_jobs" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "assetType" "DetectionAssetType" NOT NULL,
  "status" "DetectionStatus" NOT NULL DEFAULT 'PENDING',
  "sourceName" TEXT,
  "provider" TEXT,
  "requestBody" JSONB,
  "responseBody" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "detection_jobs_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "checkout_sessions" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "planCode" TEXT NOT NULL,
  "amountCents" INTEGER,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "provider" "PaymentProvider" NOT NULL DEFAULT 'PAYGATE',
  "status" "CheckoutSessionStatus" NOT NULL DEFAULT 'PENDING',
  "checkoutUrl" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "checkout_sessions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "agent_conversations" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "provider" TEXT NOT NULL,
  "title" TEXT,
  "lastPrompt" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "agent_conversations_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "audit_events" (
  "id" TEXT PRIMARY KEY,
  "action" TEXT NOT NULL,
  "actorId" TEXT,
  "actorType" "AuditActorType" NOT NULL DEFAULT 'SYSTEM',
  "subjectId" TEXT,
  "subjectType" TEXT,
  "status" "AuditStatus" NOT NULL DEFAULT 'SUCCESS',
  "requestId" TEXT,
  "sourceIp" TEXT,
  "userAgent" TEXT,
  "details" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "detection_jobs_userId_createdAt_idx" ON "detection_jobs" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "detection_jobs_status_createdAt_idx" ON "detection_jobs" ("status", "createdAt");
CREATE INDEX IF NOT EXISTS "checkout_sessions_userId_createdAt_idx" ON "checkout_sessions" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "checkout_sessions_status_createdAt_idx" ON "checkout_sessions" ("status", "createdAt");
CREATE INDEX IF NOT EXISTS "agent_conversations_userId_updatedAt_idx" ON "agent_conversations" ("userId", "updatedAt");
CREATE INDEX IF NOT EXISTS "audit_events_action_createdAt_idx" ON "audit_events" ("action", "createdAt");
CREATE INDEX IF NOT EXISTS "audit_events_actorId_createdAt_idx" ON "audit_events" ("actorId", "createdAt");
CREATE INDEX IF NOT EXISTS "audit_events_status_createdAt_idx" ON "audit_events" ("status", "createdAt");
