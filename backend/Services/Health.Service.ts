import { prisma } from "../Configs/db";

export const checkHealth = async () => {
  await prisma.$queryRaw`SELECT 1`;

  return {
    status: "ok",
    database: "connected",
    timestamp: new Date().toISOString(),
  };
};