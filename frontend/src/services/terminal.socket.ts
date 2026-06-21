import { API_URL } from './api';

export class TerminalSocket {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private onOutput: (data: string) => void;
  private onClose: () => void;
  private connectPromise: Promise<void> | null = null;

  constructor(sessionId: string, onOutput: (data: string) => void, onClose: () => void) {
    this.sessionId = sessionId;
    this.onOutput = onOutput;
    this.onClose = onClose;
  }

  connect(cols: number, rows: number, containerId?: string): Promise<void> {
    if (this.connectPromise) return this.connectPromise;

    this.connectPromise = new Promise((resolve, reject) => {
      const wsProtocol = API_URL.startsWith('https') ? 'wss:' : 'ws:';
      const wsHost = API_URL.replace(/^https?:\/\//, '');
      let url = `${wsProtocol}//${wsHost}/terminal?sessionId=${this.sessionId}&cols=${cols}&rows=${rows}`;
      if (containerId) url += `&containerId=${containerId}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'output') {
            this.onOutput(message.data);
          }
        } catch (e) {
          console.error(e);
        }
      };

      this.ws.onclose = () => {
        this.onClose();
        this.connectPromise = null;
      };
    });

    return this.connectPromise;
  }

  write(data: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'input', data }));
    }
  }

  resize(cols: number, rows: number) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'resize', cols, rows }));
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
