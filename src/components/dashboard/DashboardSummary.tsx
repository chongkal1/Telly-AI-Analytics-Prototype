'use client';

import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useDateRange } from '@/hooks/useDateRange';
import { getChartData, getMetricValue } from '@/data/chart-data';
import { leads } from '@/data/leads';
import { filterAITrafficByDate, dailyAITraffic, getAIMetrics, AI_ENGINES } from '@/data/ai-analytics';
import { CHART_COLORS } from '@/lib/constants';
import { TrendIndicator } from '@/components/shared/TrendIndicator';
import { DailyTraffic } from '@/types';

/* ── Navigation arrow icon ── */

function NavArrow() {
  return (
    <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

/* ── Primary metric card (hero size, with chart content slot) ── */

function PrimaryCard({ label, value, change, subtitle, accentColor, chartContent, onClick, tabLabel }: {
  label: string;
  value: string;
  change?: number | null;
  subtitle?: string;
  accentColor: string;
  chartContent?: React.ReactNode;
  onClick?: () => void;
  tabLabel?: string;
}) {
  return (
    <div
      className={`group relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5' : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {/* Accent top bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }} />

      <div className="p-5 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
            <span className="text-sm font-medium text-gray-500">{label}</span>
          </div>
          {onClick && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {tabLabel && <span className="text-[10px] text-indigo-400 font-medium">{tabLabel}</span>}
              <NavArrow />
            </div>
          )}
        </div>

        <div>
          <p className="text-3xl font-bold text-gray-900 font-mono tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1 font-mono">{subtitle}</p>
          )}
          {change !== undefined && change !== null && (
            <div className="mt-2">
              <TrendIndicator change={change} />
            </div>
          )}
        </div>
      </div>

      {/* Chart content area */}
      {chartContent && (
        <div className="px-5 pb-4">
          {chartContent}
        </div>
      )}
    </div>
  );
}

/* ── Secondary metric card (compact, with full-bleed background chart) ── */

function SecondaryCard({ label, value, change, chartContent, onClick, tabLabel }: {
  label: string;
  value: string;
  change?: number | null;
  chartContent?: React.ReactNode;
  onClick?: () => void;
  tabLabel?: string;
}) {
  return (
    <div
      className={`group relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-300' : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {/* Background chart — absolute, anchored to bottom */}
      {chartContent && (
        <div className="absolute bottom-0 left-0 right-0 h-16">
          {chartContent}
        </div>
      )}

      {/* Text content floats above */}
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
          {onClick && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {tabLabel && <span className="text-[10px] text-indigo-400 font-medium">{tabLabel}</span>}
              <NavArrow />
            </div>
          )}
        </div>

        <p className="text-xl font-semibold text-gray-900 font-mono">{value}</p>
        {change !== undefined && change !== null && (
          <div className="mt-1">
            <TrendIndicator change={change} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Section label ── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{children}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

/* ── Main Dashboard Summary ── */

interface DashboardSummaryProps {
  onNavigate?: (tab: string) => void;
}

export function DashboardSummary({ onNavigate }: DashboardSummaryProps) {
  const { startDate, endDate, compareStartDate, compareEndDate } = useDateRange();

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

  const aiMetrics = useMemo(() => getAIMetrics(startDate, endDate), [startDate, endDate]);
  const aiTrafficData = useMemo(
    () => filterAITrafficByDate(dailyAITraffic, startDate, endDate),
    [startDate, endDate],
  );

  const organicLeads = useMemo(() => leads.filter((l) => l.status !== 'lost'), []);
  const totalLeadValue = useMemo(() => organicLeads.reduce((s, l) => s + l.value, 0), [organicLeads]);

  const TELY_MONTHLY_COST = 1000;
  const roas = Math.round(totalLeadValue / TELY_MONTHLY_COST);
  const prevPipelineValue = Math.round(totalLeadValue * 0.75);
  const prevRoas = Math.round(prevPipelineValue / TELY_MONTHLY_COST);
  const roasChange = prevRoas > 0 ? Math.round(((roas - prevRoas) / prevRoas) * 100) : null;

  /* ── Data prep: lead status counts ── */
  const leadStatusCounts = useMemo(() => {
    const counts = { converted: 0, qualified: 0, contacted: 0, new: 0 };
    for (const l of organicLeads) {
      if (l.status in counts) counts[l.status as keyof typeof counts]++;
    }
    return counts;
  }, [organicLeads]);

  const leadStatusTotal = Object.values(leadStatusCounts).reduce((a, b) => a + b, 0);

  /* ── Data prep: pipeline cumulative growth ── */
  const pipelineGrowthData = useMemo(() => {
    const sorted = [...organicLeads].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    let running = 0;
    return sorted.map((l) => {
      running += l.value;
      return { date: l.createdAt, value: running };
    });
  }, [organicLeads]);

  /* ── ROAS chart: horizontal ratio bar (CSS) ── */
  const roasChart = (
    <div>
      <div className="relative h-6 rounded-full overflow-hidden bg-gray-100">
        {/* Pipeline bar — fills nearly all width */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
          style={{
            width: `${Math.min((totalLeadValue / (totalLeadValue + TELY_MONTHLY_COST)) * 100, 99)}%`,
            background: 'linear-gradient(90deg, #4f46e5, #818cf8)',
          }}
        />
        {/* Cost sliver */}
        <div
          className="absolute inset-y-0 left-0 rounded-l-full bg-gray-300"
          style={{
            width: `${Math.max((TELY_MONTHLY_COST / (totalLeadValue + TELY_MONTHLY_COST)) * 100, 1)}%`,
          }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] font-mono text-gray-400">Cost: ${(TELY_MONTHLY_COST / 1000).toFixed(0)}K</span>
        <span className="text-[10px] font-mono text-indigo-400">Pipeline: ${Math.round(totalLeadValue / 1000)}K</span>
      </div>
    </div>
  );

  /* ── Organic Leads chart: stacked status bar (CSS) ── */
  const statusSegments = [
    { key: 'converted', label: 'Converted', count: leadStatusCounts.converted, color: '#059669' },
    { key: 'qualified', label: 'Qualified', count: leadStatusCounts.qualified, color: '#10b981' },
    { key: 'contacted', label: 'Contacted', count: leadStatusCounts.contacted, color: '#6ee7b7' },
    { key: 'new', label: 'New', count: leadStatusCounts.new, color: '#a7f3d0' },
  ];

  const leadsChart = (
    <div>
      <div className="flex h-5 rounded-full overflow-hidden">
        {statusSegments.map((seg) => (
          <div
            key={seg.key}
            className="transition-all duration-1000"
            style={{
              width: leadStatusTotal > 0 ? `${(seg.count / leadStatusTotal) * 100}%` : '25%',
              backgroundColor: seg.color,
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        {statusSegments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[10px] font-mono text-gray-400">{seg.label} {seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );

  /* ── Pipeline Value chart: cumulative area chart (Recharts) ── */
  const pipelineChart = (
    <div className="h-20 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={pipelineGrowthData}>
          <defs>
            <linearGradient id="grad-pipeline-value" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke="#f59e0b"
            strokeWidth={1.5}
            fill="url(#grad-pipeline-value)"
            dot={false}
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  /* ── Organic Clicks chart: full-bleed area (background) ── */
  const clicksChart = (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={trafficData}>
        <defs>
          <linearGradient id="grad-bg-clicks" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.indigo} stopOpacity={0.15} />
            <stop offset="100%" stopColor={CHART_COLORS.indigo} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="clicks"
          stroke={CHART_COLORS.indigo}
          strokeWidth={1}
          strokeOpacity={0.3}
          fill="url(#grad-bg-clicks)"
          dot={false}
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  /* ── Impressions chart: full-bleed area (background) ── */
  const impressionsChart = (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={trafficData}>
        <defs>
          <linearGradient id="grad-bg-impressions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.blue} stopOpacity={0.12} />
            <stop offset="100%" stopColor={CHART_COLORS.blue} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="impressions"
          stroke={CHART_COLORS.blue}
          strokeWidth={1}
          strokeOpacity={0.3}
          fill="url(#grad-bg-impressions)"
          dot={false}
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  /* ── AI Citations chart: stacked area by engine (background) ── */
  const aiCitationsChart = (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={aiTrafficData}>
        <defs>
          {AI_ENGINES.map((eng) => (
            <linearGradient key={eng.key} id={`grad-bg-ai-${eng.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={eng.color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={eng.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        {AI_ENGINES.map((eng) => (
          <Area
            key={eng.key}
            type="monotone"
            dataKey={eng.key}
            stackId="ai"
            stroke="none"
            fill={`url(#grad-bg-ai-${eng.key})`}
            dot={false}
            animationDuration={1200}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-5">
      {/* Primary KPIs */}
      <SectionLabel>Key Performance</SectionLabel>
      <div className="grid grid-cols-3 gap-4">
        <PrimaryCard
          label="ROAS"
          value={`${roas}x`}
          change={roasChange}
          subtitle={`$${(totalLeadValue / 1000).toFixed(0)}K pipeline / $${(TELY_MONTHLY_COST / 1000).toFixed(0)}K cost`}
          accentColor="#4f46e5"
          chartContent={roasChart}
        />
        <PrimaryCard
          label="Organic Leads"
          value={organicLeads.length.toString()}
          change={40}
          accentColor="#10b981"
          chartContent={leadsChart}
          onClick={onNavigate ? () => onNavigate('leads') : undefined}
          tabLabel="Leads"
        />
        <PrimaryCard
          label="Pipeline Value"
          value={`$${Math.round(totalLeadValue / 1000)}K`}
          change={25}
          accentColor="#f59e0b"
          chartContent={pipelineChart}
          onClick={onNavigate ? () => onNavigate('leads') : undefined}
          tabLabel="Leads"
        />
      </div>

      {/* Secondary KPIs */}
      <SectionLabel>Traffic Signals</SectionLabel>
      <div className="grid grid-cols-3 gap-4">
        <SecondaryCard
          label="Organic Clicks"
          value={clicksMetric.value}
          change={clicksMetric.change}
          chartContent={clicksChart}
          onClick={onNavigate ? () => onNavigate('traffic') : undefined}
          tabLabel="Traffic"
        />
        <SecondaryCard
          label="Impressions"
          value={impressionsMetric.value}
          change={impressionsMetric.change}
          chartContent={impressionsChart}
          onClick={onNavigate ? () => onNavigate('traffic') : undefined}
          tabLabel="Traffic"
        />
        <SecondaryCard
          label="AI Citations"
          value={aiMetrics.totalCitations.toLocaleString()}
          change={aiMetrics.citationsChange}
          chartContent={aiCitationsChart}
          onClick={onNavigate ? () => onNavigate('traffic') : undefined}
          tabLabel="Traffic"
        />
      </div>
    </div>
  );
}
