import type { FastifyRequest, FastifyReply } from "fastify";
import { StorageService } from "../Services/Storage.Service";

const storageService = new StorageService();

export const uploadFile = async (req: FastifyRequest, reply: FastifyReply) => {
  const data = await req.file();
  if (!data) {
    return reply.status(400).send({ error: "No file uploaded" });
  }

  // extract folderId from fields if present
  let folderId: string | undefined;
  if (data.fields.folderId) {
    const field = data.fields.folderId;
    folderId = 'value' in field ? String(field.value) : undefined;
  }

  try {
    const fileRecord = await storageService.uploadFile(
      data.file,
      data.filename,
      data.mimetype,
      folderId
    );

    return reply.status(201).send(fileRecord);
  } catch (err) {
    req.log.error(err);
    return reply.status(500).send({ error: "Upload failed" });
  }
};

export const downloadFile = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const { stream, file } = await storageService.downloadFile(req.params.id);
    reply.header("Content-Disposition", `attachment; filename="${file.name}"`);
    reply.header("Content-Type", file.mimeType || "application/octet-stream");
    return reply.send(stream);
  } catch (err: any) {
    if (err.message === "File not found") {
      return reply.status(404).send({ error: "File not found" });
    }
    return reply.status(500).send({ error: "Download failed" });
  }
};

export const deleteFile = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    await storageService.moveToTrash(req.params.id);
    return reply.send({ success: true, message: "Moved to trash" });
  } catch (err) {
    return reply.status(500).send({ error: "Failed to delete file" });
  }
};

export const restoreFile = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    await storageService.restoreFile(req.params.id);
    return reply.send({ success: true, message: "Restored successfully" });
  } catch (err) {
    return reply.status(500).send({ error: "Failed to restore file" });
  }
};

export const permanentDeleteFile = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    await storageService.permanentDelete(req.params.id);
    return reply.send({ success: true, message: "Permanently deleted" });
  } catch (err) {
    return reply.status(500).send({ error: "Failed to permanently delete file" });
  }
};
