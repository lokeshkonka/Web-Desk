import type { FastifyInstance } from "fastify";
import { handleTerminalWebSocket, closeTerminalSession } from "../Controller/Terminal.Controller";

export const terminalRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/terminal", { websocket: true }, handleTerminalWebSocket as any);
  fastify.delete("/terminal/:sessionId", closeTerminalSession);
};
