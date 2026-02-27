'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { leads } from '@/data/leads';
import { pages } from '@/data/pages';
import { useDateRange } from '@/hooks/useDateRange';
import { getMetricValue, getChartData } from '@/data/chart-data';
import { MetricCard } from '@/components/shared/MetricCard';
import { PieChartWidget } from '@/components/charts/PieChartWidget';
import { IdentifiedVisitorsTable } from './leads/IdentifiedVisitorsTable';
import { RecentLeadsTable } from './leads/RecentLeadsTable';
import { TrendIndicator } from '@/components/shared/TrendIndicator';

const LEAD_METRICS: { title: string; dataKey: string }[] = [
  { title: 'Identified Visitors', dataKey: 'identifiedVisitors' },
  { title: 'Organic Leads Captured', dataKey: 'organicLeadsCaptured' },
];

const DEFAULT_DEAL_SIZE = 10000;
const DEAL_SIZE_PRESETS = [1000, 5000, 10000, 25000, 50000];

const fmtUsd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

function PipelineValueCard({ leadsCount }: { leadsCount: number }) {
  const [dealSize, setDealSize] = useState(DEFAULT_DEAL_SIZE);
  const [open, setOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pipelineValue = leadsCount * dealSize;
  const prevPipelineValue = Math.round(pipelineValue * 0.82);
  const change = prevPipelineValue > 0 ? Math.round(((pipelineValue - prevPipelineValue) / prevPipelineValue) * 100) : null;

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const applyCustom = () => {
    const parsed = parseInt(customValue.replace(/[^0-9]/g, ''), 10);
    if (parsed > 0) {
      setDealSize(parsed);
      setCustomValue('');
      setOpen(false);
    }
  };

  return (
    <div className="relative bg-white rounded-lg border border-surface-200 shadow-sm h-full flex flex-col p-4">
      <dt className="text-sm font-medium text-surface-500 truncate">Pipeline Value</dt>
      <dd className="mt-1 text-2xl font-semibold font-mono text-surface-900">{fmtUsd(pipelineValue)}</dd>
      {change !== null && (
        <div className="flex items-center gap-2 mt-2">
          <TrendIndicator change={change} />
          <span className="text-xs text-surface-400">vs prev period</span>
        </div>
      )}

      {/* Deal size label + edit button */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[11px] text-surface-400 font-mono">
          {leadsCount} leads &times; {fmtUsd(dealSize)}
        </span>
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          Edit Deal Size
        </button>
      </div>

      {/* Popover */}
      {open && (
        <div
          ref={popoverRef}
          className="absolute z-50 top-full left-0 mt-1 w-64 bg-white rounded-xl border border-surface-200 shadow-xl p-3 space-y-3"
        >
          <p className="text-xs font-semibold text-surface-700">Average Deal Size</p>

          {/* Presets */}
          <div className="flex flex-wrap gap-1.5">
            {DEAL_SIZE_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => { setDealSize(preset); setOpen(false); }}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                  dealSize === preset
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-surface-700 border-surface-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {fmtUsd(preset)}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div>
            <label className="text-[11px] text-surface-500 font-medium">Custom amount</label>
            <div className="flex gap-1.5 mt-1">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-surface-400">$</span>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value.replace(/[^0-9]/g, ''))}
                  onKeyDown={(e) => { if (e.key === 'Enter') applyCustom(); }}
                  placeholder="e.g. 15000"
                  className="w-full pl-6 pr-2 py-1.5 text-xs font-mono border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                onClick={applyCustom}
                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
    <div className="inline-flex rounded-md border border-surface-200 bg-surface-50 p-0.5 text-xs">
      <button
        onClick={() => onChange('industry')}
        className={`px-2.5 py-1 rounded transition-colors ${
          value === 'industry'
            ? 'bg-white text-surface-900 shadow-sm font-medium'
            : 'text-surface-500 hover:text-surface-700'
        }`}
      >
        By Industry
      </button>
      <button
        onClick={() => onChange('cluster')}
        className={`px-2.5 py-1 rounded transition-colors ${
          value === 'cluster'
            ? 'bg-white text-surface-900 shadow-sm font-medium'
            : 'text-surface-500 hover:text-surface-700'
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
        <PipelineValueCard leadsCount={capturedLeads.length} />
      </div>

      {/* Row 2: 2 pie charts with toggles */}
      <div
        className="gap-4"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        }}
      >
        <div className="bg-white rounded-[14px] border border-surface-200 shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-surface-900">{visitorsLabel}</h3>
            <SegmentedToggle value={visitorsGroupMode} onChange={setVisitorsGroupMode} />
          </div>
          <PieChartWidget data={visitorsData} height={240} />
        </div>
        <div className="bg-white rounded-[14px] border border-surface-200 shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-surface-900">{leadsLabel}</h3>
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
