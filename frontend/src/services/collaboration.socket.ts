import { io, Socket } from 'socket.io-client';
import { API_URL } from './api';

export class CollaborationSocket {
  private socket: Socket;

  constructor() {
    this.socket = io(API_URL, {
      autoConnect: false,
    });
  }

  connect() {
    this.socket.connect();
  }

  disconnect() {
    this.socket.disconnect();
  }
}

export const collabSocket = new CollaborationSocket();
