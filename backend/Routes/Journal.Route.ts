import type { FastifyInstance } from "fastify";
import * as JournalController from "../Controller/Journal.Controller";

export const journalRoutes = async (app: FastifyInstance) => {
  app.get("/journal", JournalController.getEntries);
  app.post("/journal", JournalController.createEntry);
  app.patch("/journal/:id", JournalController.updateEntry);
  app.delete("/journal/:id", JournalController.deleteEntry);
};
