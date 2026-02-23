'use client';

import { useState } from 'react';
import { Topic } from '@/data/topics';

interface TopicCardProps {
  topic: Topic;
}

export function TopicCard({ topic }: TopicCardProps) {
  const [status, setStatus] = useState(topic.status);

  const visibleKeywords = topic.keywords.slice(0, 4);
  const remainingCount = topic.keywords.length - visibleKeywords.length;

  return (
    <div className="bg-white rounded-lg border border-surface-200 px-5 py-4 flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3">
          <h3 className="text-[15px] font-semibold text-surface-900">{topic.title}</h3>
        </div>
        <p className="text-[13px] text-surface-500 mt-0.5">
          {topic.keywordCount} keywords &middot; from {topic.source}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          {visibleKeywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex px-2.5 py-1 text-xs text-surface-600 bg-surface-100 rounded-md"
            >
              {kw}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="text-xs text-surface-400 ml-1">+{remainingCount} more</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 pt-1">
        {status === 'approved' ? (
          <>
            <button
              onClick={() => setStatus('rejected')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Not relevant
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#00C5DF] bg-[#00C5DF]/10 rounded-md border border-[#00C5DF]/30">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Approved
            </span>
          </>
        ) : (
          <>
            <button
              onClick={() => setStatus('approved')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-500 hover:text-[#00C5DF] hover:bg-[#00C5DF]/10 rounded-md transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md border border-red-200">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Rejected
            </span>
          </>
        )}
      </div>
    </div>
  );
}
