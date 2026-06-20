import type { FastifyRequest, FastifyReply } from 'fastify';
import { FileService } from '../Services/File.Service';

const fileService = new FileService();

export class FileController {
  // Folders
  async getFolders(req: FastifyRequest<{ Querystring: { parentId?: string } }>, reply: FastifyReply) {
    try {
      const folders = await fileService.getFolders(req.query.parentId);
      return reply.send(folders);
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to fetch folders' });
    }
  }

  async createFolder(req: FastifyRequest<{ Body: { name: string; parentId?: string } }>, reply: FastifyReply) {
    try {
      const { name, parentId } = req.body;
      const folder = await fileService.createFolder(name, parentId);
      return reply.send(folder);
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to create folder' });
    }
  }

  async updateFolder(req: FastifyRequest<{ Params: { id: string }; Body: { name: string } }>, reply: FastifyReply) {
    try {
      const folder = await fileService.updateFolder(req.params.id, req.body.name);
      return reply.send(folder);
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to update folder' });
    }
  }

  async deleteFolder(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      await fileService.deleteFolder(req.params.id);
      return reply.send({ success: true });
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to delete folder' });
    }
  }

  // Files
  async getFiles(req: FastifyRequest<{ Querystring: { folderId?: string } }>, reply: FastifyReply) {
    try {
      const files = await fileService.getFiles(req.query.folderId);
      return reply.send(files);
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to fetch files' });
    }
  }

  async createFile(req: FastifyRequest<{ Body: { name: string; type: string; size: number; folderId?: string } }>, reply: FastifyReply) {
    try {
      const { name, type, size, folderId } = req.body;
      const file = await fileService.createFile(name, type, size, folderId);
      return reply.send(file);
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to create file' });
    }
  }

  async updateFile(req: FastifyRequest<{ Params: { id: string }; Body: { name: string } }>, reply: FastifyReply) {
    try {
      const file = await fileService.updateFile(req.params.id, req.body.name);
      return reply.send(file);
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to update file' });
    }
  }

  async deleteFile(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      await fileService.deleteFile(req.params.id);
      return reply.send({ success: true });
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to delete file' });
    }
  }
}
