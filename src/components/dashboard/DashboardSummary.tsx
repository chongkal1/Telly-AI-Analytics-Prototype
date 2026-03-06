'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { useDateRange } from '@/hooks/useDateRange';
import { useMaturityStage } from '@/hooks/useMaturityStage';
import { useDealSize } from '@/hooks/useDealSize';
import { getMetricValue, getClusterData, getContentProductionInsights, getContentFunnelData, getAllPagesOverview, getAgentGoalData } from '@/data/chart-data';
import { TrendIndicator } from '@/components/shared/TrendIndicator';
import { AgentMissionControl } from './AgentMissionControl';
import { ContentFunnel } from './traffic/ContentFunnel';
import { VisitorIndustrySummary } from './VisitorIndustrySummary';

/* ── Zero-state overlay for early maturity stages ── */

function ZeroStateOverlay({ title, subtitle, accentColor }: { title: string; subtitle: string; accentColor: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-4 gap-2 relative">
      {/* Subtle background wash */}
      <div className="absolute inset-0 rounded-lg" style={{ background: `radial-gradient(circle at center, ${accentColor}08 0%, transparent 70%)` }} />

      {/* Pulsing radar animation */}
      <div className="relative w-10 h-10 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full opacity-20 animate-ping" style={{ backgroundColor: accentColor, animationDuration: '2s' }} />
        <div className="absolute inset-1 rounded-full opacity-15 animate-ping" style={{ backgroundColor: accentColor, animationDuration: '2s', animationDelay: '0.4s' }} />
        <div className="absolute inset-2 rounded-full opacity-10 animate-ping" style={{ backgroundColor: accentColor, animationDuration: '2s', animationDelay: '0.8s' }} />
        <div className="w-3 h-3 rounded-full relative z-10" style={{ backgroundColor: accentColor, opacity: 0.6 }} />
      </div>

      <p className="text-[13px] font-semibold text-surface-500 relative z-10">{title}</p>
      <p className="text-[11px] text-surface-400 relative z-10 text-center leading-relaxed">{subtitle}</p>
    </div>
  );
}

/* ── Zero-state funnel for 1mo stage ── */

function ZeroStateFunnel({ onNavigate }: { onNavigate?: () => void }) {
  const published = 12;
  const indexed = 3;
  const progress = Math.round((indexed / published) * 100);

  return (
    <div
      className={`group bg-white rounded-[14px] border border-surface-200 shadow-card overflow-hidden transition-all duration-200 ${
        onNavigate ? 'cursor-pointer hover:shadow-lg hover:border-surface-300 hover:-translate-y-0.5' : ''
      }`}
      onClick={onNavigate}
      role={onNavigate ? 'button' : undefined}
      tabIndex={onNavigate ? 0 : undefined}
      onKeyDown={onNavigate ? (e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate(); } : undefined}
    >
      <div className="px-4 py-3 border-b border-surface-100 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-surface-900">Content Funnel</h3>
          <p className="text-xs text-surface-500 mt-0.5">Building your content foundation</p>
        </div>
        {onNavigate && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
            <span className="text-[10px] text-indigo-400 font-medium">Topics</span>
            <svg className="w-4 h-4 text-surface-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>

      <div className="px-5 py-6 flex flex-col items-center gap-4">
        {/* Pulsing radar */}
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full opacity-20 animate-ping" style={{ backgroundColor: '#818cf8', animationDuration: '2s' }} />
          <div className="absolute inset-1 rounded-full opacity-15 animate-ping" style={{ backgroundColor: '#818cf8', animationDuration: '2s', animationDelay: '0.4s' }} />
          <div className="absolute inset-2 rounded-full opacity-10 animate-ping" style={{ backgroundColor: '#818cf8', animationDuration: '2s', animationDelay: '0.8s' }} />
          <div className="w-3 h-3 rounded-full relative z-10" style={{ backgroundColor: '#818cf8', opacity: 0.6 }} />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-surface-900 font-mono">{published}</p>
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mt-0.5">Published</p>
          </div>
          <div className="w-px h-8 bg-surface-200" />
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-500 font-mono">{indexed}</p>
            <p className="text-[10px] text-surface-400 uppercase tracking-wider mt-0.5">Indexed</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="relative h-2 rounded-full overflow-hidden bg-surface-100">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #818cf8, #c7d2fe)',
              }}
            />
          </div>
          <p className="text-[10px] text-surface-400 mt-2 text-center">{indexed} of {published} articles indexed ({progress}%)</p>
        </div>

        <p className="text-xs text-surface-500 text-center max-w-sm leading-relaxed">
          Building your content foundation — indexing in progress. Funnel data appears once pages start ranking.
        </p>
      </div>
    </div>
  );
}

/* ── Pipeline deal size editor (inline in card) ── */

const DEAL_SIZE_PRESETS = [500, 1000, 5000, 10000, 50000];

function PipelineDealSizeEditor({ leadsCount, dealSize, setDealSize, fmtUsd }: {
  leadsCount: number; dealSize: number; setDealSize: (n: number) => void; fmtUsd: (n: number) => string;
}) {
  const [open, setOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (parsed > 0) { setDealSize(parsed); setCustomValue(''); setOpen(false); }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-surface-400 font-mono">
          {leadsCount} leads &times; {fmtUsd(dealSize)}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
        >
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          Edit Deal Size
        </button>
      </div>

      {open && (
        <div
          ref={popoverRef}
          className="absolute z-50 top-full left-0 mt-1 w-56 bg-white rounded-xl border border-surface-200 shadow-xl p-3 space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-xs font-semibold text-surface-700">Average Deal Size</p>
          <div className="flex flex-wrap gap-1.5">
            {DEAL_SIZE_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => { setDealSize(preset); setOpen(false); }}
                className={`px-2 py-0.5 text-[10px] font-medium rounded-lg border transition-colors ${
                  dealSize === preset
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-surface-700 border-surface-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {fmtUsd(preset)}
              </button>
            ))}
          </div>
          <div>
            <label className="text-[10px] text-surface-500 font-medium">Custom amount</label>
            <div className="flex gap-1.5 mt-1">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-surface-400">$</span>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value.replace(/[^0-9]/g, ''))}
                  onKeyDown={(e) => { if (e.key === 'Enter') applyCustom(); }}
                  placeholder="e.g. 15000"
                  className="w-full pl-5 pr-2 py-1 text-[10px] font-mono border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                onClick={applyCustom}
                className="px-2 py-1 text-[10px] font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
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

/* ── Navigation arrow icon ── */

function NavArrow() {
  return (
    <svg className="w-4 h-4 text-surface-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

/* ── Primary metric card (hero size, with chart content slot) ── */

function PrimaryCard({ label, value, change, previousValue, subtitle, accentColor, chartContent, onClick, tabLabel, zeroState }: {
  label: string;
  value: string;
  change?: number | null;
  previousValue?: string;
  subtitle?: string;
  accentColor: string;
  chartContent?: React.ReactNode;
  onClick?: () => void;
  tabLabel?: string;
  zeroState?: { title: string; subtitle: string; accentColor: string };
}) {
  return (
    <div
      className={`group relative bg-white rounded-[14px] border border-surface-200 shadow-card overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:border-surface-300 hover:-translate-y-0.5' : ''
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
            <span className="text-sm font-medium text-surface-500">{label}</span>
          </div>
          {onClick && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {tabLabel && <span className="text-[10px] text-indigo-400 font-medium">{tabLabel}</span>}
              <NavArrow />
            </div>
          )}
        </div>

        {zeroState ? (
          <ZeroStateOverlay title={zeroState.title} subtitle={zeroState.subtitle} accentColor={zeroState.accentColor} />
        ) : (
          <div>
            <p className="text-3xl font-bold text-surface-900 font-mono tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-surface-400 mt-1 font-mono">{subtitle}</p>
            )}
            {change !== undefined && change !== null && (
              <div className="mt-2 flex items-center gap-2">
                <TrendIndicator change={change} />
                {previousValue && (
                  <span className="text-xs text-surface-400">vs {previousValue}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart content area */}
      {!zeroState && chartContent && (
        <div className="px-5 pb-4">
          {chartContent}
        </div>
      )}
    </div>
  );
}

/* ── Section label ── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-widest">{children}</span>
      <div className="flex-1 h-px bg-surface-100" />
    </div>
  );
}

/* ── Main Dashboard Summary ── */

interface DashboardSummaryProps {
  onNavigate?: (tab: string) => void;
}

export function DashboardSummary({ onNavigate }: DashboardSummaryProps) {
  const { startDate, endDate, compareEnabled, compareStartDate, compareEndDate } = useDateRange();
  const { stage } = useMaturityStage();

  const clusters = useMemo(() => getClusterData(startDate, endDate), [startDate, endDate]);
  const productionInsights = useMemo(
    () => getContentProductionInsights(clusters, startDate, endDate, stage),
    [clusters, startDate, endDate, stage],
  );
  const funnelData = useMemo(
    () => getContentFunnelData(startDate, endDate, productionInsights, stage),
    [startDate, endDate, productionInsights, stage],
  );
  const allPages = useMemo(
    () => getAllPagesOverview(startDate, endDate),
    [startDate, endDate],
  );
  const agentGoal = useMemo(() => getAgentGoalData(stage), [stage]);


  const leadsMetric = useMemo(
    () => getMetricValue('leadsGenerated', startDate, endDate,
      compareEnabled ? compareStartDate : undefined,
      compareEnabled ? compareEndDate : undefined, stage),
    [startDate, endDate, compareEnabled, compareStartDate, compareEndDate, stage],
  );

  /* ── Derive lead counts from funnel data (consistent numbers) ── */
  const funnelCounts = useMemo(() => {
    const identified = funnelData.find(s => s.stage === 'Identified Visitors')?.count ?? 0;
    const contacted = funnelData.find(s => s.stage === 'Contacted Leads')?.count ?? 0;
    const captured = funnelData.find(s => s.stage === 'Captured Leads')?.count ?? 0;
    return { identified, contacted, captured, total: identified };
  }, [funnelData]);

  const { dealSize, setDealSize } = useDealSize();

  const totalLeadValue = funnelCounts.total * dealSize;
  const TELY_MONTHLY_COST = 1000;
  const roas = Math.round(totalLeadValue / TELY_MONTHLY_COST);
  const prevPipelineValue = Math.round(totalLeadValue * 0.75);
  const prevRoas = Math.round(prevPipelineValue / TELY_MONTHLY_COST);
  const roasChange = prevRoas > 0 ? Math.round(((roas - prevRoas) / prevRoas) * 100) : null;
  const pipelineChange = prevPipelineValue > 0 ? Math.round(((totalLeadValue - prevPipelineValue) / prevPipelineValue) * 100) : null;

  const leadStatusCounts = funnelCounts;
  const leadStatusTotal = funnelCounts.total;

  /* ── Zero-state conditions — only when no identified visitors yet (1mo) ── */
  const noLeadsYet = funnelCounts.total === 0;

  const roasZeroState = noLeadsYet ? { title: 'Building foundation', subtitle: 'ROI builds as identified visitors arrive (month 6+)', accentColor: '#4f46e5' } : undefined;
  const leadsZeroState = noLeadsYet ? { title: 'Collecting data...', subtitle: 'Leads appear once visitors are identified (month 6+)', accentColor: '#00C5DF' } : undefined;
  const pipelineZeroState = noLeadsYet ? { title: 'Pipeline grows with leads', subtitle: 'First pipeline expected around month 6', accentColor: '#f59e0b' } : undefined;

  /* ── ROAS chart: horizontal ratio bar (CSS) ── */
  const roasChart = (
    <div>
      <div className="relative h-6 rounded-full overflow-hidden bg-surface-100">
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
          className="absolute inset-y-0 left-0 rounded-l-full bg-surface-300"
          style={{
            width: `${Math.max((TELY_MONTHLY_COST / (totalLeadValue + TELY_MONTHLY_COST)) * 100, 1)}%`,
          }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] font-mono text-surface-400">Cost: ${(TELY_MONTHLY_COST / 1000).toFixed(0)}K</span>
        <span className="text-[10px] font-mono text-indigo-400">Pipeline: ${Math.round(totalLeadValue / 1000)}K</span>
      </div>
    </div>
  );

  /* ── Organic Leads chart: stacked status bar (CSS) ── */
  const statusSegments = [
    { key: 'identified', label: 'Identified', count: leadStatusCounts.identified, color: '#00C5DF' },
    { key: 'contacted', label: 'Contacted', count: leadStatusCounts.contacted, color: '#33D4EB' },
    { key: 'captured', label: 'Captured', count: leadStatusCounts.captured, color: '#80E3F3' },
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
            <span className="text-[10px] font-mono text-surface-400">{seg.label} {seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );

  /* ── Pipeline Value chart: deal size info + edit ── */
  const fmtUsd = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
  const pipelineChart = <PipelineDealSizeEditor leadsCount={funnelCounts.total} dealSize={dealSize} setDealSize={setDealSize} fmtUsd={fmtUsd} />;


  return (
    <div className="space-y-5">
      {/* Primary KPIs */}
      <SectionLabel>Key Performance</SectionLabel>
      <div className="grid grid-cols-3 gap-4">
        <PrimaryCard
          label="ROAS"
          value={`${roas}x`}
          change={compareEnabled ? roasChange : null}
          previousValue={compareEnabled ? `${prevRoas}x` : undefined}
          subtitle={`$${(totalLeadValue / 1000).toFixed(0)}K pipeline / $${(TELY_MONTHLY_COST / 1000).toFixed(0)}K cost`}
          accentColor="#4f46e5"
          chartContent={roasChart}
          zeroState={roasZeroState}
        />
        <PrimaryCard
          label="Organic Leads"
          value={funnelCounts.total >= 1000 ? `${(funnelCounts.total / 1000).toFixed(1)}K` : funnelCounts.total.toString()}
          change={compareEnabled ? leadsMetric.change : null}
          previousValue={compareEnabled ? leadsMetric.previousValue : undefined}
          accentColor="#00C5DF"
          chartContent={leadsChart}
          onClick={onNavigate ? () => onNavigate('leads') : undefined}
          tabLabel="Leads"
          zeroState={leadsZeroState}
        />
        <PrimaryCard
          label="Pipeline Value"
          value={`$${Math.round(totalLeadValue / 1000)}K`}
          change={compareEnabled ? pipelineChange : null}
          previousValue={compareEnabled ? `$${Math.round(prevPipelineValue / 1000)}K` : undefined}
          accentColor="#f59e0b"
          chartContent={pipelineChart}
          onClick={onNavigate ? () => onNavigate('leads') : undefined}
          tabLabel="Leads"
          zeroState={pipelineZeroState}
        />
      </div>

      {/* Content Funnel (compact, no stage expansion on dashboard) */}
      {stage === '1mo' ? (
        <ZeroStateFunnel onNavigate={onNavigate ? () => onNavigate('clusters') : undefined} />
      ) : (
        <ContentFunnel data={funnelData} articles={allPages} compareEnabled={compareEnabled} compact onNavigate={onNavigate ? () => onNavigate('clusters') : undefined} />
      )}

      {/* Visitor Industry Insights */}
      <VisitorIndustrySummary onNavigate={onNavigate} />

      {/* Agent Mission Control */}
      <SectionLabel>Agent Operations</SectionLabel>
      <AgentMissionControl
        insights={productionInsights}
        goal={agentGoal}
        onSelect={onNavigate ? () => onNavigate('clusters') : undefined}
      />
    </div>
  );
}
