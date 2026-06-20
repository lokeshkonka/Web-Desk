import { FastifyInstance } from "fastify";
import * as WorkspaceController from "../Controller/Workspace.Controller";

export const workspaceRoutes = async (app: FastifyInstance) => {
  app.get("/api/workspace", WorkspaceController.getWorkspace);
  app.patch("/api/workspace", WorkspaceController.updateWorkspace);
};
