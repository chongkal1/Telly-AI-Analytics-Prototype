'use client';

import { useState, useCallback } from 'react';
import { Message, MessageAction } from '@/types';

interface MockResponse {
  content: string;
  actions?: MessageAction[];
}

function generateMockResponse(input: string): MockResponse {
  const lower = input.toLowerCase();

  // Handle cluster creation confirmation
  if (lower.includes('everything looks good') || lower.includes('looks good, proceed') || lower.includes('proceed with')) {
    return {
      content: 'Great! I\'ll start creating the topical cluster now. Here\'s what I\'m doing:\n\n1. Setting up the cluster structure with pillar and supporting pages\n2. Generating content briefs for each topic\n3. Planning internal linking architecture\n4. Scheduling content production timeline\n\nYou\'ll see the new cluster appear in your Topical Clusters view once the first articles are drafted. I\'ll notify you when briefs are ready for review.',
    };
  }

  // Handle cluster refinement requests
  if (lower.includes('specify') || lower.includes('focus on') || lower.includes('promote') || lower.includes('adjust the topics')) {
    return {
      content: 'Sure! Tell me more about what you\'d like to focus on. For example:\n\n- What specific solutions or products should the content promote?\n- Are there particular pain points or use cases to target?\n- Any competitor angles or positioning to include?\n- Preferred content formats (guides, case studies, comparisons)?',
    };
  }

  // Handle cluster creation messages from the button
  if (lower.includes('i\'m planning to create') && lower.includes('cluster')) {
    return {
      content: generateClusterPlan(input),
      actions: [
        { label: 'Everything looks good, proceed', message: 'Everything looks good, proceed with creating this cluster.' },
        { label: 'I want to adjust the topics', message: 'I\'d like to adjust the topics. Let me specify what solutions I want to promote.' },
      ],
    };
  }

  if (lower.includes('traffic') && (lower.includes('overview') || lower.includes('trend') || lower.includes('show'))) {
    return { content: 'Here\'s your traffic overview for the last 30 days. Total clicks are up 18% compared to the previous period, with impressions growing steadily. The upward trend indicates your content strategy is gaining momentum.' };
  }

  if (lower.includes('top') && (lower.includes('page') || lower.includes('article') || lower.includes('content'))) {
    return { content: 'Your top performing pages are led by "The Complete Guide to AI Content Marketing" which consistently drives the most clicks. Case studies and AI-focused content tend to perform best in terms of both traffic and conversions.' };
  }

  if (lower.includes('lead') && (lower.includes('status') || lower.includes('breakdown') || lower.includes('how many'))) {
    return { content: 'You\'ve generated 14 leads this month from content, with an estimated pipeline value of $480,000. The breakdown shows a healthy mix across the funnel: 6 new leads, 4 contacted, 5 qualified, and 8 converted. Only 3 leads were lost.' };
  }

  if (lower.includes('roi') || lower.includes('return') || lower.includes('revenue')) {
    return { content: 'Your content marketing ROI is exceptional. With approximately $3,500/month in content spend, you\'ve generated $480,000 in pipeline and $266,000 in converted ARR. That\'s a 76x return on content investment. The average cost per lead from content is $250 vs $1,200 from paid channels.' };
  }

  if (lower.includes('categor') || lower.includes('best') || lower.includes('perform')) {
    return { content: 'AI & Automation articles lead performance with the highest average clicks per article, followed by Case Studies. Content Marketing pieces have solid volume but lower per-article performance. Technical SEO articles convert leads at a higher rate despite lower traffic.' };
  }

  if (lower.includes('lead') && (lower.includes('table') || lower.includes('list') || lower.includes('all'))) {
    return { content: 'Here\'s the full leads table showing all 30 leads generated through content marketing. Your highest-value converted lead is LogicWare at $55,000 ARR, sourced from the AI Content Marketing Guide. You can sort by any column to analyze patterns.' };
  }

  if (lower.includes('traffic')) {
    return { content: 'Your traffic metrics look strong. Over the last 30 days, you\'re seeing consistent growth in both clicks and impressions. Would you like me to show you the daily trend, top pages, or a specific category breakdown?' };
  }

  if (lower.includes('lead')) {
    return { content: 'Your content is generating a solid pipeline of leads. This month alone, 14 new leads came through blog content with $480K in estimated pipeline value. Want me to break this down by status, source article, or show the full leads table?' };
  }

  return { content: 'I can help you analyze your content marketing performance. Try asking about:\n\n- "Show me the traffic overview"\n- "Which are the top performing pages?"\n- "How many leads did we generate?"\n- "What\'s our content ROI?"\n- "Show me leads by category"\n- "Show me the leads table"' };
}

function generateClusterPlan(input: string): string {
  // Extract industry name from the message
  const match = input.match(/create a (.+?) topical cluster/i);
  const industry = match ? match[1] : 'the target';

  return `Great idea! Here\'s my plan for the **${industry}** topical cluster:\n\n**Pillar Page:** "${industry} Solutions Guide — How Modern Teams Drive Results"\n\n**Supporting Content:**\n• Comparison guide: "Top ${industry} Tools in 2026"\n• Case study template targeting ${industry} decision-makers\n• ROI calculator / interactive content piece\n• Best practices guide for ${industry} workflows\n\n**Target Keywords:** ${industry.toLowerCase()}-specific long-tail terms with commercial intent\n\n**Estimated Impact:** Based on current visitor data, this cluster could capture additional organic traffic from the ${industry} segment and improve conversion rates for existing visitors.\n\nWould you like to proceed with this plan, or would you like to adjust the topics to focus on specific solutions you want to promote?`;
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
        const response = generateMockResponse(content);
        const aiMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: response.content,
          timestamp: new Date().toISOString(),
          actions: response.actions,
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
