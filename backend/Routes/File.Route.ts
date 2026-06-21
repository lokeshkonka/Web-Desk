import type { FastifyInstance } from 'fastify';
import { FileController } from '../Controller/File.Controller';

export default async function fileRoutes(fastify: FastifyInstance) {
  const fileController = new FileController();

  // Folders
  fastify.get('/folders', fileController.getFolders.bind(fileController));
  fastify.post('/folders', fileController.createFolder.bind(fileController));
  fastify.patch('/folders/:id', fileController.updateFolder.bind(fileController));
  fastify.delete('/folders/:id', fileController.deleteFolder.bind(fileController));

  // Files
  fastify.get('/files', fileController.getFiles.bind(fileController));
  fastify.get('/files/trash', fileController.getTrash.bind(fileController));
  fastify.post('/files', fileController.createFile.bind(fileController));
  fastify.patch('/files/:id', fileController.updateFile.bind(fileController));
  fastify.delete('/files/:id', fileController.deleteFile.bind(fileController));
}
