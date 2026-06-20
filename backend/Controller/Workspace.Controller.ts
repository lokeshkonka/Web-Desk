import { FastifyRequest, FastifyReply } from "fastify";
import * as WorkspaceService from "../Services/Workspace.Service";

export const getWorkspace = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const workspace = await WorkspaceService.getWorkspace();
    return reply.status(200).send(workspace);
  } catch (error) {
    req.log.error(error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export const updateWorkspace = async (
  req: FastifyRequest<{ Body: { id: string; theme?: string; wallpaper?: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id, theme, wallpaper } = req.body;
    if (!id) {
        return reply.status(400).send({ error: "Missing workspace id" });
    }
    const workspace = await WorkspaceService.updateWorkspace(id, theme, wallpaper);
    return reply.status(200).send(workspace);
  } catch (error) {
    req.log.error(error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};
