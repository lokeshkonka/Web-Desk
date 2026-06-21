import type { FastifyInstance } from "fastify";
import {
  listContainers,
  createContainer,
  startContainer,
  stopContainer,
  removeContainer,
  getContainerLogs
} from "../Controller/Container.Controller";

export const containerRoutes = async (app: FastifyInstance) => {
  app.get("/containers", listContainers);
  app.post("/containers", createContainer);
  app.post("/containers/:id/start", startContainer);
  app.post("/containers/:id/stop", stopContainer);
  app.delete("/containers/:id", removeContainer);
  app.get("/containers/:id/logs", getContainerLogs);
};
