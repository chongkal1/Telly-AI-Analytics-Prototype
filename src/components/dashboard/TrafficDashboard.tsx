'use client';

import { useMemo } from 'react';
import { useDateRange } from '@/hooks/useDateRange';
import { getMetricValue, getContentFunnelData, getTopMovers, getContentFreshnessData, getClusterData, getContentProductionInsights } from '@/data/chart-data';
import { getGeographicData } from '@/data/geography';
import { pages } from '@/data/pages';
import { leads } from '@/data/leads';
import { MetricCard } from '@/components/shared/MetricCard';
import { DashboardWidget } from './DashboardWidget';
import { ContentFunnel } from './traffic/ContentFunnel';
import { TopMovers } from './traffic/TopMovers';
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

/* ── Traffic-to-Outcomes Bridge ── */

function TrafficOutcomesBridge({ startDate, endDate }: { startDate?: string; endDate?: string }) {
  const stats = useMemo(() => {
    const pagesWithLeads = new Set(leads.map((l) => l.sourceUrl));
    const pagesTotal = pages.length;
    const pagesDrivingLeads = pages.filter((p) => pagesWithLeads.has(p.url)).length;
    const totalLeads = leads.length;
    const conversionRate = pagesTotal > 0 ? ((pagesDrivingLeads / pagesTotal) * 100).toFixed(1) : '0';
    const convertedLeads = leads.filter((l) => l.status === 'converted').length;
    const pipelineValue = leads.filter((l) => l.status !== 'lost').reduce((s, l) => s + l.value, 0);

    return { pagesTotal, pagesDrivingLeads, totalLeads, conversionRate, convertedLeads, pipelineValue };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-emerald-50 rounded-lg border border-indigo-100 px-4 py-3">
      <div className="flex items-center justify-between flex-wrap gap-y-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">{stats.pagesDrivingLeads}/{stats.pagesTotal}</span> pages driving leads
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">{stats.totalLeads}</span> leads from content
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">{stats.conversionRate}%</span> page-to-lead rate
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">
            {stats.convertedLeads} converted · ${Math.round(stats.pipelineValue / 1000)}K pipeline
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Content Freshness — Stacked Timeline ── */

const FRESHNESS_COLORS = ['#4f46e5', '#3b82f6', '#f59e0b', '#ef4444'];

function ContentFreshness({ startDate, endDate }: { startDate?: string; endDate?: string }) {
  const data = useMemo(() => getContentFreshnessData(startDate, endDate), [startDate, endDate]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Content Freshness</h3>
        <p className="text-xs text-gray-500 mt-0.5">Traffic share by content age</p>
      </div>
      <div className="p-4">
        {/* Stacked segmented bar */}
        <div className="flex h-10 rounded-lg overflow-hidden">
          {data.map((entry, i) => (
            <div
              key={entry.bucket}
              className="flex items-center justify-center text-white text-xs font-semibold transition-all"
              style={{
                width: `${Math.max(entry.clicksPercentage, 5)}%`,
                backgroundColor: FRESHNESS_COLORS[i],
              }}
            >
              {entry.clicksPercentage >= 10 && `${entry.clicksPercentage}%`}
            </div>
          ))}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          {data.map((entry, i) => (
            <div key={entry.bucket} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: FRESHNESS_COLORS[i] }} />
                <span className="text-xs font-medium text-gray-600">{entry.bucket}</span>
              </div>
              <div className="text-lg font-bold text-gray-900 font-mono">{entry.clicksPercentage}%</div>
              <div className="text-xs text-gray-500 mt-0.5">{entry.totalClicks.toLocaleString()} clicks</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{entry.pageCount} pages</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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

export function TrafficDashboard() {
  const { startDate, endDate, compareEnabled, compareStartDate, compareEndDate } = useDateRange();

  const clusters = useMemo(() => getClusterData(startDate, endDate), [startDate, endDate]);
  const productionInsights = useMemo(
    () => getContentProductionInsights(clusters, startDate, endDate),
    [clusters, startDate, endDate],
  );
  const funnelData = useMemo(() => getContentFunnelData(startDate, endDate, productionInsights), [startDate, endDate, productionInsights]);
  const movers = useMemo(() => getTopMovers(startDate, endDate), [startDate, endDate]);
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

      {/* 2. Traffic-to-Outcomes bridge banner */}
      <TrafficOutcomesBridge startDate={startDate} endDate={endDate} />

      {/* 3. Content Funnel */}
      <ContentFunnel data={funnelData} />

      {/* 4. Organic Traffic Trend (preserved) */}
      <OrganicTrafficTrend />

      {/* 5. Top Movers */}
      <TopMovers rising={movers.rising} falling={movers.falling} />

      {/* 6. Content Freshness */}
      <ContentFreshness startDate={startDate} endDate={endDate} />

      {/* 7. Geography */}
      <GeographySection data={geoData} />

      {/* 8. AI Analytics section */}
      <AIAnalyticsSection />
    </div>
  );
}
