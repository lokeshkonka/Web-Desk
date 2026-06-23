import Fastify from "fastify";
import http from "http";

// @ts-ignore
http.STATUS_CODES = new Proxy(http.STATUS_CODES, {
  get: function(target: any, prop: any) {
    return target[prop] || 'Unknown Error';
  }
});

process.on('uncaughtException', (err) => {
  if (err && err.message && err.message.includes("evaluating 'message'")) {
    console.warn("Caught known Bun ws/engine.io crash (uncaughtException), ignoring so server stays up.");
    return;
  }
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on('unhandledRejection', (err: any) => {
  if (err && err.message && err.message.includes("evaluating 'message'")) {
    console.warn("Caught known Bun ws/engine.io crash (unhandledRejection), ignoring so server stays up.");
    return;
  }
  console.error("Unhandled Rejection:", err);
});
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
import { journalRoutes } from "./Routes/Journal.Route";
import fastifySocketIO from "fastify-socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { CollaborationService } from "./Services/Collaboration.Service";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = Fastify({
  loggerInstance: logger,
});

app.register(cors, {
  origin: "*", // allow frontend
  methods: ["GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"],
});

// app.register(websocket); // Temporarily disabled to prevent conflict with Socket.IO

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

app.register(fastifyStatic, {
  root: path.join(__dirname, "../frontend/dist"),
  prefix: "/",
});

app.setNotFoundHandler((req, reply) => {
  reply.sendFile("index.html");
});

app.register(healthRoutes);
app.register(metricsRoutes);
app.register(workspaceRoutes);
app.register(fileRoutes);
app.register(uploadRoutes);
// app.register(terminalRoutes); // Terminal uses raw websockets which conflicts with socket.io currently
app.register(editorRoutes);
app.register(containerRoutes);
app.register(journalRoutes);

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