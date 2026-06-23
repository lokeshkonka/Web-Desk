import { useState } from 'react';

export const CalculatorApp = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperator = (op: string) => {
    if (display === 'Error') return;
    setEquation(display + ' ' + op + ' ');
    setNewNumber(true);
  };

  const calculate = () => {
    if (!equation || newNumber) return;
    try {
      const prev = parseFloat(equation.split(' ')[0]);
      const current = parseFloat(display);
      const op = equation.split(' ')[1];
      
      let result = 0;
      switch (op) {
        case '+': result = prev + current; break;
        case '-': result = prev - current; break;
        case 'x': result = prev * current; break;
        case '/': 
          if (current === 0) throw new Error('Divide by zero');
          result = prev / current; 
          break;
        default: return;
      }
      
      // Handle floating point precision
      const rounded = Math.round(result * 100000000) / 100000000;
      
      setDisplay(String(rounded));
      setEquation('');
      setNewNumber(true);
    } catch (e) {
      setDisplay('Error');
      setEquation('');
      setNewNumber(true);
    }
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'C':
        setDisplay('0');
        setEquation('');
        setNewNumber(true);
        break;
      case 'CE':
        setDisplay('0');
        setNewNumber(true);
        break;
      case '⌫':
        if (newNumber) return;
        setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
        if (display.length === 1) setNewNumber(true);
        break;
      case '.':
        if (newNumber) {
          setDisplay('0.');
          setNewNumber(false);
        } else if (!display.includes('.')) {
          setDisplay(display + '.');
        }
        break;
      case '±':
        if (display !== '0' && display !== 'Error') {
          setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
        }
        break;
      case '=':
        calculate();
        break;
      case '+':
      case '-':
      case 'x':
      case '/':
        handleOperator(action);
        break;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#1E1B2E] p-4 text-white overflow-hidden select-none">
      <div className="flex-1 min-h-[100px] flex flex-col items-end justify-end bg-[#0a110a] p-4 rounded-xl border-2 border-green-900/50 mb-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden relative">
        {/* LED Screen effect lines */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px)', backgroundSize: '100% 4px' }} />
        <div className="text-green-500/60 h-6 text-sm mb-1 truncate w-full text-right font-mono drop-shadow-[0_0_2px_rgba(34,197,94,0.4)]">
          {equation}
        </div>
        <div className="text-green-400 text-5xl font-mono tracking-wider truncate w-full text-right drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">
          {display}
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 pb-2">
        <CalcButton label="CE" className="text-red-400 bg-[#373352]" onClick={() => handleAction('CE')} />
        <CalcButton label="C" className="text-red-400 bg-[#373352]" onClick={() => handleAction('C')} />
        <CalcButton label="⌫" className="bg-[#373352]" onClick={() => handleAction('⌫')} />
        <CalcButton label="/" isOperator onClick={() => handleAction('/')} />
        
        <CalcButton label="7" onClick={() => handleNumber('7')} />
        <CalcButton label="8" onClick={() => handleNumber('8')} />
        <CalcButton label="9" onClick={() => handleNumber('9')} />
        <CalcButton label="x" isOperator onClick={() => handleAction('x')} />
        
        <CalcButton label="4" onClick={() => handleNumber('4')} />
        <CalcButton label="5" onClick={() => handleNumber('5')} />
        <CalcButton label="6" onClick={() => handleNumber('6')} />
        <CalcButton label="-" isOperator onClick={() => handleAction('-')} />
        
        <CalcButton label="1" onClick={() => handleNumber('1')} />
        <CalcButton label="2" onClick={() => handleNumber('2')} />
        <CalcButton label="3" onClick={() => handleNumber('3')} />
        <CalcButton label="+" isOperator onClick={() => handleAction('+')} />
        
        <CalcButton label="±" onClick={() => handleAction('±')} />
        <CalcButton label="0" onClick={() => handleNumber('0')} />
        <CalcButton label="." onClick={() => handleAction('.')} />
        <CalcButton label="=" isOperator className="bg-green-600 hover:bg-green-500" onClick={() => handleAction('=')} />
      </div>
    </div>
  );
};

const CalcButton = ({ label, className = "", isOperator = false, onClick }: { label: string, className?: string, isOperator?: boolean, onClick: () => void }) => (
  <button
    onPointerDown={(e) => {
      // Prevent focus issues
      e.preventDefault();
      onClick();
    }}
    className={`
      h-12 text-xl font-medium rounded transition-colors select-none
      active:scale-95 flex items-center justify-center cursor-pointer pointer-events-auto
      ${isOperator ? 'bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white' : 
        'bg-[#373352] hover:bg-[#48426b] text-gray-200'}
      ${className}
    `}
  >
    {label}
  </button>
);
