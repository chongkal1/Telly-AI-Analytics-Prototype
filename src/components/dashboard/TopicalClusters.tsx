'use client';

import { useState, useMemo, useEffect } from 'react';
import { getClusterData, getClusterPages, getClusterInsights, getContentProductionInsights, getContentFunnelData, getAllPagesOverview, ClusterPageDetail, ClusterInsight, ContentProductionInsight } from '@/data/chart-data';
import { useDateRange } from '@/hooks/useDateRange';
import { ContentFunnel } from './traffic/ContentFunnel';
import { NewTopicOpportunities } from './NewTopicOpportunities';
import { PRIORITY_CONFIG, PriorityBadge, AgentActivityLine } from './AgentMissionControl';


type SortDirection = 'asc' | 'desc';

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  return (
    <span className="ml-1 inline-flex flex-col">
      <svg
        className={`h-2 w-2 ${active && direction === 'asc' ? 'text-indigo-600' : 'text-surface-400'}`}
        viewBox="0 0 8 4"
        fill="currentColor"
      >
        <path d="M4 0L8 4H0L4 0Z" />
      </svg>
      <svg
        className={`h-2 w-2 -mt-0.5 ${active && direction === 'desc' ? 'text-indigo-600' : 'text-surface-400'}`}
        viewBox="0 0 8 4"
        fill="currentColor"
      >
        <path d="M4 4L0 0H8L4 4Z" />
      </svg>
    </span>
  );
}

function useSort<T>(data: T[], defaultKey?: keyof T & string) {
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

/* ── Full-width coverage bar for detail view ── */

function CoverageBar({ count, total, color, label }: { count: number; total: number; color: string; label: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-surface-500 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-surface-700 w-16 text-right font-mono">
        {count}/{total} <span className="text-surface-400">({pct}%)</span>
      </span>
    </div>
  );
}

/* ── Sortable header cell ── */

function Th({ label, colKey, align, sortKey, sortDir, onSort }: {
  label: string; colKey: string; align?: 'right';
  sortKey: string | null; sortDir: SortDirection; onSort: (k: string) => void;
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100 select-none ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
      onClick={() => onSort(colKey)}
    >
      <span className="inline-flex items-center">
        {label}
        <SortIcon active={sortKey === colKey} direction={sortDir} />
      </span>
    </th>
  );
}

/* ── Status badge for page performance ── */

function StatusBadge({ status }: { status: ClusterPageDetail['status'] }) {
  const config = {
    performing: { label: 'Performing', bg: 'bg-[#00C5DF]/10', text: 'text-[#00C5DF]', border: 'border-[#00C5DF]/30', dot: 'bg-[#00C5DF]/100' },
    attention: { label: 'Needs Attention', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    underperforming: { label: 'Underperforming', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

/* ── Re-exported from AgentMissionControl.tsx: PRIORITY_CONFIG, PriorityBadge, AgentActivityLine ── */

/* ── Action status icon ── */

function ActionStatusIcon({ action }: { action: string }) {
  if (action.startsWith('Planned:')) {
    return (
      <svg className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (action.startsWith('Scheduled:')) {
    return (
      <svg className="w-3 h-3 text-surface-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    );
  }
  return <span className="w-1.5 h-1.5 rounded-full bg-[#00C5DF] mt-1 shrink-0" />;
}

/* ── Discuss in Chat button ── */

function DiscussInChatButton({ clusterName }: { clusterName: string }) {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('discuss-cluster', {
      detail: { message: `Let's discuss the ${clusterName} cluster strategy. What changes would you like to make?` },
    }));
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-500 border border-surface-200 rounded-md hover:text-[#00C5DF] hover:border-[#00C5DF]/30 hover:bg-[#00C5DF]/10 transition-colors"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
      Discuss in Chat
    </button>
  );
}

/* ── (AgentMissionControl components imported from ./AgentMissionControl) ── */

/* ── Cluster production banner (for drill-down) ── */

function ClusterProductionBanner({ insight }: { insight: ContentProductionInsight }) {
  const c = PRIORITY_CONFIG[insight.priority];
  const growth = insight.keyMetrics.clusterGrowth;

  return (
    <div className={`bg-white rounded-[14px] border border-surface-200 shadow-card p-4 mb-4 border-l-[3px] ${c.borderLeft}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <PriorityBadge priority={insight.priority} />
            {growth !== 0 && (
              <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${growth > 0 ? 'text-[#00C5DF]' : 'text-red-600'}`}>
                <svg className={`w-3 h-3 ${growth > 0 ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
                {Math.abs(growth)}% trend
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-surface-900 mb-0.5">{insight.headline}</p>
          <AgentActivityLine activity={insight.agentActivity} />
          <p className="text-xs text-surface-500 leading-relaxed mb-2 mt-1.5">{insight.rationale}</p>
          <ul className="space-y-0.5">
            {insight.actions.map((action, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-surface-600">
                <ActionStatusIcon action={action} />
                {action}
              </li>
            ))}
          </ul>
          <DiscussInChatButton clusterName={insight.category} />
        </div>
      </div>
    </div>
  );
}

/* ── Change indicator (trend arrow) ── */

function ChangeIndicator({ value }: { value: number }) {
  if (value === 0) return <span className="text-xs text-surface-400">—</span>;
  const isPositive = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-[#00C5DF]' : 'text-red-600'}`}>
      <svg className={`w-3 h-3 ${isPositive ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
      {Math.abs(value)}%
    </span>
  );
}

/* ── Insight icon by type ── */

function InsightIcon({ type }: { type: ClusterInsight['type'] }) {
  if (type === 'success') {
    return (
      <div className="w-8 h-8 rounded-full bg-[#00C5DF]/15 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-[#00C5DF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
    );
  }
  if (type === 'warning') {
    return (
      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
      <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21.75 12a9.75 9.75 0 11-19.5 0 9.75 9.75 0 0119.5 0z" />
      </svg>
    </div>
  );
}

/* ── Insights panel ── */

function InsightsPanel({ insights }: { insights: ClusterInsight[] }) {
  if (insights.length === 0) return null;

  const borderColor = {
    success: 'border-l-[#00C5DF]',
    warning: 'border-l-amber-400',
    danger: 'border-l-red-400',
  };

  return (
    <div className="bg-white rounded-[14px] border border-surface-200 shadow-card p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
        <h3 className="text-sm font-semibold text-surface-900">Recommendations</h3>
      </div>
      <div className="space-y-2.5">
        {insights.map((insight, i) => (
          <div key={i} className={`flex items-start gap-3 p-3 rounded-lg bg-surface-50 border-l-[3px] ${borderColor[insight.type]}`}>
            <InsightIcon type={insight.type} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-surface-900">{insight.title}</p>
              <p className="text-xs text-surface-500 mt-0.5 leading-relaxed">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Performance summary bar ── */

function PerformanceSummaryBar({ pages }: { pages: ClusterPageDetail[] }) {
  const performing = pages.filter((p) => p.status === 'performing').length;
  const attention = pages.filter((p) => p.status === 'attention').length;
  const underperforming = pages.filter((p) => p.status === 'underperforming').length;
  const total = pages.length;

  return (
    <div className="bg-white rounded-[14px] border border-surface-200 shadow-card p-4 mb-4">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-medium text-surface-500">Performance Distribution</span>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-surface-600">
            <span className="w-2 h-2 rounded-full bg-[#00C5DF]/100" /> Performing ({performing})
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-surface-600">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Needs Attention ({attention})
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-surface-600">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Underperforming ({underperforming})
          </span>
        </div>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-surface-100 gap-0.5">
        {performing > 0 && (
          <div className="bg-[#00C5DF]/100 rounded-full transition-all" style={{ width: `${(performing / total) * 100}%` }} />
        )}
        {attention > 0 && (
          <div className="bg-amber-500 rounded-full transition-all" style={{ width: `${(attention / total) * 100}%` }} />
        )}
        {underperforming > 0 && (
          <div className="bg-red-500 rounded-full transition-all" style={{ width: `${(underperforming / total) * 100}%` }} />
        )}
      </div>
    </div>
  );
}

/* ── Cluster detail (drill-down) ── */

function ClusterDetail({ category, pages, insights, productionInsight, onBack }: { category: string; pages: ClusterPageDetail[]; insights: ClusterInsight[]; productionInsight?: ContentProductionInsight; onBack: () => void }) {
  const { sorted, sortKey, sortDir, toggle } = useSort(pages, 'clicks');

  const totalClicks = pages.reduce((s, p) => s + p.clicks, 0);
  const totalImpressions = pages.reduce((s, p) => s + p.impressions, 0);
  const totalLeads = pages.reduce((s, p) => s + p.leads, 0);
  const ctr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const withImpressions = pages.filter((p) => p.impressions > 0).length;
  const withClicks = pages.filter((p) => p.clicks > 0).length;

  const stats = [
    { label: 'Pages', value: pages.length.toString() },
    { label: 'Impressions', value: totalImpressions.toLocaleString() },
    { label: 'Clicks', value: totalClicks.toLocaleString() },
    { label: 'CTR', value: `${(ctr * 100).toFixed(2)}%` },
    { label: 'Leads', value: totalLeads.toString() },
  ];

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-900 mb-4 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        All Clusters
      </button>

      <h2 className="text-base font-semibold text-surface-900 mb-4">{category}</h2>

      {/* Production intelligence banner */}
      {productionInsight && <ClusterProductionBanner insight={productionInsight} />}

      {/* Summary cards */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-[14px] border border-surface-200 shadow-card p-3">
            <dt className="text-xs font-medium text-surface-500">{s.label}</dt>
            <dd className="mt-1 text-lg font-semibold text-surface-900 font-mono">{s.value}</dd>
          </div>
        ))}
      </div>

      {/* Recommendations panel */}
      <InsightsPanel insights={insights} />

      {/* Performance distribution bar */}
      <PerformanceSummaryBar pages={pages} />

      {/* Coverage bars */}
      <div className="bg-white rounded-[14px] border border-surface-200 shadow-card p-4 mb-4 space-y-2">
        <CoverageBar count={withImpressions} total={pages.length} color="bg-blue-500" label="Impressions" />
        <CoverageBar count={withClicks} total={pages.length} color="bg-indigo-500" label="Clicks" />
      </div>

      {/* Pages table */}
      <div className="bg-white rounded-[14px] border border-surface-200 shadow-card overflow-x-auto">
        <table className="min-w-full divide-y divide-surface-200">
          <thead className="bg-surface-50">
            <tr>
              <Th label="Title" colKey="title" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
              <Th label="Status" colKey="status" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
              <Th label="Impressions" colKey="impressions" align="right" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
              <Th label="Clicks" colKey="clicks" align="right" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
              <Th label="Trend" colKey="clicksChange" align="right" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
              <Th label="CTR" colKey="ctr" align="right" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
              <Th label="Avg Position" colKey="position" align="right" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
              <Th label="Leads" colKey="leads" align="right" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200">
            {sorted.map((page) => (
              <tr key={page.id} className="hover:bg-surface-50">
                <td className="px-4 py-3 text-sm font-medium text-surface-900 whitespace-nowrap max-w-xs truncate">{page.title}</td>
                <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={page.status} /></td>
                <td className="px-4 py-3 text-sm text-right font-mono text-surface-700 whitespace-nowrap">{page.impressions.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-right font-mono text-surface-700 whitespace-nowrap">{page.clicks.toLocaleString()}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap"><ChangeIndicator value={page.clicksChange} /></td>
                <td className="px-4 py-3 text-sm text-right font-mono text-surface-700 whitespace-nowrap">{(page.ctr * 100).toFixed(2)}%</td>
                <td className="px-4 py-3 text-sm text-right font-mono text-surface-700 whitespace-nowrap">{page.position.toFixed(1)}</td>
                <td className="px-4 py-3 text-sm text-right font-mono text-surface-700 whitespace-nowrap">{page.leads}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Main component ── */

interface NewTopicEntry {
  name: string;
  description: string;
  source: string;
}

export function TopicalClusters() {
  const { startDate, endDate, compareEnabled } = useDateRange();
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [newTopics, setNewTopics] = useState<NewTopicEntry[]>([]);
  const [excludedIndustries, setExcludedIndustries] = useState<Set<string>>(new Set());

  // Listen for cluster-created events from chat
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.name) {
        setNewTopics((prev) => [...prev, {
          name: detail.name,
          description: detail.description,
          source: 'visitor-industry',
        }]);
        if (detail.industry) {
          setExcludedIndustries((prev) => new Set(prev).add(detail.industry));
        }
      }
    };
    window.addEventListener('cluster-created', handler);
    return () => window.removeEventListener('cluster-created', handler);
  }, []);

  // Listen for topic-approved events from competitor gap panel
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.name) {
        setNewTopics((prev) => [...prev, {
          name: detail.name,
          description: detail.description,
          source: detail.source || 'competitor-gap',
        }]);
      }
    };
    window.addEventListener('topic-approved', handler);
    return () => window.removeEventListener('topic-approved', handler);
  }, []);

  const clusters = useMemo(() => getClusterData(startDate, endDate), [startDate, endDate]);
  const baseProductionInsights = useMemo(
    () => getContentProductionInsights(clusters, startDate, endDate),
    [clusters, startDate, endDate],
  );

  // Merge new topics into production insights as Monitor-priority entries
  const productionInsights = useMemo(() => {
    const newEntries: ContentProductionInsight[] = newTopics.map((t) => ({
      category: t.name,
      priority: 'monitor' as const,
      priorityLabel: 'Monitor',
      agentStatus: 'planned' as const,
      agentStatusLabel: 'Queued',
      agentActivity: 'Starting content production — drafting first articles',
      headline: t.name,
      rationale: t.description,
      keyMetrics: { totalClicks: 0, totalImpressions: 0, ctr: 0, avgClicksPerPage: 0, leads: 0, convertedLeads: 0, pageCount: 0, clusterGrowth: 0 },
      actions: ['Planned: Research keywords and outline articles'],
      agentTasks: [{ label: 'Research keywords', done: false }, { label: 'Draft first article', done: false }],
      isNewTopic: true,
    }));
    return [...baseProductionInsights, ...newEntries];
  }, [baseProductionInsights, newTopics]);

  const funnelData = useMemo(
    () => getContentFunnelData(startDate, endDate, productionInsights),
    [startDate, endDate, productionInsights],
  );
  const allPages = useMemo(
    () => getAllPagesOverview(startDate, endDate),
    [startDate, endDate],
  );
  const clusterPages = useMemo(
    () => (selectedCluster ? getClusterPages(selectedCluster, startDate, endDate) : []),
    [selectedCluster, startDate, endDate],
  );
  const insights = useMemo(() => getClusterInsights(clusterPages), [clusterPages]);

  if (selectedCluster) {
    const matchingInsight = productionInsights.find((i) => i.category === selectedCluster);
    return (
      <ClusterDetail
        category={selectedCluster}
        pages={clusterPages}
        insights={insights}
        productionInsight={matchingInsight}
        onBack={() => setSelectedCluster(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <ContentFunnel data={funnelData} articles={allPages} compareEnabled={compareEnabled} />

      {/* New Topic Opportunities */}
      <NewTopicOpportunities excludeIndustries={excludedIndustries} />
    </div>
  );
}
