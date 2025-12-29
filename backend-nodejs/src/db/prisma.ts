import { PrismaClient } from "@prisma/client";

// Add type for global prisma
declare global {
  var __prisma: PrismaClient | undefined;
}

const prisma = globalThis.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  // Avoid multiple instances in dev/watch mode
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.__prisma = prisma;
}

export default prisma;