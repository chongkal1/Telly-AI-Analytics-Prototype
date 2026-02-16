'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';

export function ChatPanel() {
  const { messages, isTyping, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const discussHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.message) sendMessage(detail.message);
    };
    const createHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.message) sendMessage(detail.message);
    };
    window.addEventListener('discuss-cluster', discussHandler);
    window.addEventListener('create-cluster', createHandler);
    return () => {
      window.removeEventListener('discuss-cluster', discussHandler);
      window.removeEventListener('create-cluster', createHandler);
    };
  }, [sendMessage]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-900">Tely AI</span>
          <span className="ml-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100 rounded">
            Online
          </span>
        </div>
      </div>

      {/* Assistant info */}
      <div className="px-4 py-3 border-b border-gray-100 shrink-0 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Analytics Assistant</p>
        </div>
        <span className="text-xs text-gray-400">Online</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="h-12 w-12 rounded-full bg-emerald-100 mx-auto flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900">Start a conversation</h3>
            <p className="mt-1 text-sm text-gray-500">Ask about traffic, leads, ROI, or type <span className="font-mono text-emerald-600">/</span> for commands.</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onAction={sendMessage} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isTyping} />
    </div>
  );
}
