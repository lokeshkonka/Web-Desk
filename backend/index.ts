import Fastify from "fastify";
import { logger } from "./Configs/logger";
import { healthRoutes } from "./Routes/Health.Route";
import { metricsRoutes } from "./Routes/Metrics.Route";
import { env } from "./Configs/env";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import websocket from "@fastify/websocket";
import { workspaceRoutes } from "./Routes/Workspace.Route";
import fileRoutes from "./Routes/File.Route";
import { uploadRoutes } from "./Routes/Upload.Route";
import { terminalRoutes } from "./Routes/Terminal.Route";
import { editorRoutes } from "./Routes/Editor.Route";
import { containerRoutes } from "./Routes/Container.Route";
import fastifySocketIO from "fastify-socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { CollaborationService } from "./Services/Collaboration.Service";

const app = Fastify({
  logger: logger,
});

app.register(cors, {
  origin: "*", // allow frontend
});

app.register(websocket);

app.register(fastifySocketIO, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

app.register(multipart, {
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

app.register(healthRoutes);
app.register(metricsRoutes);
app.register(workspaceRoutes);
app.register(fileRoutes);
app.register(uploadRoutes);
app.register(terminalRoutes);
app.register(editorRoutes);
app.register(containerRoutes);

app.ready(async (err) => {
  if (err) throw err;

  const io = (app as any).io;
  const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
  const subClient = pubClient.duplicate();

  try {
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    app.log.info("Redis Pub/Sub connected for Socket.IO");
  } catch (redisErr) {
    app.log.warn("Redis not available, falling back to in-memory adapter");
  }

  const collabService = new CollaborationService(io);
  io.on('connection', (socket: any) => collabService.handleConnection(socket));
});

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