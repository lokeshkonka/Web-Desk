import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { TerminalSocket } from '../../services/terminal.socket';

interface TerminalProps {
  id: string; // Used as the sessionId
  initialData?: any;
}

export const Terminal = ({ id, initialData }: TerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const socketRef = useRef<TerminalSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [status, setStatus] = useState<'Connecting' | 'Connected' | 'Disconnected'>('Connecting');

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const xterm = new XTerm({
      cursorBlink: true,
      fontFamily: 'monospace',
      theme: {
        background: '#1E1B2E',
        foreground: '#F0EFE9',
        cursor: '#F0EFE9'
      }
    });

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);

    xterm.open(terminalRef.current);
    
    // Slight delay to ensure parent dimensions are settled before initial fit
    setTimeout(() => {
      fitAddon.fit();
      
      xtermRef.current = xterm;
      fitAddonRef.current = fitAddon;

      const { cols, rows } = xterm;

      const socket = new TerminalSocket(
        id,
        (data) => {
          xterm.write(data);
        },
        () => {
          setStatus('Disconnected');
          xterm.write('\r\n\x1b[31mTerminal disconnected.\x1b[0m\r\n');
        }
      );

      socketRef.current = socket;

      socket.connect(cols, rows, initialData?.containerId).then(() => {
        setStatus('Connected');
      }).catch(() => {
        setStatus('Disconnected');
        xterm.write('\r\n\x1b[31mFailed to connect to terminal.\x1b[0m\r\n');
      });

      xterm.onData((data) => {
        socket.write(data);
      });

      // Handle copy/paste via xterm config or intercept
      xterm.attachCustomKeyEventHandler((arg) => {
        if (arg.ctrlKey && arg.shiftKey && arg.type === 'keydown') {
          if (arg.code === 'KeyC') {
            document.execCommand('copy');
            return false;
          }
          if (arg.code === 'KeyV') {
            return false; // let browser handle paste or we handle it
          }
        }
        return true;
      });

      const handleResize = () => {
        fitAddon.fit();
        if (socketRef.current) {
          socketRef.current.resize(xterm.cols, xterm.rows);
        }
      };

      window.addEventListener('resize', handleResize);

      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      
      if (terminalRef.current) {
        resizeObserver.observe(terminalRef.current);
      }

      return () => {
        window.removeEventListener('resize', handleResize);
        resizeObserver.disconnect();
        socket.close();
        xterm.dispose();
      };
    }, 10);
  }, [id]);

  // Handle standard clipboard paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (document.activeElement?.closest('.xterm')) {
        const text = e.clipboardData?.getData('text/plain');
        if (text && socketRef.current) {
          socketRef.current.write(text);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-[#1E1B2E] overflow-hidden">
      <div className="text-xs text-[#A8A29E] bg-black/30 px-2 py-1 flex justify-between select-none">
        <span>Terminal - {id.split('-')[0]}</span>
        <span className={status === 'Connected' ? 'text-green-400' : status === 'Connecting' ? 'text-yellow-400' : 'text-red-400'}>
          {status}
        </span>
      </div>
      <div className="flex-1 w-full h-full relative" style={{ padding: '4px' }}>
        <div ref={terminalRef} className="absolute inset-0" />
      </div>
    </div>
  );
};
