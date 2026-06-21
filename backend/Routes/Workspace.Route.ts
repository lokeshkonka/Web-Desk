import type { FastifyInstance } from "fastify";
import * as WorkspaceController from "../Controller/Workspace.Controller";

export const workspaceRoutes = async (app: FastifyInstance) => {
  app.get("/workspace", WorkspaceController.getWorkspace);
  app.patch("/workspace", WorkspaceController.updateWorkspace);
};
