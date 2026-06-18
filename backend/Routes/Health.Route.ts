import type { FastifyInstance } from "fastify";
import { healthController } from "../Controller/Health.Controller";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", healthController);
}