import { prisma } from '../Configs/db';

export class FileService {
  // Folders
  async getFolders(parentId?: string) {
    if (parentId) {
      return prisma.folder.findMany({ where: { parentId } });
    }
    return prisma.folder.findMany({ where: { parentId: null } });
  }

  async createFolder(name: string, parentId?: string) {
    return prisma.folder.create({
      data: { name, parentId },
    });
  }

  async updateFolder(id: string, name: string) {
    return prisma.folder.update({
      where: { id },
      data: { name },
    });
  }

  async deleteFolder(id: string) {
    // Note: A real implementation would recursively delete or cascade.
    // For now, we just delete the specific folder.
    return prisma.folder.delete({
      where: { id },
    });
  }

  // Files
  async getFiles(folderId?: string) {
    if (folderId) {
      return prisma.file.findMany({ where: { folderId, isDeleted: false } });
    }
    return prisma.file.findMany({ where: { folderId: null, isDeleted: false } });
  }

  async getTrash() {
    return prisma.file.findMany({ where: { isDeleted: true } });
  }

  async createFile(name: string, type: string, size: number, folderId?: string) {
    return prisma.file.create({
      data: { name, type, size, folderId },
    });
  }

  async updateFile(id: string, name: string) {
    return prisma.file.update({
      where: { id },
      data: { name },
    });
  }

  async deleteFile(id: string) {
    return prisma.file.delete({
      where: { id },
    });
  }
}
