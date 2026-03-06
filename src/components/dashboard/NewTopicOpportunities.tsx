'use client';

import { useState } from 'react';
import { CompetitorGapPanel } from './CompetitorGapPanel';
import { ContentIntelligencePanel } from './ContentIntelligencePanel';
import { getCompetitorGapTopics, getContentIntelligence } from '@/data/chart-data';

interface TabConfig {
  id: string;
  label: string;
  initialCount: number;
}

export function NewTopicOpportunities({ excludeIndustries }: { excludeIndustries?: Set<string> }) {
  const [activeTab, setActiveTab] = useState('competitor-gaps');
  const [competitorCount, setCompetitorCount] = useState(() => getCompetitorGapTopics().length);
  const industryCount = getContentIntelligence().filter(
    (g) => g.contentCoverage !== 'strong' && !excludeIndustries?.has(g.industry)
  ).length;

  const tabs: TabConfig[] = [
    { id: 'competitor-gaps', label: 'Competitor Gaps', initialCount: competitorCount },
    { id: 'visitor-industries', label: 'Visitor Industries', initialCount: industryCount },
  ];

  const totalCount = competitorCount + industryCount;

  return (
    <div className="bg-white rounded-[14px] border border-surface-200 shadow-card">
      <div className="px-4 py-3 border-b border-surface-100">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-[#00C5DF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-surface-900">New Topic Opportunities</h3>
            <p className="text-xs text-surface-500 mt-0.5">Discover new topics from competitor analysis and visitor data</p>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-[#00C5DF]/10 text-[#00C5DF] border border-[#00C5DF]/30">
            {totalCount}
          </span>
        </div>
        {/* Tab bar */}
        <div className="flex gap-1 bg-surface-100 rounded-lg p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-surface-900 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              {tab.label}
              <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full ${
                activeTab === tab.id
                  ? 'bg-[#00C5DF]/10 text-[#00C5DF]'
                  : 'bg-surface-200 text-surface-500'
              }`}>
                {tab.initialCount}
              </span>
            </button>
          ))}
        </div>
      </div>
      {activeTab === 'competitor-gaps' && (
        <CompetitorGapPanel onCountChange={setCompetitorCount} />
      )}
      {activeTab === 'visitor-industries' && (
        <ContentIntelligencePanel excludeIndustries={excludeIndustries} />
      )}
    </div>
  );
}
