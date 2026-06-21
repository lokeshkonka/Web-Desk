import type { StorageAdapter } from "../Adapters/Storage.Adapter";
import { LocalStorageAdapter } from "../Adapters/LocalStorage.Adapter";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export class StorageService {
  private adapter: StorageAdapter;

  constructor() {
    // We can swap this with MinIOAdapter in the future based on env vars
    this.adapter = new LocalStorageAdapter();
  }

  async uploadFile(
    stream: NodeJS.ReadableStream,
    originalName: string,
    mimeType: string,
    folderId?: string
  ) {
    const parts = originalName.split(".");
    const ext = parts.length > 1 ? parts.pop() : "";
    const uniqueFilename = `${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;

    const { path, size } = await this.adapter.upload(stream, uniqueFilename);

    const file = await prisma.file.create({
      data: {
        name: originalName,
        type: ext || "",
        mimeType,
        size,
        path,
        folderId,
      },
    });

    return file;
  }

  async downloadFile(fileId: string) {
    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file || !file.path || file.isDeleted) {
      throw new Error("File not found");
    }

    const stream = await this.adapter.stream(file.path);
    return { stream, file };
  }

  async moveToTrash(fileId: string) {
    return prisma.file.update({
      where: { id: fileId },
      data: { isDeleted: true },
    });
  }

  async restoreFile(fileId: string) {
    return prisma.file.update({
      where: { id: fileId },
      data: { isDeleted: false },
    });
  }

  async permanentDelete(fileId: string) {
    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file || !file.path) {
      throw new Error("File not found");
    }

    await this.adapter.delete(file.path);
    await prisma.file.delete({ where: { id: fileId } });

    return true;
  }
}
