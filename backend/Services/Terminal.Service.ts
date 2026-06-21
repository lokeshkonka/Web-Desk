import * as pty from 'node-pty';
import os from 'os';

export class TerminalService {
  private sessions = new Map<string, pty.IPty>();

  createSession(sessionId: string, cols: number = 80, rows: number = 24, containerId?: string) {
    let ptyProcess;
    
    if (containerId) {
      ptyProcess = pty.spawn('docker', ['exec', '-it', containerId, '/bin/sh'], {
        name: 'xterm-color',
        cols,
        rows,
        cwd: process.cwd(),
        env: process.env as Record<string, string>,
      });
    } else {
      const shell = os.platform() === 'win32' ? 'powershell.exe' : (process.env.SHELL || 'bash');
      ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols,
        rows,
        cwd: process.env.HOME || process.cwd(),
        env: process.env as Record<string, string>,
      });
    }

    this.sessions.set(sessionId, ptyProcess);

    ptyProcess.onExit(() => {
      this.sessions.delete(sessionId);
    });

    return ptyProcess;
  }

  getSession(sessionId: string) {
    return this.sessions.get(sessionId);
  }

  resizeSession(sessionId: string, cols: number, rows: number) {
    const session = this.getSession(sessionId);
    if (session) {
      session.resize(cols, rows);
    }
  }

  closeSession(sessionId: string) {
    const session = this.getSession(sessionId);
    if (session) {
      session.kill();
      this.sessions.delete(sessionId);
    }
  }
}
