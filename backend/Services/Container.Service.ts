import { PrismaClient } from "@prisma/client";
import { DockerAdapter } from "../Adapters/Docker.Adapter";
import { logger } from "../Configs/logger";
import { redis } from "../Configs/redis";

const prisma = new PrismaClient();

export class ContainerService {
  private adapter: DockerAdapter;

  constructor() {
    this.adapter = new DockerAdapter();
  }

  async listContainers() {
    const cached = await redis.get("containers:list");
    if (cached) return JSON.parse(cached);

    await this.syncStatuses();
    const containers = await prisma.container.findMany();
    await redis.setEx("containers:list", 60, JSON.stringify(containers)); // Cache for 60 seconds
    return containers;
  }

  async createContainer(name: string, image: string, opts?: any) {
    // Generate safe container name
    const safeName = `webdesk-${name.replace(/[^a-zA-Z0-9_-]/g, '')}-${crypto.randomUUID().slice(0, 8)}`;
    
    logger.info({ event: "container_create_start", name: safeName, image });
    const dockerContainer = await this.adapter.createContainer(safeName, image, opts);
    const dbContainer = await prisma.container.create({
      data: {
        containerId: dockerContainer.id,
        name,
        image,
        status: 'created'
      }
    });
    logger.info({ event: "container_create_success", id: dbContainer.id, containerId: dockerContainer.id });
    await redis.del("containers:list");
    return dbContainer;
  }

  async startContainer(id: string) {
    const container = await prisma.container.findUnique({ where: { id } });
    if (!container) throw new Error("Container not found");
    
    logger.info({ event: "container_start", id, containerId: container.containerId });
    await this.adapter.startContainer(container.containerId);
    const updated = await prisma.container.update({
      where: { id },
      data: { status: 'running' }
    });
    await redis.del("containers:list");
    return updated;
  }

  async stopContainer(id: string) {
    const container = await prisma.container.findUnique({ where: { id } });
    if (!container) throw new Error("Container not found");

    logger.info({ event: "container_stop", id, containerId: container.containerId });
    await this.adapter.stopContainer(container.containerId);
    const updated = await prisma.container.update({
      where: { id },
      data: { status: 'stopped' }
    });
    await redis.del("containers:list");
    return updated;
  }

  async deleteContainer(id: string) {
    const container = await prisma.container.findUnique({ where: { id } });
    if (!container) throw new Error("Container not found");

    logger.info({ event: "container_delete", id, containerId: container.containerId });
    try {
      await this.adapter.removeContainer(container.containerId);
    } catch(e) {
      logger.error({ event: "container_delete_error", error: e });
    }
    
    await prisma.container.delete({ where: { id } });
    await redis.del("containers:list");
    return { success: true };
  }

  async getContainerLogs(id: string) {
    const container = await prisma.container.findUnique({ where: { id } });
    if (!container) throw new Error("Container not found");

    return this.adapter.getContainerLogs(container.containerId);
  }

  async syncStatuses() {
    const allDocker = await this.adapter.listContainers();
    const dbs = await prisma.container.findMany();
    
    for (const db of dbs) {
      const doc = allDocker.find(d => d.Id === db.containerId);
      const newStatus = doc ? doc.State : 'removed';
      if (db.status !== newStatus) {
        await prisma.container.update({ where: { id: db.id }, data: { status: newStatus }});
      }
    }
  }

  getDockerAdapter() {
    return this.adapter;
  }
}
