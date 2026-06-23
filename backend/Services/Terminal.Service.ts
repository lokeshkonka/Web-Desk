import * as pty from '@homebridge/node-pty-prebuilt-multiarch';
import os from 'os';
import { spawn } from 'child_process';

export class TerminalService {
  private sessions = new Map<string, any>();

  createSession(sessionId: string, cols: number = 80, rows: number = 24, containerId?: string) {
    let ptyProcess: any;
    
    try {
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
        console.log(`Spawned pty with shell ${shell}, PID: ${ptyProcess.pid}`);
      }
      
      // If the process exits immediately (known issue with Bun + node-pty), we catch it
      ptyProcess.onExit((e: any) => {
        console.log(`PTY Process exited for session ${sessionId} with code ${e.exitCode}, signal ${e.signal}`);
        this.sessions.delete(sessionId);
      });
    } catch (e) {
      console.warn("node-pty failed or crashed, falling back to child_process.spawn", e);
      // Fallback implementation for environments where native node-pty fails
      const shell = os.platform() === 'win32' ? 'powershell.exe' : (process.env.SHELL || 'bash');
      const cp = spawn(shell, [], {
        cwd: process.env.HOME || process.cwd(),
        env: process.env as Record<string, string>,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      ptyProcess = {
        pid: cp.pid,
        onData: (cb: (data: string) => void) => {
          cp.stdout.on('data', (d) => cb(d.toString()));
          cp.stderr.on('data', (d) => cb(d.toString()));
          return { dispose: () => {} };
        },
        write: (data: string) => {
          cp.stdin.write(data);
        },
        resize: () => {},
        kill: () => cp.kill(),
        onExit: (cb: (e: { exitCode: number; signal?: number }) => void) => {
          cp.on('exit', (code, signal) => cb({ exitCode: code || 0, signal: signal ? 1 : 0 }));
        }
      };
      
      cp.on('exit', () => {
        this.sessions.delete(sessionId);
      });
    }

    this.sessions.set(sessionId, ptyProcess);
    return ptyProcess;
  }

  getSession(sessionId: string) {
    return this.sessions.get(sessionId);
  }

  resizeSession(sessionId: string, cols: number, rows: number) {
    const session = this.getSession(sessionId);
    if (session && typeof session.resize === 'function') {
      try {
        session.resize(cols, rows);
      } catch (e) {}
    }
  }

  closeSession(sessionId: string) {
    const session = this.getSession(sessionId);
    if (session && typeof session.kill === 'function') {
      try {
        session.kill();
      } catch (e) {}
      this.sessions.delete(sessionId);
    }
  }
}
