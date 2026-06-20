import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createWorkspace = async (theme: string, wallpaper: string) => {
  return await prisma.workspace.create({
    data: { theme, wallpaper },
  });
};

export const getWorkspace = async () => {
  const workspaces = await prisma.workspace.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1,
  });
  
  if (workspaces.length === 0) {
    return await createWorkspace('cozy-retro', 'pixel-cafe.png');
  }
  
  return workspaces[0];
};

export const updateWorkspace = async (id: string, theme?: string, wallpaper?: string) => {
  const data: any = {};
  if (theme) data.theme = theme;
  if (wallpaper) data.wallpaper = wallpaper;
  
  return await prisma.workspace.update({
    where: { id },
    data,
  });
};
