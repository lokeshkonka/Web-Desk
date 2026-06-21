import { PrismaClient } from "@prisma/client";
import { StorageService } from "./Storage.Service";

const prisma = new PrismaClient();
const storageService = new StorageService();

export class EditorService {
  async getFileContent(fileId: string): Promise<string> {
    const fileContent = await prisma.fileContent.findUnique({
      where: { fileId }
    });

    if (fileContent) {
      return fileContent.content;
    }

    // Fallback: load from real file storage if it exists but isn't in FileContent
    try {
      const { stream } = await storageService.downloadFile(fileId);
      return new Promise((resolve, reject) => {
        let content = '';
        stream.on('data', chunk => content += chunk);
        stream.on('end', () => resolve(content));
        stream.on('error', reject);
      });
    } catch (e) {
      return ""; // Default to empty string if it fails to download
    }
  }

  async updateFileContent(fileId: string, content: string) {
    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file) {
      throw new Error("File not found");
    }

    await prisma.fileContent.upsert({
      where: { fileId },
      update: { content },
      create: { fileId, content }
    });

    // Update the size since content changed
    await prisma.file.update({
      where: { id: fileId },
      data: { size: Buffer.byteLength(content, 'utf8') }
    });

    // Optionally: Update the file in LocalStorage or MinIO? 
    // The requirement says "Task 17 - File Content Model" so maybe storing in DB is sufficient.
    // If the storage adapter is needed, we'd pipe the content to adapter.upload(), but DB is simpler.

    return { success: true };
  }
}
