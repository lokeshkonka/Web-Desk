import { PrismaClient } from "@prisma/client";
import { redis } from "../Configs/redis";

const prisma = new PrismaClient();
const CACHE_KEY = "workspace:current";

export const createWorkspace = async (theme: string, wallpaper: string) => {
  const ws = await prisma.workspace.create({
    data: { theme, wallpaper },
  });
  await redis.set(CACHE_KEY, JSON.stringify(ws));
  return ws;
};

export const getWorkspace = async () => {
  const cached = await redis.get(CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const workspaces = await prisma.workspace.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1,
  });
  
  if (workspaces.length === 0) {
    return await createWorkspace('cozy-retro', 'pixel-cafe.png');
  }
  
  await redis.set(CACHE_KEY, JSON.stringify(workspaces[0]));
  return workspaces[0];
};

export const updateWorkspace = async (id: string, theme?: string, wallpaper?: string) => {
  const data: any = {};
  if (theme) data.theme = theme;
  if (wallpaper) data.wallpaper = wallpaper;
  
  const ws = await prisma.workspace.update({
    where: { id },
    data,
  });
  await redis.set(CACHE_KEY, JSON.stringify(ws));
  return ws;
};
