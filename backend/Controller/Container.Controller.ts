import type { FastifyRequest, FastifyReply } from "fastify";
import { ContainerService } from "../Services/Container.Service";

const containerService = new ContainerService();

export const listContainers = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const containers = await containerService.listContainers();
    return reply.send(containers);
  } catch (error: any) {
    return reply.status(500).send({ error: error.message });
  }
};

export const createContainer = async (req: FastifyRequest<{ Body: { name: string, image: string, opts?: any } }>, reply: FastifyReply) => {
  try {
    const { name, image, opts } = req.body;
    const container = await containerService.createContainer(name, image, opts);
    return reply.send(container);
  } catch (error: any) {
    return reply.status(500).send({ error: error.message });
  }
};

export const startContainer = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const container = await containerService.startContainer(req.params.id);
    return reply.send(container);
  } catch (error: any) {
    return reply.status(500).send({ error: error.message });
  }
};

export const stopContainer = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const container = await containerService.stopContainer(req.params.id);
    return reply.send(container);
  } catch (error: any) {
    return reply.status(500).send({ error: error.message });
  }
};

export const removeContainer = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    await containerService.deleteContainer(req.params.id);
    return reply.send({ success: true });
  } catch (error: any) {
    return reply.status(500).send({ error: error.message });
  }
};

export const getContainerLogs = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const logs = await containerService.getContainerLogs(req.params.id);
    return reply.send({ logs });
  } catch (error: any) {
    return reply.status(500).send({ error: error.message });
  }
};

// Expose singleton for terminal attachments
export const getContainerService = () => containerService;
