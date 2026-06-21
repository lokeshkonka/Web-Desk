import type { FastifyInstance } from "fastify";
import { uploadFile, downloadFile, deleteFile, restoreFile, permanentDeleteFile } from "../Controller/Upload.Controller";

export const uploadRoutes = async (fastify: FastifyInstance) => {
  fastify.post("/upload", uploadFile);
  fastify.get("/download/:id", downloadFile);
  fastify.delete("/upload/:id", deleteFile);
  fastify.post("/upload/:id/restore", restoreFile);
  fastify.delete("/upload/:id/permanent", permanentDeleteFile);
};
