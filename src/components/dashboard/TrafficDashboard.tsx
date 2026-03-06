'use client';

import { useMemo } from 'react';
import { useDateRange } from '@/hooks/useDateRange';
import { getMetricValue, getAllPagesOverview, getChartData } from '@/data/chart-data';
import { getGeographicData } from '@/data/geography';
import { MetricCard } from '@/components/shared/MetricCard';
import { TopPages } from './traffic/TopMovers';
import { GeographySection } from './traffic/GeographySection';
import { UnifiedTrafficTrend } from './traffic/UnifiedTrafficTrend';
import { PieChartWidget } from '@/components/charts/PieChartWidget';

/* ── Organic metric card configs ── */

const ORGANIC_METRICS: { title: string; dataKey: string }[] = [
  { title: 'Articles Published', dataKey: 'totalArticles' },
  { title: 'Total Content Pieces', dataKey: 'totalContentPieces' },
  { title: 'Total Organic Clicks', dataKey: 'totalClicks' },
  { title: 'Total Impressions', dataKey: 'totalImpressions' },
  { title: 'Avg. CTR', dataKey: 'avgCtr' },
  { title: 'Leads Generated', dataKey: 'leadsGenerated' },
];

/* ── Main TrafficDashboard ── */

interface TrafficDashboardProps {
  onPageClick?: (pageId: string) => void;
}

export function TrafficDashboard({ onPageClick }: TrafficDashboardProps) {
  const { startDate, endDate, compareEnabled, compareStartDate, compareEndDate } = useDateRange();

  const allPages = useMemo(() => getAllPagesOverview(startDate, endDate), [startDate, endDate]);
  const geoData = useMemo(() => getGeographicData(), []);
  const engineBreakdown = useMemo(() => {
    const aiEngines = getChartData('aiEngineBreakdown', startDate, endDate) as { name: string; value: number }[];
    const totalAI = aiEngines.reduce((s, e) => s + e.value, 0);
    // Add traditional search engines proportional to AI traffic
    return [
      { name: 'Google', value: Math.round(totalAI * 4.2) },
      { name: 'Bing', value: Math.round(totalAI * 0.45) },
      { name: 'DuckDuckGo', value: Math.round(totalAI * 0.08) },
      { name: 'Yahoo', value: Math.round(totalAI * 0.12) },
      ...aiEngines,
    ];
  }, [startDate, endDate]);

  return (
    <div className="space-y-4">
      {/* 1. Metric cards */}
      <div
        className="gap-4"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
        }}
      >
        {ORGANIC_METRICS.map((m) => {
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

      {/* 2. Traffic Trend + Citations by Engine */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3">
          <UnifiedTrafficTrend />
        </div>
        <div className="col-span-1">
          <div className="bg-white rounded-[14px] border border-surface-200 shadow-card p-4 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-surface-900 mb-2">Traffic by Engine</h3>
            <div className="flex-1 min-h-0">
              <PieChartWidget data={engineBreakdown} height={260} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Top Pages */}
      <TopPages pages={allPages} onPageClick={onPageClick} />

      {/* 4. Geography */}
      <GeographySection data={geoData} />
    </div>
  );
}
