'use client';

import { useState, useCallback } from 'react';
import { Message } from '@/types';

function generateMockResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes('traffic') && (lower.includes('overview') || lower.includes('trend') || lower.includes('show'))) {
    return 'Here\'s your traffic overview for the last 30 days. Total clicks are up 18% compared to the previous period, with impressions growing steadily. The upward trend indicates your content strategy is gaining momentum.';
  }

  if (lower.includes('top') && (lower.includes('page') || lower.includes('article') || lower.includes('content'))) {
    return 'Your top performing pages are led by "The Complete Guide to AI Content Marketing" which consistently drives the most clicks. Case studies and AI-focused content tend to perform best in terms of both traffic and conversions.';
  }

  if (lower.includes('lead') && (lower.includes('status') || lower.includes('breakdown') || lower.includes('how many'))) {
    return 'You\'ve generated 14 leads this month from content, with an estimated pipeline value of $480,000. The breakdown shows a healthy mix across the funnel: 6 new leads, 4 contacted, 5 qualified, and 8 converted. Only 3 leads were lost.';
  }

  if (lower.includes('roi') || lower.includes('return') || lower.includes('revenue')) {
    return 'Your content marketing ROI is exceptional. With approximately $3,500/month in content spend, you\'ve generated $480,000 in pipeline and $266,000 in converted ARR. That\'s a 76x return on content investment. The average cost per lead from content is $250 vs $1,200 from paid channels.';
  }

  if (lower.includes('categor') || lower.includes('best') || lower.includes('perform')) {
    return 'AI & Automation articles lead performance with the highest average clicks per article, followed by Case Studies. Content Marketing pieces have solid volume but lower per-article performance. Technical SEO articles convert leads at a higher rate despite lower traffic.';
  }

  if (lower.includes('lead') && (lower.includes('table') || lower.includes('list') || lower.includes('all'))) {
    return 'Here\'s the full leads table showing all 30 leads generated through content marketing. Your highest-value converted lead is LogicWare at $55,000 ARR, sourced from the AI Content Marketing Guide. You can sort by any column to analyze patterns.';
  }

  if (lower.includes('traffic')) {
    return 'Your traffic metrics look strong. Over the last 30 days, you\'re seeing consistent growth in both clicks and impressions. Would you like me to show you the daily trend, top pages, or a specific category breakdown?';
  }

  if (lower.includes('lead')) {
    return 'Your content is generating a solid pipeline of leads. This month alone, 14 new leads came through blog content with $480K in estimated pipeline value. Want me to break this down by status, source article, or show the full leads table?';
  }

  return 'I can help you analyze your content marketing performance. Try asking about:\n\n- "Show me the traffic overview"\n- "Which are the top performing pages?"\n- "How many leads did we generate?"\n- "What\'s our content ROI?"\n- "Show me leads by category"\n- "Show me the leads table"';
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(
    (content: string) => {
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      setIsTyping(true);
      setTimeout(() => {
        const responseContent = generateMockResponse(content);
        const aiMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1200);
    },
    []
  );

  return {
    messages,
    isTyping,
    sendMessage,
  };
}
