import Fastify from "fastify";
import { healthRoutes } from "./Routes/Health.Route";
import { env } from "./Configs/env";
import cors from "@fastify/cors";
import { workspaceRoutes } from "./Routes/Workspace.Route";
import fileRoutes from "./Routes/File.Route";

const app = Fastify({
  logger: true,
});

app.register(cors, {
  origin: "*", // allow frontend
});

app.register(healthRoutes);
app.register(workspaceRoutes);
app.register(fileRoutes);

const start = async () => {
  try {
    await app.listen({
      port: env.PORT,
      host: "0.0.0.0",
    });

    app.log.info(
      `WebDesk Backend running on http://localhost:${env.PORT}`
    );
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();