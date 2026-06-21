import { prisma } from "../Configs/db";
import { redis } from "../Configs/redis";
import fs from "fs/promises";
import path from "path";

export const checkHealth = async () => {
  let database = "disconnected";
  let redisStatus = "disconnected";
  let storage = "disconnected";

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "connected";
  } catch (e) {}

  try {
    const ping = await redis.ping();
    if (ping === "PONG") redisStatus = "connected";
  } catch (e) {}

  try {
    await fs.access(path.join(process.cwd(), "uploads"));
    storage = "connected";
  } catch (e) {}

  return {
    status: (database === "connected" && redisStatus === "connected" && storage === "connected") ? "ok" : "degraded",
    database,
    redis: redisStatus,
    storage,
    timestamp: new Date().toISOString(),
  };
};