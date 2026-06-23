import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useDesktopStore } from '../../store/useDesktopStore';

const DUMMY_COMMANDS: Record<string, () => string | string[]> = {
  help: () => [
    'Available commands:',
    '  help     - Show this help message',
    '  clear    - Clear the terminal screen',
    '  date     - Show current date and time',
    '  whoami   - Print current user',
    '  pwd      - Print working directory',
    '  ls       - List directory contents',
    '  echo     - Print text',
    '  ping     - Send ICMP ECHO_REQUEST to network hosts',
    '  uptime   - Tell how long the system has been running',
    '  uname    - Print system information',
    '  sudo     - Execute a command as another user',
    '  matrix   - Enter the matrix',
    '  joke     - Tell a programming joke',
    '  calc     - Start the calculator',
    '  exit     - Close the terminal window',
  ],
  date: () => new Date().toString(),
  whoami: () => 'guest_user',
  pwd: () => '/home/guest/desktop',
  ls: () => 'Documents  Downloads  Pictures  Music  Videos  WebDesk.exe',
  ping: () => [
    'PING google.com (142.250.190.46): 56 data bytes',
    '64 bytes from 142.250.190.46: icmp_seq=0 ttl=116 time=14.2 ms',
    '64 bytes from 142.250.190.46: icmp_seq=1 ttl=116 time=15.1 ms',
    '64 bytes from 142.250.190.46: icmp_seq=2 ttl=116 time=14.8 ms',
    '--- google.com ping statistics ---',
    '3 packets transmitted, 3 packets received, 0.0% packet loss'
  ],
  uptime: () => 'up 4 hours, 20 minutes, 1 user, load averages: 1.15, 1.22, 1.12',
  uname: () => 'WebDesk-OS 1.0.0 x86_64',
  sudo: () => 'loki is not in the sudoers file. This incident will be reported.',
  matrix: () => 'Wake up, Neo... The Matrix has you...',
  joke: () => 'There are 10 types of people in the world: those who understand binary, and those who don\'t.',
};

export const Terminal = ({ id }: { id: string }) => {
  const { closeWindow } = useDesktopStore();
  const [history, setHistory] = useState<{ type: 'input' | 'output', text: string }[]>([
    { type: 'output', text: 'Welcome to WebDesk Terminal v2.0.0' },
    { type: 'output', text: 'Type "help" to see available commands.' }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) {
      setHistory(prev => [...prev, { type: 'input', text: '' }]);
      return;
    }

    setHistory(prev => [...prev, { type: 'input', text: trimmed }]);

    const args = trimmed.split(' ');
    const cmd = args[0].toLowerCase();

    if (cmd === 'exit') {
      closeWindow(id);
      return;
    }

    if (cmd === 'clear') {
      setHistory([]);
      return;
    }

    if (cmd === 'echo') {
      setHistory(prev => [...prev, { type: 'output', text: args.slice(1).join(' ') }]);
      return;
    }

    if (DUMMY_COMMANDS[cmd]) {
      const output = DUMMY_COMMANDS[cmd]();
      if (Array.isArray(output)) {
        setHistory(prev => [...prev, ...output.map(text => ({ type: 'output' as const, text }))]);
      } else {
        setHistory(prev => [...prev, { type: 'output', text: output }]);
      }
    } else {
      setHistory(prev => [...prev, { type: 'output', text: 'This is Temporary Terminal Here u can try some basic Commands' }]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  return (
    <div 
      className="flex flex-col h-full w-full bg-black/90 backdrop-blur-md text-[#E0E0E0] p-4 overflow-y-auto font-mono custom-scrollbar relative"
      onClick={() => inputRef.current?.focus()}
      style={{ fontFamily: "'Fira Code', 'Courier New', Courier, monospace", fontSize: '15px' }}
    >
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-50"></div>
      
      {history.map((line, idx) => (
        <div key={idx} className="mb-1.5 whitespace-pre-wrap break-words leading-relaxed">
          {line.type === 'input' ? (
            <div>
              <span className="text-[#61AFEF] font-bold">guest@webdesk</span>
              <span className="text-[#98C379] font-bold"> ~ $ </span>
              <span className="text-white">{line.text}</span>
            </div>
          ) : (
            <div className="text-[#ABB2BF] pl-2 border-l-[2px] border-[#3E4451]/50 ml-1">
              {line.text}
            </div>
          )}
        </div>
      ))}
      <div className="flex flex-col sm:flex-row sm:items-center mt-2 group relative">
        <div className="flex items-center shrink-0">
          <span className="text-[#61AFEF] font-bold">guest@webdesk</span>
          <span className="text-[#98C379] font-bold whitespace-nowrap mr-2"> ~ $ </span>
        </div>
        <div className="relative flex-1 flex items-center min-h-[1.5em] overflow-hidden">
          <span className="absolute inset-0 text-white pointer-events-none whitespace-pre font-mono flex items-center">
            {input}<span className="inline-block w-[0.6em] h-[1.1em] bg-gray-300 animate-[pulse_1.5s_step-end_infinite] align-middle -mt-[2px] ml-[1px]"></span>
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 w-full bg-transparent text-transparent caret-transparent outline-none border-none focus:outline-none focus:ring-0 shadow-none"
            style={{ outline: 'none', boxShadow: 'none' }}
            spellCheck={false}
            autoFocus
          />
        </div>
      </div>
      <div ref={bottomRef} className="h-4 shrink-0" />
    </div>
  );
};
