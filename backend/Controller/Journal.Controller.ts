import type { FastifyRequest, FastifyReply } from "fastify";
import * as JournalService from "../Services/Journal.Service";

export const getEntries = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const entries = await JournalService.getEntries();
    return reply.status(200).send(entries);
  } catch (error: any) {
    req.log.error(error);
    return reply.status(500).send({ error: error.message });
  }
};

export const createEntry = async (req: FastifyRequest<{ Body: { title: string; content: string } }>, reply: FastifyReply) => {
  try {
    const { title, content } = req.body;
    const entry = await JournalService.createEntry(title, content);
    return reply.status(201).send(entry);
  } catch (error: any) {
    req.log.error(error);
    return reply.status(500).send({ error: error.message });
  }
};

export const updateEntry = async (req: FastifyRequest<{ Params: { id: string }; Body: { title?: string; content?: string } }>, reply: FastifyReply) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const entry = await JournalService.updateEntry(id, title, content);
    return reply.status(200).send(entry);
  } catch (error: any) {
    req.log.error(error);
    return reply.status(500).send({ error: error.message });
  }
};

export const deleteEntry = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const { id } = req.params;
    await JournalService.deleteEntry(id);
    return reply.status(204).send();
  } catch (error: any) {
    req.log.error(error);
    return reply.status(500).send({ error: error.message });
  }
};
