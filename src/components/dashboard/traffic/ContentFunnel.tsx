'use client';

import React, { useState, useMemo } from 'react';
import { FunnelStageData, FunnelClusterBreakdown, ProductionPriority, PageOverviewData } from '@/data/chart-data';

type SortDirection = 'asc' | 'desc';

function useSort<T>(data: T[], defaultKey?: string) {
  const [sortKey, setSortKey] = useState<string | null>(defaultKey ?? null);
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const toggle = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      let cmp = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') cmp = aVal.localeCompare(bVal);
      else if (typeof aVal === 'number' && typeof bVal === 'number') cmp = aVal - bVal;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  return { sorted, sortKey, sortDir, toggle };
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  return (
    <span className="ml-1 inline-flex flex-col">
      <svg className={`h-2 w-2 ${active && direction === 'asc' ? 'text-indigo-600' : 'text-surface-400'}`} viewBox="0 0 8 4" fill="currentColor">
        <path d="M4 0L8 4H0L4 0Z" />
      </svg>
      <svg className={`h-2 w-2 -mt-0.5 ${active && direction === 'desc' ? 'text-indigo-600' : 'text-surface-400'}`} viewBox="0 0 8 4" fill="currentColor">
        <path d="M4 4L0 0H8L4 4Z" />
      </svg>
    </span>
  );
}

function Th({ label, colKey, align, sortKey, sortDir, onSort }: {
  label: string; colKey: string; align?: 'right';
  sortKey: string | null; sortDir: SortDirection; onSort: (k: string) => void;
}) {
  return (
    <th
      className={`px-3 py-2 text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100 select-none ${align === 'right' ? 'text-right' : 'text-left'}`}
      onClick={() => onSort(colKey)}
    >
      <span className="inline-flex items-center">
        {label}
        <SortIcon active={sortKey === colKey} direction={sortDir} />
      </span>
    </th>
  );
}

const STAGE_COLORS = [
  { fill: '#e0e7ff', fillSelected: '#c7d2fe', stroke: '#818cf8', labelColor: '#4338ca' },
  { fill: '#dbeafe', fillSelected: '#bfdbfe', stroke: '#60a5fa', labelColor: '#1d4ed8' },
  { fill: '#ccf7fa', fillSelected: '#99eff5', stroke: '#00C5DF', labelColor: '#008a9b' },
  { fill: '#fef3c7', fillSelected: '#fde68a', stroke: '#fbbf24', labelColor: '#92400e' },
];

/* ── Priority badge ── */

const PRIORITY_CONFIG: Record<ProductionPriority, { label: string; bg: string; text: string; border: string; dot: string }> = {
  'double-down': { label: 'Scale Production', bg: 'bg-[#00C5DF]/10', text: 'text-[#00C5DF]', border: 'border-[#00C5DF]/30', dot: 'bg-[#00C5DF]' },
  'optimize-first': { label: 'Update Content', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  'delete-merge': { label: 'Delete & Merge', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  'monitor': { label: 'Monitor', bg: 'bg-surface-50', text: 'text-surface-600', border: 'border-surface-200', dot: 'bg-surface-400' },
};

function PriorityBadge({ priority }: { priority: ProductionPriority }) {
  const c = PRIORITY_CONFIG[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

/* Stage-specific table column definitions */
interface ColumnDef {
  label: string;
  colKey: string;
  align?: 'right';
  render: (row: FunnelClusterBreakdown) => string;
  renderJsx?: (row: FunnelClusterBreakdown) => React.ReactNode;
}

const priorityColumn: ColumnDef = {
  label: 'Priority', colKey: 'priority', render: () => '', renderJsx: (r) => r.priority ? <PriorityBadge priority={r.priority} /> : <span className="text-surface-400">&mdash;</span>,
};

const STAGE_COLUMNS: Record<string, { columns: ColumnDef[]; defaultSort: string }> = {
  Impressions: {
    defaultSort: 'impressions',
    columns: [
      { label: 'Topical Cluster', colKey: 'cluster', render: (r) => r.cluster },
      priorityColumn,
      { label: 'Impressions', colKey: 'impressions', align: 'right', render: (r) => r.impressions.toLocaleString() },
      { label: 'Imp. Share', colKey: 'impressionShare', align: 'right', render: (r) => `${r.impressionShare}%` },
      { label: 'Clicks', colKey: 'clicks', align: 'right', render: (r) => r.clicks.toLocaleString() },
      { label: 'CTR', colKey: 'ctr', align: 'right', render: (r) => `${r.ctr.toFixed(2)}%` },
    ],
  },
  Clicks: {
    defaultSort: 'clicks',
    columns: [
      { label: 'Topical Cluster', colKey: 'cluster', render: (r) => r.cluster },
      priorityColumn,
      { label: 'Clicks', colKey: 'clicks', align: 'right', render: (r) => r.clicks.toLocaleString() },
      { label: 'Click Share', colKey: 'clickShare', align: 'right', render: (r) => `${r.clickShare}%` },
      { label: 'CTA Clicks', colKey: 'ctaClicks', align: 'right', render: (r) => r.ctaClicks.toLocaleString() },
      { label: 'CTA Rate', colKey: 'ctaRate', align: 'right', render: (r) => `${r.ctaRate.toFixed(2)}%` },
    ],
  },
  'CTA Clicks': {
    defaultSort: 'ctaClicks',
    columns: [
      { label: 'Topical Cluster', colKey: 'cluster', render: (r) => r.cluster },
      priorityColumn,
      { label: 'CTA Clicks', colKey: 'ctaClicks', align: 'right', render: (r) => r.ctaClicks.toLocaleString() },
      { label: 'CTA Share', colKey: 'ctaClickShare', align: 'right', render: (r) => `${r.ctaClickShare}%` },
      { label: 'Leads', colKey: 'leads', align: 'right', render: (r) => r.leads.toLocaleString() },
      { label: 'Conv. Rate', colKey: 'conversionRate', align: 'right', render: (r) => `${r.conversionRate.toFixed(2)}%` },
    ],
  },
  'Captured Leads': {
    defaultSort: 'leads',
    columns: [
      { label: 'Topical Cluster', colKey: 'cluster', render: (r) => r.cluster },
      priorityColumn,
      { label: 'Leads', colKey: 'leads', align: 'right', render: (r) => r.leads.toLocaleString() },
      { label: 'Lead Share', colKey: 'leadShare', align: 'right', render: (r) => `${r.leadShare}%` },
      { label: 'Conv. Rate', colKey: 'conversionRate', align: 'right', render: (r) => `${r.conversionRate.toFixed(2)}%` },
    ],
  },
};

function StageBreakdownTable({ breakdown, stage }: { breakdown: FunnelClusterBreakdown[]; stage: string }) {
  const config = STAGE_COLUMNS[stage] ?? STAGE_COLUMNS['Impressions'];
  const { sorted, sortKey, sortDir, toggle } = useSort(breakdown, config.defaultSort);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-surface-200">
        <thead className="bg-surface-50">
          <tr>
            {config.columns.map((col) => (
              <Th
                key={col.colKey}
                label={col.label}
                colKey={col.colKey}
                align={col.align}
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggle}
              />
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200">
          {sorted.map((row) => (
            <tr key={row.cluster} className="hover:bg-surface-50">
              {config.columns.map((col) => (
                <td
                  key={col.colKey}
                  className={`px-3 py-2 text-sm ${col.colKey === 'cluster' ? 'font-medium text-surface-900' : col.renderJsx ? '' : 'text-surface-700 font-mono'} ${col.align === 'right' ? 'text-right' : 'text-left'} whitespace-nowrap`}
                >
                  {col.renderJsx ? col.renderJsx(row) : col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Article-level breakdown columns by stage ── */

interface ArticleRow {
  title: string;
  category: string;
  impressions: number;
  clicks: number;
  ctr: number;
  ctaClicks: number;
  leads: number;
  ctaRate: number;
  conversionRate: number;
  impressionShare: number;
  clickShare: number;
  ctaClickShare: number;
  leadShare: number;
}

interface ArticleColumnDef {
  label: string;
  colKey: string;
  align?: 'right';
  render: (row: ArticleRow) => string;
}

const ARTICLE_STAGE_COLUMNS: Record<string, { columns: ArticleColumnDef[]; defaultSort: string }> = {
  Impressions: {
    defaultSort: 'impressions',
    columns: [
      { label: 'Article', colKey: 'title', render: (r) => r.title },
      { label: 'Cluster', colKey: 'category', render: (r) => r.category },
      { label: 'Impressions', colKey: 'impressions', align: 'right', render: (r) => r.impressions.toLocaleString() },
      { label: 'Imp. Share', colKey: 'impressionShare', align: 'right', render: (r) => `${r.impressionShare}%` },
      { label: 'Clicks', colKey: 'clicks', align: 'right', render: (r) => r.clicks.toLocaleString() },
      { label: 'CTR', colKey: 'ctr', align: 'right', render: (r) => `${(r.ctr * 100).toFixed(2)}%` },
    ],
  },
  Clicks: {
    defaultSort: 'clicks',
    columns: [
      { label: 'Article', colKey: 'title', render: (r) => r.title },
      { label: 'Cluster', colKey: 'category', render: (r) => r.category },
      { label: 'Clicks', colKey: 'clicks', align: 'right', render: (r) => r.clicks.toLocaleString() },
      { label: 'Click Share', colKey: 'clickShare', align: 'right', render: (r) => `${r.clickShare}%` },
      { label: 'CTA Clicks', colKey: 'ctaClicks', align: 'right', render: (r) => r.ctaClicks.toLocaleString() },
      { label: 'CTA Rate', colKey: 'ctaRate', align: 'right', render: (r) => `${r.ctaRate.toFixed(2)}%` },
    ],
  },
  'CTA Clicks': {
    defaultSort: 'ctaClicks',
    columns: [
      { label: 'Article', colKey: 'title', render: (r) => r.title },
      { label: 'Cluster', colKey: 'category', render: (r) => r.category },
      { label: 'CTA Clicks', colKey: 'ctaClicks', align: 'right', render: (r) => r.ctaClicks.toLocaleString() },
      { label: 'CTA Share', colKey: 'ctaClickShare', align: 'right', render: (r) => `${r.ctaClickShare}%` },
      { label: 'Leads', colKey: 'leads', align: 'right', render: (r) => r.leads.toLocaleString() },
      { label: 'Conv. Rate', colKey: 'conversionRate', align: 'right', render: (r) => `${r.conversionRate.toFixed(2)}%` },
    ],
  },
  'Captured Leads': {
    defaultSort: 'leads',
    columns: [
      { label: 'Article', colKey: 'title', render: (r) => r.title },
      { label: 'Cluster', colKey: 'category', render: (r) => r.category },
      { label: 'Leads', colKey: 'leads', align: 'right', render: (r) => r.leads.toLocaleString() },
      { label: 'Lead Share', colKey: 'leadShare', align: 'right', render: (r) => `${r.leadShare}%` },
      { label: 'Conv. Rate', colKey: 'conversionRate', align: 'right', render: (r) => `${r.conversionRate.toFixed(2)}%` },
    ],
  },
};

const ARTICLE_PAGE_SIZE = 10;

function StageArticleTable({ articles, stage }: { articles: ArticleRow[]; stage: string }) {
  const config = ARTICLE_STAGE_COLUMNS[stage] ?? ARTICLE_STAGE_COLUMNS['Impressions'];
  const { sorted, sortKey, sortDir, toggle } = useSort(articles, config.defaultSort);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when stage or data changes
  const totalPages = Math.ceil(sorted.length / ARTICLE_PAGE_SIZE);
  const safePage = Math.min(currentPage, totalPages || 1);
  const paginated = sorted.slice((safePage - 1) * ARTICLE_PAGE_SIZE, safePage * ARTICLE_PAGE_SIZE);

  // Reset to page 1 when stage changes
  React.useEffect(() => { setCurrentPage(1); }, [stage]);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs text-surface-500">
          {sorted.length} articles &middot; Showing {(safePage - 1) * ARTICLE_PAGE_SIZE + 1}&ndash;{Math.min(safePage * ARTICLE_PAGE_SIZE, sorted.length)}
        </span>
      </div>
      <table className="min-w-full divide-y divide-surface-200">
        <thead className="bg-surface-50">
          <tr>
            {config.columns.map((col) => (
              <Th
                key={col.colKey}
                label={col.label}
                colKey={col.colKey}
                align={col.align}
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggle}
              />
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200">
          {paginated.map((row) => (
            <tr key={row.title} className="hover:bg-surface-50">
              {config.columns.map((col) => (
                <td
                  key={col.colKey}
                  className={`px-3 py-2 text-sm ${
                    col.colKey === 'title' ? 'font-medium text-surface-900 max-w-[260px] truncate' :
                    col.colKey === 'category' ? 'text-surface-500' :
                    'text-surface-700 font-mono'
                  } ${col.align === 'right' ? 'text-right' : 'text-left'} whitespace-nowrap`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200">
          <span className="text-xs text-surface-500">
            Page {safePage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(safePage - 1)}
              disabled={safePage <= 1}
              className="px-2 py-1 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
            >
              &larr; Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 text-xs font-medium rounded ${
                  p === safePage ? 'bg-[#00C5DF] text-white' : 'text-surface-600 hover:bg-surface-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(safePage + 1)}
              disabled={safePage >= totalPages}
              className="px-2 py-1 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── View toggle ── */

type BreakdownView = 'clusters' | 'articles';

function ViewToggle({ view, onChange }: { view: BreakdownView; onChange: (v: BreakdownView) => void }) {
  return (
    <div className="inline-flex items-center bg-surface-100 rounded-lg p-0.5">
      <button
        onClick={() => onChange('clusters')}
        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
          view === 'clusters' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'
        }`}
      >
        Clusters
      </button>
      <button
        onClick={() => onChange('articles')}
        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
          view === 'articles' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'
        }`}
      >
        Articles
      </button>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return n.toLocaleString();
}

interface ContentFunnelProps {
  data: FunnelStageData[];
  articles?: PageOverviewData[];
  compareEnabled?: boolean;
}

export function ContentFunnel({ data, articles = [], compareEnabled = false }: ContentFunnelProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>('Impressions');
  const [breakdownView, setBreakdownView] = useState<BreakdownView>('clusters');

  // Build article rows filtered by the selected stage, with share calculations
  const articleRows: ArticleRow[] = useMemo(() => {
    if (!selectedStage || articles.length === 0) return [];

    const SCALE = 50;

    // Filter articles relevant to the stage
    let filtered: PageOverviewData[];
    if (selectedStage === 'Impressions') {
      filtered = articles.filter((a) => a.impressions > 0);
    } else if (selectedStage === 'Clicks') {
      filtered = articles.filter((a) => a.clicks > 0);
    } else if (selectedStage === 'CTA Clicks') {
      filtered = articles.filter((a) => a.ctaClicks > 0);
    } else {
      filtered = articles.filter((a) => a.leads > 0);
    }

    const totalImpressions = filtered.reduce((s, a) => s + a.impressions, 0);
    const totalClicks = filtered.reduce((s, a) => s + a.clicks, 0);
    const totalCtaClicks = filtered.reduce((s, a) => s + a.ctaClicks, 0);
    const totalLeads = filtered.reduce((s, a) => s + a.leads, 0);

    return filtered.map((a) => ({
      title: a.title.length > 45 ? a.title.slice(0, 45) + '...' : a.title,
      category: a.category,
      impressions: a.impressions * SCALE,
      clicks: a.clicks * SCALE,
      ctr: a.ctr,
      ctaClicks: a.ctaClicks * SCALE,
      leads: a.leads * SCALE,
      ctaRate: a.clicks > 0 ? Math.round((a.ctaClicks / a.clicks) * 10000) / 100 : 0,
      conversionRate: a.ctaClicks > 0 ? Math.round((a.leads / a.ctaClicks) * 10000) / 100 : 0,
      impressionShare: totalImpressions > 0 ? Math.round((a.impressions / totalImpressions) * 1000) / 10 : 0,
      clickShare: totalClicks > 0 ? Math.round((a.clicks / totalClicks) * 1000) / 10 : 0,
      ctaClickShare: totalCtaClicks > 0 ? Math.round((a.ctaClicks / totalCtaClicks) * 1000) / 10 : 0,
      leadShare: totalLeads > 0 ? Math.round((a.leads / totalLeads) * 1000) / 10 : 0,
    }));
  }, [selectedStage, articles]);

  const firstCount = data[0]?.count ?? 1;

  // Heights proportional to count
  const stageHeights = data.map((stage, i) => {
    if (i === 0) return 100;
    return Math.max(20, (stage.count / firstCount) * 100);
  });

  return (
    <div className="bg-white rounded-[14px] border border-surface-200 shadow-card">
      <div className="px-4 py-3 border-b border-surface-100">
        <h3 className="text-sm font-semibold text-surface-900">Content Funnel</h3>
        <p className="text-xs text-surface-500 mt-0.5">Click a stage to see topical cluster breakdown</p>
      </div>

      {/* Horizontal funnel — SVG trapezoid segments */}
      <div className="px-4 py-5">
        <svg viewBox="0 0 900 190" className="w-full" preserveAspectRatio="xMidYMid meet">
          {data.map((stage, i) => {
            const isSelected = selectedStage === stage.stage;
            const colors = STAGE_COLORS[i];

            const stageCount = data.length;
            const segmentWidth = 900 / stageCount;
            const x = i * segmentWidth;
            const gap = 4;

            const maxH = 120;
            const cy = 95;
            const leftH = (stageHeights[i] / 100) * maxH;
            const rightH = i < stageCount - 1
              ? (stageHeights[i + 1] / 100) * maxH
              : leftH * 0.7;

            const x1 = x + (i === 0 ? 0 : gap / 2);
            const x2 = x + segmentWidth - (i === stageCount - 1 ? 0 : gap / 2);
            const topLeft = cy - leftH / 2;
            const bottomLeft = cy + leftH / 2;
            const topRight = cy - rightH / 2;
            const bottomRight = cy + rightH / 2;

            const convLabel = i === 1 ? 'CTR' : i === 2 ? 'CTA rate' : i === 3 ? 'conv.' : '';

            return (
              <g
                key={stage.stage}
                onClick={() => setSelectedStage(isSelected ? null : stage.stage)}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
              >
                {/* Trapezoid shape */}
                <polygon
                  points={`${x1},${topLeft} ${x2},${topRight} ${x2},${bottomRight} ${x1},${bottomLeft}`}
                  fill={isSelected ? colors.fillSelected : colors.fill}
                  stroke={isSelected ? colors.stroke : 'none'}
                  strokeWidth={isSelected ? 2 : 0}
                  rx={4}
                />
                {/* Hover overlay */}
                <polygon
                  points={`${x1},${topLeft} ${x2},${topRight} ${x2},${bottomRight} ${x1},${bottomLeft}`}
                  fill={isSelected ? 'transparent' : 'white'}
                  fillOpacity={0}
                  className="hover:fill-opacity-10 transition-all"
                />
                {/* Stage label */}
                <text
                  x={x1 + (x2 - x1) / 2}
                  y={topLeft - 10}
                  fill={colors.labelColor}
                  fontSize={12}
                  fontWeight={600}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {stage.stage}
                </text>
                {/* Count */}
                <text
                  x={x1 + (x2 - x1) / 2}
                  y={cy}
                  fill="#111827"
                  fontSize={20}
                  fontWeight={700}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="ui-monospace, monospace"
                >
                  {formatCount(stage.count)}
                </text>
                {/* Conversion rate */}
                {i > 0 && (
                  <text
                    x={x1 + (x2 - x1) / 2}
                    y={cy + 20}
                    fill="#6b7280"
                    fontSize={10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {stage.percentage}% {convLabel}
                  </text>
                )}
                {/* Period-over-period change — only when comparison toggle is on */}
                {compareEnabled && stage.change !== null && (
                  <text
                    x={x1 + (x2 - x1) / 2}
                    y={i === 0 ? cy + 20 : cy + 34}
                    fill={stage.change > 0 ? '#16a34a' : stage.change < 0 ? '#dc2626' : '#6b7280'}
                    fontSize={10}
                    fontWeight={600}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {stage.change > 0 ? '\u25B2' : stage.change < 0 ? '\u25BC' : '\u2014'} {Math.abs(stage.change)}% vs prev
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stage-specific breakdown panel */}
      {selectedStage && (
        <div className="border-t border-surface-200 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h4 className="text-sm font-semibold text-surface-900">
                {selectedStage} — {breakdownView === 'clusters' ? 'Topical Cluster' : 'Article'} Breakdown
              </h4>
              <ViewToggle view={breakdownView} onChange={setBreakdownView} />
            </div>
            <button
              onClick={() => setSelectedStage(null)}
              className="text-xs text-surface-500 hover:text-surface-700"
            >
              Close
            </button>
          </div>
          {breakdownView === 'clusters' ? (
            <StageBreakdownTable
              breakdown={data.find((d) => d.stage === selectedStage)?.clusterBreakdown ?? []}
              stage={selectedStage}
            />
          ) : (
            <StageArticleTable
              articles={articleRows}
              stage={selectedStage}
            />
          )}
        </div>
      )}
    </div>
  );
}
