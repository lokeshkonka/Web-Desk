import type { Server, Socket } from 'socket.io';

export class CollaborationService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  handleConnection(socket: Socket) {
    // 1. Join Workspace Room
    socket.on('join_workspace', (data: { workspaceId: string; user: any }) => {
      socket.join(data.workspaceId);
      
      // Store user presence on socket
      socket.data.user = data.user;
      socket.data.workspaceId = data.workspaceId;

      // Broadcast to room
      socket.to(data.workspaceId).emit('user_joined', data.user);
      
      // Send current users in room to the new user
      this.emitPresence(data.workspaceId);
      
      // Activity Feed (Task 11)
      this.io.to(data.workspaceId).emit('activity', {
        id: crypto.randomUUID(),
        message: `${data.user.username} joined workspace.`,
        timestamp: new Date().toISOString()
      });
    });

    // 4. Live Cursors
    socket.on('cursor_move', (data: { x: number; y: number; username: string; color: string }) => {
      const workspaceId = socket.data.workspaceId;
      if (workspaceId) {
        // Broadcast to everyone else in the workspace
        socket.to(workspaceId).emit('cursor_moved', { ...data, id: socket.id });
      }
    });

    // 7. Editor Collaboration
    socket.on('editor_update', (data: { fileId: string; content: string }) => {
      const workspaceId = socket.data.workspaceId;
      if (workspaceId) {
        socket.to(workspaceId).emit('editor_updated', data);
      }
    });

    // 8. Inventory Sync
    socket.on('inventory_change', () => {
      const workspaceId = socket.data.workspaceId;
      if (workspaceId) {
        socket.to(workspaceId).emit('inventory_changed');
      }
    });

    // 9. Workspace Events
    socket.on('workspace_event', (data: { type: string; payload: any }) => {
      const workspaceId = socket.data.workspaceId;
      if (workspaceId) {
        socket.to(workspaceId).emit('workspace_event', data);
      }
    });

    // Activity Feed Custom
    socket.on('activity_event', (message: string) => {
      const workspaceId = socket.data.workspaceId;
      if (workspaceId) {
        this.io.to(workspaceId).emit('activity', {
          id: crypto.randomUUID(),
          message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Leave
    socket.on('disconnect', () => {
      const { workspaceId, user } = socket.data;
      if (workspaceId && user) {
        socket.to(workspaceId).emit('user_left', user.id);
        this.emitPresence(workspaceId);
        
        this.io.to(workspaceId).emit('activity', {
          id: crypto.randomUUID(),
          message: `${user.username} left workspace.`,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  private async emitPresence(workspaceId: string) {
    const sockets = await this.io.in(workspaceId).fetchSockets();
    const onlineUsers = sockets.map(s => s.data.user).filter(Boolean);
    this.io.to(workspaceId).emit('presence_update', onlineUsers);
  }
}
