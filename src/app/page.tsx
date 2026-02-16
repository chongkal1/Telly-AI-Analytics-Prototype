// Telly AI Analytics Prototype
'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { TopicalClusters } from '@/components/dashboard/TopicalClusters';
import { DashboardSummary } from '@/components/dashboard/DashboardSummary';
import { TrafficDashboard } from '@/components/dashboard/TrafficDashboard';
import { DateRangeProvider } from '@/hooks/useDateRange';
import { dashboards } from '@/data/dashboards';

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'traffic', label: 'Traffic' },
  { id: 'clusters', label: 'Topical Clusters' },
  { id: 'leads', label: 'Leads' },
];

const tabTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  traffic: 'Traffic',
  clusters: 'Topical Clusters',
  leads: 'Leads',
};

const dashboardByTab: Record<string, typeof dashboards[number] | undefined> = {
  traffic: dashboards[0],
  leads: dashboards[1],
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <DateRangeProvider>
      <div className="h-screen flex">
        {/* Icon sidebar */}
        <Sidebar />

        {/* Chat panel */}
        <div className="w-[380px] shrink-0 border-r border-gray-200 bg-white flex flex-col min-h-0">
          <ChatPanel />
        </div>

        {/* Main dashboard */}
        <div className="flex-1 min-w-0 min-h-0 overflow-y-auto bg-gray-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-semibold text-gray-900">{tabTitles[activeTab]}</h1>
              <DateRangePicker />
            </div>
            <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
            {activeTab === 'dashboard' ? (
              <DashboardSummary onNavigate={setActiveTab} />
            ) : activeTab === 'traffic' ? (
              <TrafficDashboard />
            ) : activeTab === 'clusters' ? (
              <TopicalClusters />
            ) : (
              dashboardByTab[activeTab] && <DashboardGrid dashboard={dashboardByTab[activeTab]!} />
            )}
          </div>
        </div>
      </div>
    </DateRangeProvider>
  );
}
