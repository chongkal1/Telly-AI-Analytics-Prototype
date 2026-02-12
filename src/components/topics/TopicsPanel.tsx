'use client';

import { useState } from 'react';
import { topics, topicStats } from '@/data/topics';
import { TopicCard } from './TopicCard';

type TabId = 'topics' | 'alerts';

export function TopicsPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('topics');

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 px-6 shrink-0">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('topics')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'topics'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Topics
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'alerts'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Alerts
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'topics' ? (
          <div className="p-6">
            {/* Info banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-4">
              <p className="text-sm text-gray-800">
                <span className="font-semibold">We found {topicStats.totalTopics} topics for you.</span>
              </p>
              <p className="text-sm text-gray-600 mt-0.5">
                Everything is pre-approved. Scan through &mdash; if something isn&apos;t relevant, hit{' '}
                <span className="font-medium text-gray-800">X Not relevant</span> to remove it.
              </p>
            </div>

            {/* Stats */}
            <div className="flex justify-end mb-3">
              <span className="text-xs text-gray-500">
                {topicStats.totalTopics} topics &middot; {topicStats.totalKeywords} keywords
              </span>
            </div>

            {/* Topic cards */}
            <div className="space-y-3">
              {topics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
              <p className="text-sm text-gray-500">No alerts yet</p>
              <p className="text-xs text-gray-400 mt-1">We&apos;ll notify you when something needs attention.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
