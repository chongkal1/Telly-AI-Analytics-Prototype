'use client';

import React, { useState, useMemo } from 'react';
import { FunnelStageData, FunnelClusterBreakdown, ProductionPriority } from '@/data/chart-data';

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
  'expand': { label: 'Expand Coverage', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
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

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return n.toLocaleString();
}

interface ContentFunnelProps {
  data: FunnelStageData[];
}

export function ContentFunnel({ data }: ContentFunnelProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>('Impressions');

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
        <svg viewBox="0 0 900 170" className="w-full" preserveAspectRatio="xMidYMid meet">
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
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stage-specific breakdown panel */}
      {selectedStage && (
        <div className="border-t border-surface-200 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-surface-900">
              {selectedStage} — Topical Cluster Breakdown
            </h4>
            <button
              onClick={() => setSelectedStage(null)}
              className="text-xs text-surface-500 hover:text-surface-700"
            >
              Close
            </button>
          </div>
          <StageBreakdownTable
            breakdown={data.find((d) => d.stage === selectedStage)?.clusterBreakdown ?? []}
            stage={selectedStage}
          />
        </div>
      )}
    </div>
  );
}
