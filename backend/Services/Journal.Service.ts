import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getEntries = async () => {
  return await prisma.journalEntry.findMany({
    orderBy: { updatedAt: 'desc' },
  });
};

export const createEntry = async (title: string, content: string) => {
  return await prisma.journalEntry.create({
    data: { title, content },
  });
};

export const updateEntry = async (id: string, title?: string, content?: string) => {
  const data: any = {};
  if (title !== undefined) data.title = title;
  if (content !== undefined) data.content = content;
  
  return await prisma.journalEntry.update({
    where: { id },
    data,
  });
};

export const deleteEntry = async (id: string) => {
  return await prisma.journalEntry.delete({
    where: { id },
  });
};
