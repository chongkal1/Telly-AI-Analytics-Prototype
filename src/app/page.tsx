// Telly AI Analytics Prototype
'use client';

import { useState, useEffect } from 'react';
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

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'traffic', label: 'Traffic' },
  { id: 'clusters', label: 'Topics' },
  { id: 'leads', label: 'Leads' },
  { id: 'reports', label: 'Reports' },
];

const tabTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  traffic: 'Traffic',
  clusters: 'Topics',
  leads: 'Leads',
  reports: 'Reports',
};


export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [fullPage, setFullPage] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && tabs.some(t => t.id === tab)) setActiveTab(tab);
    const article = params.get('article');
    if (article) setSelectedArticleId(article);
    if (params.get('fullpage') === '1') setFullPage(true);
  }, []);

  return (
    <DateRangeProvider>
      <div className={fullPage ? 'flex' : 'h-screen flex'}>
        {/* Icon sidebar */}
        <Sidebar />

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
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-lg font-semibold text-surface-900">{tabTitles[activeTab]}</h1>
                {activeTab !== 'reports' && <DateRangePicker />}
              </div>
              <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
              {activeTab === 'dashboard' ? (
                <DashboardSummary onNavigate={setActiveTab} />
              ) : activeTab === 'traffic' ? (
                <TrafficDashboard onPageClick={setSelectedArticleId} />
              ) : activeTab === 'clusters' ? (
                <TopicalClusters />
              ) : activeTab === 'leads' ? (
                <LeadsDashboard />
              ) : activeTab === 'reports' ? (
                <ReportsDashboard />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </DateRangeProvider>
  );
}
