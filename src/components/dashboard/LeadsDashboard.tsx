'use client';

import { useMemo, useState } from 'react';
import { leads } from '@/data/leads';
import { pages } from '@/data/pages';
import { useDateRange } from '@/hooks/useDateRange';
import { getMetricValue, getChartData } from '@/data/chart-data';
import { MetricCard } from '@/components/shared/MetricCard';
import { PieChartWidget } from '@/components/charts/PieChartWidget';
import { IdentifiedVisitorsTable } from './leads/IdentifiedVisitorsTable';
import { RecentLeadsTable } from './leads/RecentLeadsTable';

const LEAD_METRICS: { title: string; dataKey: string }[] = [
  { title: 'Identified Visitors', dataKey: 'identifiedVisitors' },
  { title: 'Organic Leads Captured', dataKey: 'organicLeadsCaptured' },
  { title: 'Pipeline Value', dataKey: 'totalPipelineValue' },
];

const CAPTURED_STATUSES = new Set(['contacted', 'qualified', 'converted']);

type GroupMode = 'industry' | 'cluster';

// Map sourceUrl → topical cluster (category)
const urlToCategory: Record<string, string> = {};
pages.forEach((p) => { urlToCategory[p.url] = p.category; });

function groupByCluster(items: typeof leads): { name: string; value: number }[] {
  const counts: Record<string, number> = {};
  items.forEach((l) => {
    const cluster = urlToCategory[l.sourceUrl] || 'Other';
    counts[cluster] = (counts[cluster] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function SegmentedToggle({ value, onChange }: { value: GroupMode; onChange: (v: GroupMode) => void }) {
  return (
    <div className="inline-flex rounded-md border border-gray-200 bg-gray-50 p-0.5 text-xs">
      <button
        onClick={() => onChange('industry')}
        className={`px-2.5 py-1 rounded transition-colors ${
          value === 'industry'
            ? 'bg-white text-gray-900 shadow-sm font-medium'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        By Industry
      </button>
      <button
        onClick={() => onChange('cluster')}
        className={`px-2.5 py-1 rounded transition-colors ${
          value === 'cluster'
            ? 'bg-white text-gray-900 shadow-sm font-medium'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        By Topic
      </button>
    </div>
  );
}

export function LeadsDashboard() {
  const { startDate, endDate, compareEnabled, compareStartDate, compareEndDate } = useDateRange();
  const [visitorsGroupMode, setVisitorsGroupMode] = useState<GroupMode>('industry');
  const [leadsGroupMode, setLeadsGroupMode] = useState<GroupMode>('industry');

  const visitorsByIndustry = useMemo(
    () => getChartData('leadsByIndustry', startDate, endDate) as { name: string; value: number }[],
    [startDate, endDate],
  );

  const visitorsByCluster = useMemo(() => groupByCluster(leads), []);

  const capturedByIndustry = useMemo(
    () => getChartData('capturedLeadsByIndustry', startDate, endDate) as { name: string; value: number }[],
    [startDate, endDate],
  );

  const capturedLeads = useMemo(
    () => leads.filter((l) => CAPTURED_STATUSES.has(l.status)),
    [],
  );

  const capturedByCluster = useMemo(() => groupByCluster(capturedLeads), [capturedLeads]);

  const visitorsData = visitorsGroupMode === 'industry' ? visitorsByIndustry : visitorsByCluster;
  const leadsData = leadsGroupMode === 'industry' ? capturedByIndustry : capturedByCluster;
  const visitorsLabel = visitorsGroupMode === 'industry' ? 'Visitors by Industry' : 'Visitors by Topic';
  const leadsLabel = leadsGroupMode === 'industry' ? 'Leads by Industry' : 'Leads by Topic';

  return (
    <div className="space-y-4">
      {/* Row 1: 3 metric cards */}
      <div
        className="gap-4"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        }}
      >
        {LEAD_METRICS.map((m) => {
          const { value, change, previousValue } = getMetricValue(
            m.dataKey,
            startDate,
            endDate,
            compareEnabled ? compareStartDate : undefined,
            compareEnabled ? compareEndDate : undefined,
          );
          return (
            <MetricCard
              key={m.dataKey}
              label={m.title}
              value={value}
              change={change}
              previousValue={previousValue}
              showComparison={compareEnabled}
            />
          );
        })}
      </div>

      {/* Row 2: 2 pie charts with toggles */}
      <div
        className="gap-4"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        }}
      >
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">{visitorsLabel}</h3>
            <SegmentedToggle value={visitorsGroupMode} onChange={setVisitorsGroupMode} />
          </div>
          <PieChartWidget data={visitorsData} height={240} />
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">{leadsLabel}</h3>
            <SegmentedToggle value={leadsGroupMode} onChange={setLeadsGroupMode} />
          </div>
          <PieChartWidget data={leadsData} height={240} />
        </div>
      </div>

      {/* Row 3: Identified Visitors table */}
      <IdentifiedVisitorsTable visitors={leads} />

      {/* Row 4: Recent Leads table */}
      <RecentLeadsTable leads={capturedLeads} />
    </div>
  );
}
