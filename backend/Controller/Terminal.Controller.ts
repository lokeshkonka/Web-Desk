import type { FastifyRequest, FastifyReply } from "fastify";

import { TerminalService } from "../Services/Terminal.Service";

const terminalService = new TerminalService();

import type { WebSocket } from "ws";

export const handleTerminalWebSocket = (connection: WebSocket, req: FastifyRequest) => {
  const sessionId = (req.query as any).sessionId;
  const cols = parseInt((req.query as any).cols) || 80;
  const rows = parseInt((req.query as any).rows) || 24;
  const containerId = (req.query as any).containerId;

  if (!sessionId) {
    connection.close(1008, 'Session ID required');
    return;
  }

  let ptyProcess = terminalService.getSession(sessionId);
  if (!ptyProcess) {
    ptyProcess = terminalService.createSession(sessionId, cols, rows, containerId);
  }

  // Handle incoming data from the frontend
  connection.on('message', (message: Buffer | string) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'input') {
        ptyProcess!.write(data.data);
      } else if (data.type === 'resize') {
        terminalService.resizeSession(sessionId, data.cols, data.rows);
      }
    } catch (err) {
      console.error('Invalid message format', err);
    }
  });

  // Handle outgoing data from the pty to the frontend
  const onData = ptyProcess.onData((data: string) => {
    connection.send(JSON.stringify({ type: 'output', data }));
  });

  connection.on('close', () => {
    onData.dispose();
    terminalService.closeSession(sessionId); // Cleanup process
  });
};

export const closeTerminalSession = async (req: FastifyRequest<{ Params: { sessionId: string } }>, reply: FastifyReply) => {
  terminalService.closeSession(req.params.sessionId);
  return reply.send({ success: true });
};
