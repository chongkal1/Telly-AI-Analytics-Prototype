'use client';

import { useState } from 'react';
import { Lead } from '@/types';

interface Message {
  id: string;
  from: 'agent' | 'lead';
  subject?: string;
  body: string;
  date: string;
}

function generateConversation(lead: Lead): Message[] {
  const createdDate = new Date(lead.createdAt);
  const day1 = new Date(createdDate);
  day1.setDate(day1.getDate() + 1);
  const day3 = new Date(createdDate);
  day3.setDate(day3.getDate() + 3);
  const day4 = new Date(createdDate);
  day4.setDate(day4.getDate() + 4);
  const day6 = new Date(createdDate);
  day6.setDate(day6.getDate() + 6);
  const day7 = new Date(createdDate);
  day7.setDate(day7.getDate() + 7);

  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const firstName = lead.name.split(' ')[0];
  const articleTitle = lead.sourceUrl.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'our article';

  const messages: Message[] = [
    {
      id: '1',
      from: 'agent',
      subject: `Quick question about ${articleTitle}`,
      body: `Hi ${firstName},\n\nI noticed you recently read our article on ${articleTitle}. Given your role as ${lead.title} at ${lead.company}, I thought you might find our approach to content-driven growth particularly relevant.\n\nWe've been helping ${lead.industry} companies drive organic leads through AI-powered content strategies. Would you be open to a quick 15-minute call to explore how this could work for ${lead.company}?\n\nBest,\nTely AI`,
      date: fmt(day1),
    },
    {
      id: '2',
      from: 'lead',
      body: `Hi,\n\nThanks for reaching out. The article was actually quite insightful — we've been struggling with scaling our content operations.\n\nI'd be interested to learn more about how your AI approach works. Can you share some specifics on what results ${lead.industry} companies typically see?\n\n${firstName}`,
      date: fmt(day3),
    },
    {
      id: '3',
      from: 'agent',
      body: `Great to hear, ${firstName}!\n\nFor ${lead.industry} companies similar to ${lead.company}, we typically see:\n\n• 3-5x increase in organic traffic within 6 months\n• 40-60% reduction in content production costs\n• Identified visitor-to-lead conversion rates of 15-25%\n\nI've attached a brief case study that might be relevant. Would Thursday or Friday work for a quick call?\n\nBest,\nTely AI`,
      date: fmt(day4),
    },
  ];

  // Add extra messages for captured leads
  if (lead.status === 'captured' || lead.status === 'qualified' || lead.status === 'converted') {
    messages.push(
      {
        id: '4',
        from: 'lead',
        body: `Those numbers are impressive. Thursday at 2pm PT works for me.\n\nCould you also share pricing information ahead of the call? We have a team of about ${lead.employeeCount} and are looking to ramp up content across multiple topic clusters.\n\n${firstName}`,
        date: fmt(day6),
      },
      {
        id: '5',
        from: 'agent',
        body: `Perfect, ${firstName}! I've sent over a calendar invite for Thursday 2pm PT.\n\nI'll prepare a custom proposal based on ${lead.company}'s needs and share pricing details on the call. Looking forward to it!\n\nBest,\nTely AI`,
        date: fmt(day7),
      },
    );
  }

  return messages;
}

interface ConversationModalProps {
  lead: Lead;
  open: boolean;
  onClose: () => void;
}

export function ConversationModal({ lead, open, onClose }: ConversationModalProps) {
  const [messages] = useState(() => generateConversation(lead));

  if (!open) return null;

  const firstName = lead.name.split(' ')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="px-5 py-4 border-b border-surface-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600">
              {lead.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-surface-900">{lead.name}</h3>
              <p className="text-xs text-surface-500">{lead.title} at {lead.company} &middot; {lead.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors">
            <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Thread label */}
        <div className="px-5 py-2 border-b border-surface-100 bg-surface-50 shrink-0">
          <p className="text-xs text-surface-500">
            <span className="font-medium text-surface-700">Email thread</span> &middot; {messages.length} messages &middot; Started via content engagement on <span className="font-mono text-[11px]">{lead.sourceUrl}</span>
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === 'agent' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
                msg.from === 'agent'
                  ? 'bg-surface-50 border border-surface-200'
                  : 'bg-indigo-50 border border-indigo-100'
              }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[11px] font-semibold ${msg.from === 'agent' ? 'text-[#00C5DF]' : 'text-indigo-600'}`}>
                    {msg.from === 'agent' ? 'Tely AI Agent' : firstName}
                  </span>
                  <span className="text-[10px] text-surface-400">{msg.date}</span>
                </div>
                {msg.subject && (
                  <p className="text-xs font-semibold text-surface-700 mb-1">Re: {msg.subject}</p>
                )}
                <p className="text-xs text-surface-700 whitespace-pre-line leading-relaxed">{msg.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-surface-200 bg-surface-50 rounded-b-2xl shrink-0">
          <div className="flex items-center gap-2 text-xs text-surface-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Automated outreach by Tely AI agent based on content engagement signals
          </div>
        </div>
      </div>
    </div>
  );
}
