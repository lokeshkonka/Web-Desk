import type { FastifyRequest, FastifyReply } from "fastify";
import { EditorService } from "../Services/Editor.Service";

const editorService = new EditorService();

export const getFileContent = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const content = await editorService.getFileContent(req.params.id);
    return reply.send({ content });
  } catch (error: any) {
    return reply.status(404).send({ error: error.message });
  }
};

export const updateFileContent = async (req: FastifyRequest<{ Params: { id: string }, Body: { content: string } }>, reply: FastifyReply) => {
  try {
    await editorService.updateFileContent(req.params.id, req.body.content);
    return reply.send({ success: true });
  } catch (error: any) {
    return reply.status(500).send({ error: error.message });
  }
};
