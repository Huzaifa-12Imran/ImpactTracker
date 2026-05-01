import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Re-export Prisma types for consumer packages
export { PrismaClient } from "@prisma/client";
export type {
  Repository,
  ImpactScore,
  Contributor,
  WebhookEvent,
  Installation,
  AppConfig,
  AnalysisStatus,
} from "@prisma/client";
