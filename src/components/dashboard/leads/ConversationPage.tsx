'use client';

import { useState, useRef, useEffect } from 'react';
import { Lead, LeadStatus } from '@/types';
import { formatDate } from '@/lib/utils';

/* ── Types ── */

interface Message {
  id: string;
  from: 'agent' | 'lead';
  subject?: string;
  body: string;
  date: string;
}

interface RuleMessage {
  id: string;
  from: 'user' | 'assistant';
  text: string;
}

/* ── Helpers ── */

function getDisplayStatus(status: LeadStatus): 'identified' | 'contacted' | 'captured' {
  if (status === 'contacted') return 'contacted';
  if (status === 'captured') return 'captured';
  return 'identified';
}

const STATUS_STYLES: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  identified: { dot: 'bg-[#00C5DF]', bg: 'bg-cyan-50', text: 'text-cyan-700', label: 'Identified' },
  contacted: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', label: 'Contacted' },
  captured: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Captured' },
};

function generateConversation(lead: Lead): Message[] {
  const createdDate = new Date(lead.createdAt);
  const offset = (days: number) => { const d = new Date(createdDate); d.setDate(d.getDate() + days); return d; };
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const firstName = lead.name.split(' ')[0];
  const articleTitle = lead.sourceUrl.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'our article';

  const messages: Message[] = [
    {
      id: '1', from: 'agent',
      subject: `Quick question about ${articleTitle}`,
      body: `Hi ${firstName},\n\nI noticed you recently read our article on ${articleTitle}. Given your role as ${lead.title} at ${lead.company}, I thought you might find our approach to content-driven growth particularly relevant.\n\nWe've been helping ${lead.industry} companies drive organic leads through AI-powered content strategies. Would you be open to a quick 15-minute call to explore how this could work for ${lead.company}?\n\nBest,\nTely AI`,
      date: fmt(offset(1)),
    },
    {
      id: '2', from: 'lead',
      body: `Hi,\n\nThanks for reaching out. The article was actually quite insightful — we've been struggling with scaling our content operations.\n\nI'd be interested to learn more about how your AI approach works. Can you share some specifics on what results ${lead.industry} companies typically see?\n\n${firstName}`,
      date: fmt(offset(3)),
    },
    {
      id: '3', from: 'agent',
      body: `Great to hear, ${firstName}!\n\nFor ${lead.industry} companies similar to ${lead.company}, we typically see:\n\n• 3-5x increase in organic traffic within 6 months\n• 40-60% reduction in content production costs\n• Identified visitor-to-lead conversion rates of 15-25%\n\nI've attached a brief case study that might be relevant. Would Thursday or Friday work for a quick call?\n\nBest,\nTely AI`,
      date: fmt(offset(4)),
    },
  ];

  if (lead.status === 'captured' || lead.status === 'qualified' || lead.status === 'converted') {
    messages.push(
      {
        id: '4', from: 'lead',
        body: `Those numbers are impressive. Thursday at 2pm PT works for me.\n\nCould you also share pricing information ahead of the call? We have a team of about ${lead.employeeCount} and are looking to ramp up content across multiple topic clusters.\n\n${firstName}`,
        date: fmt(offset(6)),
      },
      {
        id: '5', from: 'agent',
        body: `Perfect, ${firstName}! I've sent over a calendar invite for Thursday 2pm PT.\n\nI'll prepare a custom proposal based on ${lead.company}'s needs and share pricing details on the call. Looking forward to it!\n\nBest,\nTely AI`,
        date: fmt(offset(7)),
      },
    );
  }

  return messages;
}

/* ── Left panel: Agent Rules Assistant ── */

function AgentRulesPanel({ lead }: { lead: Lead }) {
  const [messages, setMessages] = useState<RuleMessage[]>([
    {
      id: 'welcome',
      from: 'assistant',
      text: `I can help you configure how the AI agent should handle conversations with ${lead.name} and similar leads.\n\nYou can give me instructions like:\n• "Always mention our case study for ${lead.industry} companies"\n• "If they ask about pricing, offer a 14-day trial first"\n• "Follow up within 24h if no reply"`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: RuleMessage = { id: `u-${Date.now()}`, from: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        `Got it! I've updated the agent rules. For ${lead.company} and similar ${lead.industry} leads, the agent will now follow this instruction in future conversations.`,
        `Rule saved. The agent will apply this to ongoing outreach with ${lead.name} and similar profiles. You can add more rules anytime.`,
        `Understood. I've added this to the conversation playbook for ${lead.industry} leads. The agent will adjust its approach accordingly.`,
      ];
      const reply: RuleMessage = {
        id: `a-${Date.now()}`,
        from: 'assistant',
        text: responses[Math.floor(Math.random() * responses.length)],
      };
      setMessages(prev => [...prev, reply]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-surface-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-surface-900">Agent Rules</h3>
            <p className="text-[10px] text-surface-400">Configure outreach behavior</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${
              msg.from === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-surface-100 text-surface-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-surface-100 rounded-xl px-3 py-2 text-xs text-surface-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 py-3 border-t border-surface-200 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Add a rule or instruction..."
            className="flex-1 px-3 py-2 text-xs border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Center: Conversation Thread ── */

function ConversationThread({ messages }: { messages: Message[] }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.from === 'agent' ? 'justify-start' : 'justify-end'}`}>
          <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
            msg.from === 'agent'
              ? 'bg-white border border-surface-200 shadow-sm'
              : 'bg-indigo-50 border border-indigo-100'
          }`}>
            <div className="flex items-center gap-2 mb-1.5">
              {msg.from === 'agent' ? (
                <div className="w-5 h-5 rounded-full bg-[#00C5DF]/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#00C5DF]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-600">
                  {msg.from === 'lead' ? '?' : ''}
                </div>
              )}
              <span className={`text-[11px] font-semibold ${msg.from === 'agent' ? 'text-[#00C5DF]' : 'text-indigo-600'}`}>
                {msg.from === 'agent' ? 'Tely AI Agent' : 'Lead'}
              </span>
              <span className="text-[10px] text-surface-400">{msg.date}</span>
            </div>
            {msg.subject && (
              <p className="text-xs font-semibold text-surface-700 mb-1.5">Subject: {msg.subject}</p>
            )}
            <p className="text-[13px] text-surface-700 whitespace-pre-line leading-relaxed">{msg.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Right: Lead Info Card ── */

function LeadInfoPanel({ lead }: { lead: Lead }) {
  const displayStatus = getDisplayStatus(lead.status);
  const style = STATUS_STYLES[displayStatus];

  const fields: { label: string; value: string }[] = [
    { label: 'Email', value: lead.email },
    { label: 'Title', value: lead.title },
    { label: 'Company', value: lead.company },
    { label: 'Industry', value: lead.industry },
    { label: 'Employees', value: lead.employeeCount },
    { label: 'Est. Revenue', value: lead.estimatedRevenue },
    { label: 'Source', value: lead.source },
    { label: 'Referrer', value: lead.referrer || 'Direct' },
    { label: 'First Seen', value: formatDate(lead.createdAt) },
    { label: 'Repeat Visit', value: lead.isRepeatVisit ? 'Yes' : 'No' },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-5 space-y-5">
        {/* Avatar & name */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600 mx-auto">
            {lead.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h3 className="mt-3 text-sm font-semibold text-surface-900">{lead.name}</h3>
          <p className="text-xs text-surface-500">{lead.title}</p>
          <p className="text-xs text-surface-400">{lead.company}</p>
          <div className="mt-2 flex justify-center">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              {style.label}
            </span>
          </div>
        </div>

        {/* LinkedIn */}
        {lead.linkedinUrl && (
          <a
            href={lead.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-[#0A66C2] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            View LinkedIn Profile
          </a>
        )}

        {/* Source page */}
        <div className="bg-surface-50 rounded-lg p-3">
          <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Source Page</p>
          <p className="text-xs text-surface-700 font-mono break-all">{lead.sourceUrl}</p>
        </div>

        {/* Details */}
        <div className="space-y-2.5">
          {fields.map((f) => (
            <div key={f.label} className="flex justify-between items-start">
              <span className="text-[11px] text-surface-400 shrink-0">{f.label}</span>
              <span className="text-[11px] text-surface-700 font-medium text-right ml-3">{f.value}</span>
            </div>
          ))}
        </div>

        {/* Pipeline value */}
        <div className="bg-emerald-50 rounded-lg p-3 text-center">
          <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Lead Value</p>
          <p className="text-lg font-bold text-emerald-700 mt-0.5">
            ${lead.value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Main export ── */

interface ConversationPageProps {
  lead: Lead;
  onBack: () => void;
}

export function ConversationPage({ lead, onBack }: ConversationPageProps) {
  const [messages] = useState(() => generateConversation(lead));
  const firstName = lead.name.split(' ')[0];

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="shrink-0 px-5 py-3 border-b border-surface-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-600 bg-surface-50 border border-surface-200 rounded-lg hover:bg-surface-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Leads
          </button>
          <div className="h-5 w-px bg-surface-200" />
          <h2 className="text-sm font-semibold text-surface-900">
            Conversation with {firstName}
          </h2>
          <span className="text-xs text-surface-400">{lead.company}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-surface-400">
          <svg className="w-3.5 h-3.5 text-[#00C5DF]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          Automated outreach by Tely AI agent
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Agent Rules */}
        <div className="w-[300px] shrink-0 border-r border-surface-200 bg-white">
          <AgentRulesPanel lead={lead} />
        </div>

        {/* Center: Conversation */}
        <div className="flex-1 min-w-0 bg-surface-50 flex flex-col">
          <ConversationThread messages={messages} />
          <div className="shrink-0 px-6 py-3 border-t border-surface-200 bg-white">
            <div className="flex items-center gap-2 text-xs text-surface-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {messages.length} messages &middot; Last activity {messages[messages.length - 1].date}
            </div>
          </div>
        </div>

        {/* Right: Lead Info */}
        <div className="w-[280px] shrink-0 border-l border-surface-200 bg-white">
          <LeadInfoPanel lead={lead} />
        </div>
      </div>
    </div>
  );
}
