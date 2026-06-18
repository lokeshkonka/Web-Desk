import Fastify from "fastify";
import { healthRoutes } from "./Routes/Health.Route";
import { env } from "./Configs/env";

const app = Fastify({
  logger: true,
});

app.register(healthRoutes);

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