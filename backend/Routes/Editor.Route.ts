import type { FastifyInstance } from "fastify";
import { getFileContent, updateFileContent } from "../Controller/Editor.Controller";

export const editorRoutes = async (app: FastifyInstance) => {
  app.get("/editor/file/:id", getFileContent);
  app.patch("/editor/file/:id", updateFileContent);
};
