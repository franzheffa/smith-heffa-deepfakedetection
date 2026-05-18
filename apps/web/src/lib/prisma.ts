import { PrismaClient } from "@prisma/client";

declare global {
  var __smithHeffaPrisma: PrismaClient | undefined;
}

export function getPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured for the Next.js enterprise app.");
  }

  if (!globalThis.__smithHeffaPrisma) {
    globalThis.__smithHeffaPrisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  return globalThis.__smithHeffaPrisma;
}
