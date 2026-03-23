// Telly AI Analytics Prototype
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLastUpdatedProvider } from '@/hooks/useLastUpdated';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { TopicalClusters } from '@/components/dashboard/TopicalClusters';
import { DashboardSummary } from '@/components/dashboard/DashboardSummary';
import { TrafficDashboard } from '@/components/dashboard/TrafficDashboard';
import { LeadsDashboard } from '@/components/dashboard/LeadsDashboard';
import { ReportsDashboard } from '@/components/dashboard/reports/ReportsDashboard';
import { ArticleDetail } from '@/components/article/ArticleDetail';
import { DateRangeProvider } from '@/hooks/useDateRange';
import { MaturityStageProvider } from '@/hooks/useMaturityStage';
import { DealSizeProvider } from '@/hooks/useDealSize';
import { MaturityStageSwitcher } from '@/components/dashboard/MaturityStageSwitcher';
import { ConversationPage } from '@/components/dashboard/leads/ConversationPage';
import { HandoffPage } from '@/components/dashboard/HandoffPage';
import { Lead } from '@/types';

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'traffic', label: 'Traffic' },
  { id: 'clusters', label: 'Topics' },
  { id: 'leads', label: 'Leads' },
  { id: 'reports', label: 'Reports' },
  { id: 'handoff', label: 'Handoff' },
];

const tabTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  traffic: 'Traffic',
  clusters: 'Topics',
  leads: 'Leads',
  reports: 'Reports',
  handoff: 'Handoff',
};


export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [conversationLead, setConversationLead] = useState<Lead | null>(null);
  const [fullPage, setFullPage] = useState(false);
  const { lastUpdatedText, syncing, refresh, Provider: LastUpdatedProvider } = useLastUpdatedProvider();
  const lastUpdatedValue = useMemo(() => ({ lastUpdatedText, syncing, refresh }), [lastUpdatedText, syncing, refresh]);

  const showSyncRow = ['dashboard', 'traffic', 'clusters', 'leads'].includes(activeTab);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && tabs.some(t => t.id === tab)) setActiveTab(tab);
    const article = params.get('article');
    if (article) setSelectedArticleId(article);
    if (params.get('fullpage') === '1') setFullPage(true);
  }, []);

  return (
    <MaturityStageProvider>
    <DealSizeProvider>
    <DateRangeProvider>
      <div className={fullPage ? 'flex' : 'h-screen flex'}>
        {/* Icon sidebar */}
        <Sidebar />

        {conversationLead ? (
          /* Full-width conversation page (replaces chat + dashboard) */
          <div className={`flex-1 min-w-0 bg-surface-50 ${fullPage ? '' : 'min-h-0'}`}>
            <ConversationPage lead={conversationLead} onBack={() => setConversationLead(null)} />
          </div>
        ) : (
          <>
            {/* Chat panel */}
            <div className={`w-[380px] shrink-0 border-r border-surface-200 bg-white flex flex-col ${fullPage ? '' : 'min-h-0'}`}>
              <ChatPanel />
            </div>

            {/* Main dashboard */}
            <div className={`flex-1 min-w-0 bg-surface-50 ${fullPage ? '' : 'min-h-0 overflow-y-auto'}`}>
              {selectedArticleId ? (
                <ArticleDetail
                  articleId={selectedArticleId}
                  onBack={() => setSelectedArticleId(null)}
                />
              ) : (
                <div className="p-6">
                  {activeTab === 'dashboard' && <MaturityStageSwitcher />}
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-lg font-semibold text-surface-900">{tabTitles[activeTab]}</h1>
                    <div className="flex items-center gap-4">
                      {showSyncRow && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-surface-400">Updated {lastUpdatedText}</span>
                          <span className="text-xs text-surface-300">&middot;</span>
                          <button
                            onClick={refresh}
                            disabled={syncing}
                            className="text-xs text-indigo-500 hover:text-indigo-600 font-medium cursor-pointer disabled:opacity-50 flex items-center gap-1"
                          >
                            {syncing && (
                              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            )}
                            Sync now
                          </button>
                        </div>
                      )}
                      {activeTab !== 'reports' && activeTab !== 'handoff' && <DateRangePicker />}
                    </div>
                  </div>
                  <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
                  <LastUpdatedProvider value={lastUpdatedValue}>
                    {activeTab === 'dashboard' ? (
                      <DashboardSummary onNavigate={setActiveTab} />
                    ) : activeTab === 'traffic' ? (
                      <TrafficDashboard onPageClick={setSelectedArticleId} />
                    ) : activeTab === 'clusters' ? (
                      <TopicalClusters />
                    ) : activeTab === 'leads' ? (
                      <LeadsDashboard onOpenConversation={setConversationLead} />
                    ) : activeTab === 'reports' ? (
                      <ReportsDashboard />
                    ) : activeTab === 'handoff' ? (
                      <HandoffPage />
                    ) : null}
                  </LastUpdatedProvider>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DateRangeProvider>
    </DealSizeProvider>
    </MaturityStageProvider>
  );
}
