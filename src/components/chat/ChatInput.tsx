'use client';

import { useState, useRef, useEffect } from 'react';
import { CommandList } from './CommandList';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [showCommands, setShowCommands] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Show command list when input starts with "/"
  useEffect(() => {
    setShowCommands(value.startsWith('/'));
  }, [value]);

  // Close on click outside
  useEffect(() => {
    if (!showCommands) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowCommands(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCommands]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    setShowCommands(false);
    inputRef.current?.focus();
  };

  const handleCommand = (command: string) => {
    onSend(command);
    setValue('');
    setShowCommands(false);
    inputRef.current?.focus();
  };

  // Filter text after "/" for filtering commands
  const filterText = value.startsWith('/') ? value.slice(1).toLowerCase() : '';

  return (
    <div ref={containerRef} className="relative shrink-0">
      {/* Command dropdown */}
      {showCommands && (
        <div className="absolute bottom-full left-0 right-0 z-10">
          <CommandList onCommand={handleCommand} filter={filterText} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-surface-200 bg-white">
        <button
          type="button"
          className="h-9 w-9 rounded-full text-surface-400 hover:text-surface-600 hover:bg-surface-100 flex items-center justify-center transition-colors shrink-0"
          title="Attach file"
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask about your content performance..."
          disabled={disabled}
          className="flex-1 px-4 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00C5DF] focus:border-transparent disabled:opacity-50 placeholder:text-surface-400"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="h-9 w-9 rounded-full bg-surface-900 text-white flex items-center justify-center hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  );
}
