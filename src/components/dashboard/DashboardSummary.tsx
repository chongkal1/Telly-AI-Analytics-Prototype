'use client';

import { useMemo, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useDateRange } from '@/hooks/useDateRange';
import { getChartData, getMetricValue, getClusterData, getContentFunnelData, getTopMovers, getContentProductionInsights, getContentIntelligence } from '@/data/chart-data';
import { pages } from '@/data/pages';
import { leads } from '@/data/leads';
import { getPageMetrics } from '@/data/traffic';
import { filterAITrafficByDate, dailyAITraffic, AI_ENGINES, getAIMetrics } from '@/data/ai-analytics';
import { CHART_COLORS } from '@/lib/constants';
import { formatDateShort } from '@/lib/utils';
import { TrendIndicator } from '@/components/shared/TrendIndicator';
import { CTAPerformanceCard } from '@/components/dashboard/CTAPerformanceCard';
import { DailyTraffic } from '@/types';

/* ── Tiny sparkline (no axes) ── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Sparkline({ data, dataKey, color, height = 40 }: { data: any[]; dataKey: string; color: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ── Compact stat card (now clickable) ── */

function StatCard({ label, value, change, suffix, sparkData, sparkKey, sparkColor, onClick }: {
  label: string;
  value: string;
  change?: number | null;
  suffix?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sparkData?: any[];
  sparkKey?: string;
  sparkColor?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm p-3 flex flex-col justify-between min-h-[88px] ${
        onClick ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all' : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <dt className="text-xs font-medium text-gray-500 truncate">{label}</dt>
      <div className="flex items-end justify-between gap-2 mt-1">
        <div>
          <dd className="text-xl font-semibold text-gray-900 font-mono leading-tight">
            {value}{suffix && <span className="text-sm text-gray-500 ml-0.5">{suffix}</span>}
          </dd>
          {change !== undefined && change !== null && (
            <div className="mt-0.5">
              <TrendIndicator change={change} />
            </div>
          )}
        </div>
        {sparkData && sparkKey && (
          <div className="w-16 shrink-0">
            <Sparkline data={sparkData} dataKey={sparkKey} color={sparkColor || CHART_COLORS.indigo} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Section header with optional "View details >" link ── */

function SectionHeader({ title, onNavigate, className }: { title: string; onNavigate?: () => void; className?: string }) {
  return (
    <div className={`px-3 py-2 border-b border-gray-100 flex items-center justify-between ${className || ''}`}>
      <h3 className="text-xs font-semibold text-gray-700">{title}</h3>
      {onNavigate && (
        <button
          onClick={onNavigate}
          className="text-[10px] font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
        >
          View details &gt;
        </button>
      )}
    </div>
  );
}

/* ── Rate ring (circular progress) ── */

function RateRing({ label, value, color }: { label: string; value: number; color: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={68} height={68} className="-rotate-90">
        <circle cx={34} cy={34} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={5} />
        <circle
          cx={34} cy={34} r={radius} fill="none"
          stroke={color} strokeWidth={5}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span className="text-lg font-semibold text-gray-900 font-mono -mt-[52px]">{value}%</span>
      <span className="text-[10px] font-medium text-gray-500 mt-4 text-center leading-tight">{label}</span>
    </div>
  );
}

/* ── Top clusters mini table ── */

function TopClustersTable({ clusters, onNavigate }: { clusters: { category: string; totalClicks: number; clicksChange: number; pageCount: number }[]; onNavigate?: () => void }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <SectionHeader title="Top Growing Clusters" onNavigate={onNavigate} />
      <div className="divide-y divide-gray-100">
        {clusters.map((c) => (
          <div key={c.category} className="flex items-center justify-between px-3 py-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{c.category}</p>
              <p className="text-[10px] text-gray-400">{c.pageCount} pages</p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-sm font-mono text-gray-700">{c.totalClicks.toLocaleString()}</p>
              <TrendIndicator change={c.clicksChange} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Content Funnel Mini ── */

function ContentFunnelMini({ funnelData, onClick }: { funnelData: { stage: string; count: number; percentage: number }[]; onClick?: () => void }) {
  const stageColors = ['bg-indigo-50 text-indigo-700 border-indigo-200', 'bg-blue-50 text-blue-700 border-blue-200', 'bg-emerald-50 text-emerald-700 border-emerald-200', 'bg-amber-50 text-amber-700 border-amber-200'];
  const arrowColor = ['text-indigo-300', 'text-blue-300', 'text-emerald-300'];

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all' : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <div className="px-3 py-2 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-700">Content Funnel</h3>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1">
          {funnelData.map((stage, i) => (
            <div key={stage.stage} className="flex items-center gap-1 flex-1">
              <div className={`flex-1 rounded-md border px-2 py-1.5 text-center ${stageColors[i]}`}>
                <p className="text-[10px] font-medium opacity-70">{stage.stage}</p>
                <p className="text-sm font-semibold font-mono">{stage.count >= 1000 ? `${(stage.count / 1000).toFixed(1)}K` : stage.count.toLocaleString()}</p>
                {i > 0 && (
                  <p className="text-[9px] opacity-60">{stage.percentage}%</p>
                )}
              </div>
              {i < funnelData.length - 1 && (
                <span className={`text-xs ${arrowColor[i]}`}>&rarr;</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Top Movers Mini ── */

function TopMoversMini({ rising, falling, onNavigate }: {
  rising: { id: string; title: string; clicks: number; clicksChange: number }[];
  falling: { id: string; title: string; clicks: number; clicksChange: number }[];
  onNavigate?: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <SectionHeader title="Top Movers" onNavigate={onNavigate} />
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        {/* Rising */}
        <div className="divide-y divide-gray-50">
          <div className="px-3 py-1.5">
            <span className="text-[10px] font-medium text-emerald-600">Rising</span>
          </div>
          {rising.slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-center justify-between px-3 py-1.5">
              <p className="text-xs text-gray-700 truncate mr-2 max-w-[180px]">{p.title}</p>
              <div className="shrink-0">
                <TrendIndicator change={p.clicksChange} />
              </div>
            </div>
          ))}
        </div>
        {/* Falling */}
        <div className="divide-y divide-gray-50">
          <div className="px-3 py-1.5">
            <span className="text-[10px] font-medium text-red-600">Falling</span>
          </div>
          {falling.slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-center justify-between px-3 py-1.5">
              <p className="text-xs text-gray-700 truncate mr-2 max-w-[180px]">{p.title}</p>
              <div className="shrink-0">
                <TrendIndicator change={p.clicksChange} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Lead Pipeline Mini ── */

const PIPELINE_COLORS: Record<string, string> = {
  new: '#6366f1',
  contacted: '#3b82f6',
  qualified: '#f59e0b',
  converted: '#10b981',
  lost: '#ef4444',
};

function LeadPipelineMini({ onClick }: { onClick?: () => void }) {
  const statusCounts: Record<string, number> = {};
  leads.forEach((l) => { statusCounts[l.status] = (statusCounts[l.status] || 0) + 1; });
  const total = leads.length;
  const stages = ['new', 'contacted', 'qualified', 'converted', 'lost'];

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all' : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <div className="px-3 py-2 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-700">Lead Pipeline</h3>
      </div>
      <div className="p-3">
        {/* Segmented bar */}
        <div className="flex h-3 rounded-full overflow-hidden mb-2">
          {stages.map((s) => {
            const count = statusCounts[s] || 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={s}
                style={{ width: `${pct}%`, backgroundColor: PIPELINE_COLORS[s] }}
                className="transition-all duration-300"
                title={`${s}: ${count}`}
              />
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {stages.map((s) => {
            const count = statusCounts[s] || 0;
            return (
              <span key={s} className="inline-flex items-center gap-1 text-[10px] text-gray-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIPELINE_COLORS[s] }} />
                {s.charAt(0).toUpperCase() + s.slice(1)}: {count}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Content Gaps Alert ── */

function ContentGapsAlert({ weakCount, onClick }: { weakCount: number; onClick?: () => void }) {
  if (weakCount === 0) return null;

  return (
    <div
      className={`bg-amber-50 rounded-lg border border-amber-200 shadow-sm overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-amber-300 hover:shadow-md transition-all' : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <div className="p-3 flex items-start gap-2">
        <span className="text-amber-500 text-sm mt-0.5">&#9888;</span>
        <div>
          <p className="text-xs font-semibold text-amber-800">{weakCount} industries with weak content coverage</p>
          <p className="text-[10px] text-amber-600 mt-0.5">Create targeted content to capture leads from underserved verticals</p>
        </div>
      </div>
    </div>
  );
}

/* ── Production Intelligence Strip ── */

function ProductionIntelligenceStrip({ insights, onNavigate }: {
  insights: { priority: string; priorityLabel: string; count: number; color: string }[];
  onNavigate?: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <SectionHeader title="Production Intelligence" onNavigate={onNavigate} />
      <div className="px-3 py-2.5 flex items-center gap-4">
        {insights.map((g) => (
          <div key={g.priority} className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: g.color }}
            >
              {g.count}
            </span>
            <span className="text-xs text-gray-600">{g.priorityLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Visibility chart with organic + AI toggle ── */

type VisibilityView = 'organic' | 'ai' | 'combined';

function VisibilityChart({ organicData, startDate, endDate, onNavigate }: { organicData: DailyTraffic[]; startDate?: string; endDate?: string; onNavigate?: () => void }) {
  const [view, setView] = useState<VisibilityView>('combined');

  const aiData = useMemo(
    () => filterAITrafficByDate(dailyAITraffic, startDate, endDate),
    [startDate, endDate],
  );

  const aiMetrics = useMemo(() => getAIMetrics(startDate, endDate), [startDate, endDate]);

  // Merge organic + AI data by date for combined view
  const chartData = useMemo(() => {
    const aiByDate: Record<string, typeof aiData[number]> = {};
    aiData.forEach((d) => { aiByDate[d.date] = d; });

    const organicRecent = organicData.slice(-28);
    return organicRecent.map((d) => {
      const ai = aiByDate[d.date];
      return {
        date: formatDateShort(d.date),
        'Organic Clicks': d.clicks,
        Impressions: d.impressions,
        ChatGPT: ai?.chatgpt ?? 0,
        Perplexity: ai?.perplexity ?? 0,
        Gemini: ai?.gemini ?? 0,
        Claude: ai?.claude ?? 0,
        Copilot: ai?.copilot ?? 0,
        'Meta AI': ai?.metaAi ?? 0,
        'AI Total': ai?.citations ?? 0,
      };
    });
  }, [organicData, aiData]);

  // Total AI clicks for the summary badges
  const totalAIClicks = aiData.reduce((s, d) => s + d.citations, 0);

  const viewTabs: { id: VisibilityView; label: string }[] = [
    { id: 'combined', label: 'All Traffic' },
    { id: 'organic', label: 'Organic' },
    { id: 'ai', label: 'AI Engines' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-semibold text-gray-700">Visibility</h3>
          <div className="flex gap-0.5 bg-gray-100 rounded-md p-0.5">
            {viewTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                  view === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {onNavigate && (
            <button
              onClick={onNavigate}
              className="text-[10px] font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              View details &gt;
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {view !== 'organic' && (
            <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              AI: {totalAIClicks.toLocaleString()} clicks
              {aiMetrics.citationsChange !== null && (
                <TrendIndicator change={aiMetrics.citationsChange} />
              )}
            </span>
          )}
          <span className="text-[10px] text-gray-400">28d</span>
        </div>
      </div>

      <div className="p-3" style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} interval={4} />
            <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={40} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            />

            {/* Organic lines */}
            {(view === 'organic' || view === 'combined') && (
              <>
                <Line type="monotone" dataKey="Organic Clicks" stroke={CHART_COLORS.indigo} strokeWidth={2} dot={false} name="Organic Clicks" />
                {view === 'organic' && (
                  <Line type="monotone" dataKey="Impressions" stroke={CHART_COLORS.blue} strokeWidth={1.5} dot={false} opacity={0.5} name="Impressions" />
                )}
              </>
            )}

            {/* AI engine lines */}
            {view === 'ai' && AI_ENGINES.map((eng) => (
              <Line
                key={eng.key}
                type="monotone"
                dataKey={eng.name}
                stroke={eng.color}
                strokeWidth={1.5}
                dot={false}
                name={eng.name}
              />
            ))}

            {/* Combined: organic + AI total */}
            {view === 'combined' && (
              <Line type="monotone" dataKey="AI Total" stroke="#10a37f" strokeWidth={2} dot={false} name="AI Clicks" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI engine legend when in AI view */}
      {view === 'ai' && (
        <div className="px-3 pb-2 flex flex-wrap gap-x-3 gap-y-1">
          {AI_ENGINES.map((eng) => (
            <span key={eng.key} className="inline-flex items-center gap-1 text-[10px] text-gray-600">
              <span className="w-2 h-0.5 rounded-full" style={{ backgroundColor: eng.color }} />
              {eng.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Dashboard Summary ── */

interface DashboardSummaryProps {
  onNavigate?: (tab: string) => void;
}

export function DashboardSummary({ onNavigate }: DashboardSummaryProps) {
  const { startDate, endDate, compareStartDate, compareEndDate } = useDateRange();

  // Traffic data
  const trafficData = useMemo(
    () => getChartData('dailyTraffic', startDate, endDate) as DailyTraffic[],
    [startDate, endDate],
  );

  const clicksMetric = useMemo(
    () => getMetricValue('totalClicks', startDate, endDate, compareStartDate, compareEndDate),
    [startDate, endDate, compareStartDate, compareEndDate],
  );
  const impressionsMetric = useMemo(
    () => getMetricValue('totalImpressions', startDate, endDate, compareStartDate, compareEndDate),
    [startDate, endDate, compareStartDate, compareEndDate],
  );

  // AI Citations metric
  const aiMetrics = useMemo(() => getAIMetrics(startDate, endDate), [startDate, endDate]);
  const aiTrafficData = useMemo(
    () => filterAITrafficByDate(dailyAITraffic, startDate, endDate),
    [startDate, endDate],
  );

  // Organic leads
  const organicLeads = leads.filter((l) => l.status !== 'lost');
  const totalLeadValue = organicLeads.reduce((s, l) => s + l.value, 0);

  // ROAS: Pipeline Value / Telly AI subscription cost
  const TELY_MONTHLY_COST = 1000;
  const roas = Math.round(totalLeadValue / TELY_MONTHLY_COST);
  // Simulate previous ROAS for trend
  const prevPipelineValue = Math.round(totalLeadValue * 0.75);
  const prevRoas = Math.round(prevPipelineValue / TELY_MONTHLY_COST);
  const roasChange = prevRoas > 0 ? Math.round(((roas - prevRoas) / prevRoas) * 100) : null;

  // Content success rate: % of pages with clicks > 0
  const contentSuccessRate = useMemo(() => {
    let withClicks = 0;
    pages.forEach((p) => {
      const m = getPageMetrics(p.id, startDate, endDate);
      if (m.current.clicks > 0) withClicks++;
    });
    return Math.round((withClicks / pages.length) * 100);
  }, [startDate, endDate]);

  // Lead generation rate: % of pages that generated leads
  const leadGenRate = useMemo(() => {
    const pagesWithLeads = new Set(leads.map((l) => l.sourceUrl));
    const matchingPages = pages.filter((p) => pagesWithLeads.has(p.url));
    return Math.round((matchingPages.length / pages.length) * 100);
  }, []);

  // Cluster data for top growing
  const clusters = useMemo(() => getClusterData(startDate, endDate), [startDate, endDate]);
  const clustersWithChange = useMemo(() => {
    return clusters.map((c) => {
      const avgClicks = clusters.reduce((s, cl) => s + cl.totalClicks, 0) / clusters.length;
      const change = Math.round(((c.totalClicks - avgClicks) / Math.max(avgClicks, 1)) * 100);
      return { ...c, clicksChange: change };
    }).sort((a, b) => b.clicksChange - a.clicksChange).slice(0, 5);
  }, [clusters]);

  // Content funnel data
  const funnelData = useMemo(
    () => getContentFunnelData(startDate, endDate),
    [startDate, endDate],
  );

  // Top movers
  const movers = useMemo(
    () => getTopMovers(startDate, endDate),
    [startDate, endDate],
  );

  // Production intelligence
  const productionInsights = useMemo(
    () => getContentProductionInsights(clusters, startDate, endDate),
    [clusters, startDate, endDate],
  );

  const productionBadges = useMemo(() => {
    const counts: Record<string, number> = {};
    productionInsights.forEach((i) => { counts[i.priority] = (counts[i.priority] || 0) + 1; });
    return [
      { priority: 'double-down', priorityLabel: 'Double Down', count: counts['double-down'] || 0, color: '#10b981' },
      { priority: 'optimize-first', priorityLabel: 'Optimize First', count: counts['optimize-first'] || 0, color: '#f59e0b' },
      { priority: 'expand', priorityLabel: 'Expand', count: counts['expand'] || 0, color: '#3b82f6' },
      { priority: 'monitor', priorityLabel: 'Monitor', count: counts['monitor'] || 0, color: '#9ca3af' },
    ];
  }, [productionInsights]);

  // Content gaps (weak-coverage industries)
  const weakCoverageCount = useMemo(() => {
    const intelligence = getContentIntelligence();
    return intelligence.filter((g) => g.contentCoverage === 'weak').length;
  }, []);

  return (
    <div className="space-y-4">
      {/* ROW 1: Key metrics (6 columns) */}
      <div className="grid grid-cols-6 gap-3">
        <StatCard
          label="Organic Clicks"
          value={clicksMetric.value}
          change={clicksMetric.change}
          sparkData={trafficData}
          sparkKey="clicks"
          sparkColor={CHART_COLORS.indigo}
          onClick={onNavigate ? () => onNavigate('traffic') : undefined}
        />
        <StatCard
          label="Impressions"
          value={impressionsMetric.value}
          change={impressionsMetric.change}
          sparkData={trafficData}
          sparkKey="impressions"
          sparkColor={CHART_COLORS.blue}
          onClick={onNavigate ? () => onNavigate('traffic') : undefined}
        />
        <StatCard
          label="AI Citations"
          value={aiMetrics.totalCitations.toLocaleString()}
          change={aiMetrics.citationsChange}
          sparkData={aiTrafficData}
          sparkKey="citations"
          sparkColor="#10a37f"
          onClick={onNavigate ? () => onNavigate('traffic') : undefined}
        />
        <StatCard
          label="Organic Leads"
          value={organicLeads.length.toString()}
          change={40}
          sparkColor={CHART_COLORS.emerald}
          onClick={onNavigate ? () => onNavigate('leads') : undefined}
        />
        <StatCard
          label="Pipeline Value"
          value={`$${Math.round(totalLeadValue / 1000)}K`}
          change={25}
          onClick={onNavigate ? () => onNavigate('leads') : undefined}
        />
        <StatCard
          label="ROAS"
          value={`${roas}x`}
          change={roasChange}
          suffix={`· $${(totalLeadValue / 1000).toFixed(0)}K / $${(TELY_MONTHLY_COST / 1000).toFixed(0)}K`}
        />
      </div>

      {/* ROW 2: Rates + Clusters + Funnel */}
      <div className="grid grid-cols-12 gap-3">
        {/* Performance Rates */}
        <div
          className={`col-span-4 bg-white rounded-lg border border-gray-200 shadow-sm p-4 ${
            onNavigate ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all' : ''
          }`}
          onClick={onNavigate ? () => onNavigate('traffic') : undefined}
          role={onNavigate ? 'button' : undefined}
          tabIndex={onNavigate ? 0 : undefined}
          onKeyDown={onNavigate ? (e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate('traffic'); } : undefined}
        >
          <h3 className="text-xs font-semibold text-gray-700 mb-3">Performance Rates</h3>
          <div className="flex items-center justify-around">
            <RateRing label="Content Success" value={contentSuccessRate} color={CHART_COLORS.indigo} />
            <RateRing label="Lead Gen Rate" value={leadGenRate} color={CHART_COLORS.emerald} />
            <RateRing label="Avg CTR" value={Number((parseFloat(clicksMetric.value.replace(/,/g, '')) / parseFloat(impressionsMetric.value.replace(/,/g, '')) * 100).toFixed(0))} color={CHART_COLORS.amber} />
          </div>
        </div>

        {/* Top Growing Clusters */}
        <div className="col-span-4">
          <TopClustersTable
            clusters={clustersWithChange}
            onNavigate={onNavigate ? () => onNavigate('clusters') : undefined}
          />
        </div>

        {/* Content Funnel Mini (replaces Topic Clusters Summary) */}
        <div className="col-span-4">
          <ContentFunnelMini
            funnelData={funnelData}
            onClick={onNavigate ? () => onNavigate('traffic') : undefined}
          />
        </div>
      </div>

      {/* ROW 3: Top Movers + Lead Pipeline & Content Gaps */}
      <div className="grid grid-cols-12 gap-3">
        {/* Top Movers */}
        <div className="col-span-8">
          <TopMoversMini
            rising={movers.rising}
            falling={movers.falling}
            onNavigate={onNavigate ? () => onNavigate('traffic') : undefined}
          />
        </div>

        {/* Lead Pipeline + Content Gaps */}
        <div className="col-span-4 space-y-3">
          <LeadPipelineMini onClick={onNavigate ? () => onNavigate('leads') : undefined} />
          <ContentGapsAlert weakCount={weakCoverageCount} onClick={onNavigate ? () => onNavigate('leads') : undefined} />
        </div>
      </div>

      {/* ROW 4: CTA Performance */}
      <CTAPerformanceCard />

      {/* ROW 5: Production Intelligence Strip */}
      <ProductionIntelligenceStrip
        insights={productionBadges}
        onNavigate={onNavigate ? () => onNavigate('clusters') : undefined}
      />

      {/* ROW 6: Visibility Chart */}
      <VisibilityChart
        organicData={trafficData}
        startDate={startDate}
        endDate={endDate}
        onNavigate={onNavigate ? () => onNavigate('traffic') : undefined}
      />
    </div>
  );
}
