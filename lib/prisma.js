import { PrismaClient } from "@prisma/client";

// Réutilise une seule instance de PrismaClient en développement
// (évite d'épuiser les connexions lors du hot-reload de Next.js).
// L'URL de connexion est lue depuis la variable d'environnement DATABASE_URL.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
