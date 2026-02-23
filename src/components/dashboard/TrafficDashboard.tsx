'use client';

import { useMemo } from 'react';
import { useDateRange } from '@/hooks/useDateRange';
import { getMetricValue, getAllPagesOverview } from '@/data/chart-data';
import { getGeographicData } from '@/data/geography';
import { aiPageCitations } from '@/data/ai-analytics';
import { MetricCard } from '@/components/shared/MetricCard';
import { DashboardWidget } from './DashboardWidget';
import { TopPages } from './traffic/TopMovers';
import { AIPageVisibility } from './traffic/AIPageVisibility';
import { GeographySection } from './traffic/GeographySection';
import { dashboards } from '@/data/dashboards';
import { Widget } from '@/types';

/* ── Organic metric card configs ── */

const ORGANIC_METRICS: { title: string; dataKey: string }[] = [
  { title: 'Articles Published', dataKey: 'totalArticles' },
  { title: 'Total Content Pieces', dataKey: 'totalContentPieces' },
  { title: 'Total Organic Clicks', dataKey: 'totalClicks' },
  { title: 'Total Impressions', dataKey: 'totalImpressions' },
  { title: 'Avg. CTR', dataKey: 'avgCtr' },
  { title: 'Leads Generated', dataKey: 'leadsGenerated' },
];

/* ── AI Analytics section ── */

function AIAnalyticsSection() {
  // Get all AI widgets from the traffic dashboard config
  const trafficDashboard = dashboards[0];
  const aiWidgetStartIndex = trafficDashboard.widgets.findIndex((w) => w.type === 'section' && w.title === 'AI Analytics');
  const aiWidgets: Widget[] = aiWidgetStartIndex >= 0
    ? trafficDashboard.widgets.slice(aiWidgetStartIndex)
    : [];

  return (
    <div
      className="gap-4"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
      }}
    >
      {aiWidgets.map((widget) => (
        <div
          key={widget.id}
          style={{ gridColumn: `span ${Math.min(widget.colSpan, 12)}` }}
          className="min-w-0"
        >
          <DashboardWidget widget={widget} />
        </div>
      ))}
    </div>
  );
}

/* ── Organic Traffic Trend (preserved from DashboardWidget) ── */

function OrganicTrafficTrend() {
  const trafficDashboard = dashboards[0];
  const trendWidget = trafficDashboard.widgets.find((w) => w.dataKey === 'dailyTraffic' && w.type === 'line');

  if (!trendWidget) return null;

  return (
    <div className="min-w-0">
      <DashboardWidget widget={trendWidget} />
    </div>
  );
}

/* ── Main TrafficDashboard ── */

interface TrafficDashboardProps {
  onPageClick?: (pageId: string) => void;
}

export function TrafficDashboard({ onPageClick }: TrafficDashboardProps) {
  const { startDate, endDate, compareEnabled, compareStartDate, compareEndDate } = useDateRange();

  const allPages = useMemo(() => getAllPagesOverview(startDate, endDate), [startDate, endDate]);
  const geoData = useMemo(() => getGeographicData(), []);

  return (
    <div className="space-y-4">
      {/* 1. Organic metric cards */}
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

      {/* 2. Organic Traffic Trend */}
      <OrganicTrafficTrend />

      {/* 5. Top Pages */}
      <TopPages pages={allPages} onPageClick={onPageClick} />

      {/* 6. Geography */}
      <GeographySection data={geoData} />

      {/* 8. AI Analytics section */}
      <AIAnalyticsSection />

      {/* 9. AI Page Visibility */}
      <AIPageVisibility data={aiPageCitations} onPageClick={onPageClick} />
    </div>
  );
}
