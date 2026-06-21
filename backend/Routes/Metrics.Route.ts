import type { FastifyInstance } from "fastify";
import { metricsController } from "../Controller/Metrics.Controller";

export async function metricsRoutes(app: FastifyInstance) {
  app.get("/metrics", metricsController);
}
