'use client';

import { useState } from 'react';
import { getCompetitorGapTopics } from '@/data/chart-data';
import { CompetitorGapTopic } from '@/types';

function ImpactBadge({ impact }: { impact: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { label: 'High Impact', bg: 'bg-[#00C5DF]/10', text: 'text-[#00C5DF]' },
    medium: { label: 'Medium Impact', bg: 'bg-amber-50', text: 'text-amber-700' },
    low: { label: 'Low Impact', bg: 'bg-surface-100', text: 'text-surface-600' },
  }[impact];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

export function CompetitorGapPanel({ onCountChange }: { onCountChange?: (count: number) => void }) {
  const [topics, setTopics] = useState<CompetitorGapTopic[]>(() => getCompetitorGapTopics());

  const handleApprove = (topic: CompetitorGapTopic) => {
    window.dispatchEvent(new CustomEvent('topic-approved', {
      detail: {
        name: topic.topic,
        description: topic.rationale,
        source: 'competitor-gap',
      },
    }));
    const next = topics.filter((t) => t.id !== topic.id);
    setTopics(next);
    onCountChange?.(next.length);
  };

  const handleDismiss = (topicId: string) => {
    const next = topics.filter((t) => t.id !== topicId);
    setTopics(next);
    onCountChange?.(next.length);
  };

  if (topics.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-surface-400">
        No competitor gap topics remaining.
      </div>
    );
  }

  return (
    <div className="divide-y divide-surface-100">
      {topics.map((topic) => (
        <div key={topic.id} className="px-4 py-3 hover:bg-surface-50 transition-colors">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-semibold text-surface-900">{topic.topic}</h4>
              <ImpactBadge impact={topic.estimatedImpact} />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleApprove(topic)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#00C5DF] bg-[#00C5DF]/10 border border-[#00C5DF]/30 rounded-md hover:bg-[#00C5DF]/20 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Approve
              </button>
              <button
                onClick={() => handleDismiss(topic.id)}
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-surface-400 border border-surface-200 rounded-md hover:text-surface-600 hover:border-surface-300 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.07-9.07l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757" />
              </svg>
              Found on: {topic.competitor}
            </span>
          </div>
          <p className="text-xs text-surface-600 leading-relaxed mb-2">{topic.rationale}</p>
          <div className="flex flex-wrap gap-1.5">
            {topic.keywords.map((kw) => (
              <span key={kw} className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-surface-100 text-surface-600">
                {kw}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
