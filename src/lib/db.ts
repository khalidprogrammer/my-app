// Prisma Client singleton (Architecture.md §2: src/lib/db.ts).
// Reuses one client across hot-reloads in development to avoid
// exhausting MySQL connections with `next dev`.
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export default db;
