'use client';

import { useState } from 'react';
import { ContentProductionInsight, ProductionPriority } from '@/data/chart-data';
import { AgentGoal } from '@/types';

/* ── Priority config (shared) ── */

export const PRIORITY_CONFIG: Record<ProductionPriority, { label: string; bg: string; text: string; border: string; dot: string; borderLeft: string; ringColor: string }> = {
  'double-down': { label: 'Scale Production', bg: 'bg-[#00C5DF]/10', text: 'text-[#00C5DF]', border: 'border-[#00C5DF]/30', dot: 'bg-[#00C5DF]/100', borderLeft: 'border-l-[#00C5DF]', ringColor: '#00C5DF' },
  'optimize-first': { label: 'Update Content', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', borderLeft: 'border-l-amber-400', ringColor: '#F59E0B' },
  'delete-merge': { label: 'Delete & Merge', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', borderLeft: 'border-l-red-400', ringColor: '#EF4444' },
  'monitor': { label: 'Publish & Monitor', bg: 'bg-surface-50', text: 'text-surface-600', border: 'border-surface-200', dot: 'bg-surface-400', borderLeft: 'border-l-surface-300', ringColor: '#9CA3AF' },
};

/* ── Priority badge ── */

export function PriorityBadge({ priority }: { priority: ProductionPriority }) {
  const c = PRIORITY_CONFIG[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

/* ── Agent activity line ── */

export function AgentActivityLine({ activity }: { activity: string }) {
  return (
    <p className="flex items-center gap-1 text-xs text-surface-500 italic mt-0.5">
      <svg className="w-3 h-3 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
      Agent: {activity}
    </p>
  );
}

/* ── Mini progress ring ── */

function MiniRing({ current, total, color, size = 28, strokeWidth = 3 }: { current: number; total: number; color: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? Math.min(current / total, 1) : 0;
  const offset = circumference * (1 - pct);

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" className="text-surface-200" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
    </svg>
  );
}

/* ── Agent Mission Header ── */

function AgentMissionHeader({ goal }: { goal: AgentGoal }) {
  return (
    <div className="bg-surface-900 rounded-[14px] p-5 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#00C5DF]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#00C5DF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Agent Mission Control</h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#00C5DF]/20 text-[#00C5DF]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C5DF] animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs text-surface-400 mt-0.5">Autonomous content operations center</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-surface-400">Uptime: {Math.round(goal.uptimeHours / 24)}d {goal.uptimeHours % 24}h</span>
          <div className="flex items-center gap-1.5 text-xs text-[#00C5DF]">
            <span className="w-2 h-2 rounded-full bg-[#00C5DF] animate-pulse" />
            Agent Active — {goal.clustersManaged} clusters managed
          </div>
        </div>
      </div>

    </div>
  );
}

/* ── Agent Status Label ── */

function AgentStatusLabel({ status }: { status: ContentProductionInsight['agentStatus'] }) {
  const configs: Record<ContentProductionInsight['agentStatus'], { label: string; dotClass: string; textClass: string }> = {
    'in-progress': { label: 'Working', dotClass: 'bg-emerald-500 animate-pulse', textClass: 'text-emerald-600' },
    'planned': { label: 'Queued', dotClass: 'bg-amber-400', textClass: 'text-amber-600' },
    'monitoring': { label: 'Monitoring', dotClass: 'bg-blue-400 animate-pulse', textClass: 'text-blue-600' },
    'needs-review': { label: 'Queued', dotClass: 'bg-amber-400', textClass: 'text-amber-600' },
  };
  const cfg = configs[status];

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${cfg.textClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  );
}

/* ── Signal interpretation generator ── */

function getSignalInterpretation(insight: ContentProductionInsight, goal: string): string {
  const m = insight.keyMetrics;
  const growth = m.clusterGrowth;
  const growthDir = growth > 0 ? 'grew' : 'dropped';
  const growthAbs = Math.abs(growth);
  const imprStr = m.totalImpressions > 1000 ? `${(m.totalImpressions / 1000).toFixed(1)}K` : `${m.totalImpressions}`;

  if (goal === 'Lead Generation') {
    switch (insight.priority) {
      case 'double-down':
        return `This cluster generates ${m.leads} leads with traffic up ${growthAbs}%. High lead velocity signals opportunity to scale and capture more pipeline.`;
      case 'optimize-first':
        return m.leads > 0
          ? `${imprStr} impressions but only ${m.leads} leads — conversion paths need work before this demand translates to pipeline.`
          : `Strong visibility (${imprStr} impressions) with zero leads. Adding CTAs and lead capture forms to convert existing traffic.`;
      case 'delete-merge':
        return `${m.pageCount} pages generating only ${m.leads} leads. Thin content dilutes authority — consolidating will improve lead quality.`;
      case 'monitor':
        return `${m.leads > 0 ? `${m.leads} leads from` : 'Only'} ${m.pageCount} page${m.pageCount > 1 ? 's' : ''}. Collecting more data before deciding next action.`;
    }
  }

  if (goal === 'Organic Traffic Growth') {
    switch (insight.priority) {
      case 'double-down':
        return `Traffic ${growthDir} ${growthAbs}% last month with ${m.totalClicks.toLocaleString()} clicks. Expanding keyword coverage to sustain momentum.`;
      case 'optimize-first':
        return `${imprStr} impressions but CTR at ${(m.ctr * 100).toFixed(1)}% — positions are there, but titles and meta need refreshing to win more clicks.`;
      case 'delete-merge':
        return `Only ${m.avgClicksPerPage} clicks/page across ${m.pageCount} pages. Low-performing content is dragging down cluster authority.`;
      case 'monitor':
        return `${m.avgClicksPerPage.toLocaleString()} clicks/page — efficient but small. Watching ranking trends before investing more.`;
    }
  }

  // Brand Awareness / Impressions (default)
  switch (insight.priority) {
    case 'double-down':
      return `${imprStr} impressions and ${growthDir} ${growthAbs}%. High visibility — expanding content to dominate this topic space.`;
    case 'optimize-first':
      return `${imprStr} impressions but click-through is underperforming. Improving titles and snippets to turn visibility into engagement.`;
    case 'delete-merge':
      return `Weak impression share across ${m.pageCount} pages. Merging into fewer, stronger pages will boost topical authority.`;
    case 'monitor':
      return `${imprStr} impressions from ${m.pageCount} page${m.pageCount > 1 ? 's' : ''}. Stable visibility — monitoring for changes.`;
  }
}

/* ── Task checklist item ── */

function TaskItem({ task, isCurrent }: { task: { label: string; done: boolean }; isCurrent: boolean }) {
  return (
    <div
      className={`flex items-start gap-2 text-[11px] leading-snug py-0.5 px-1.5 rounded ${
        isCurrent ? 'bg-[#00C5DF]/8 font-medium' : ''
      }`}
    >
      {task.done ? (
        <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : isCurrent ? (
        <svg className="w-3.5 h-3.5 text-[#00C5DF] shrink-0 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
        </svg>
      ) : (
        <div className="w-3.5 h-3.5 rounded border border-surface-300 shrink-0 mt-px" />
      )}
      <span className={task.done ? 'text-surface-400 line-through' : isCurrent ? 'text-surface-900' : 'text-surface-500'}>
        {task.label}
        {isCurrent && (
          <span className="ml-1.5 inline-flex items-center px-1 py-px text-[9px] font-bold rounded bg-[#00C5DF]/20 text-[#00C5DF] uppercase tracking-wide">
            Now
          </span>
        )}
      </span>
    </div>
  );
}

/* ── Agent Cluster Card (agent-first, compact) ── */

const MAX_VISIBLE_TASKS = 3;

function AgentClusterCard({ insight, onSelect, goalLabel }: { insight: ContentProductionInsight; onSelect?: (category: string) => void; goalLabel: string }) {
  const [expanded, setExpanded] = useState(false);
  const tasks = insight.agentTasks;
  const completedCount = tasks.filter(t => t.done).length;
  const taskPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const currentTaskIdx = tasks.findIndex(t => !t.done);
  const hasMany = tasks.length > MAX_VISIBLE_TASKS;

  // Show: current task context (1 before + current + 1 after), or first 3
  const visibleTasks = (() => {
    if (expanded || !hasMany) return tasks.map((t, i) => ({ ...t, idx: i }));
    // Smart slice: show around the current task
    if (currentTaskIdx >= 0) {
      const start = Math.max(0, currentTaskIdx - 1);
      const end = Math.min(tasks.length, start + MAX_VISIBLE_TASKS);
      return tasks.slice(start, end).map((t, i) => ({ ...t, idx: start + i }));
    }
    return tasks.slice(0, MAX_VISIBLE_TASKS).map((t, i) => ({ ...t, idx: i }));
  })();

  const hiddenCount = tasks.length - visibleTasks.length;

  return (
    <div className="group bg-white rounded-[12px] border border-surface-200 shadow-card p-3 transition-colors hover:border-surface-300">
      {/* Row 1: Agent status */}
      <div className="flex items-center justify-between mb-1.5">
        <AgentStatusLabel status={insight.agentStatus} />
        {/* Compact progress indicator */}
        <span className="text-[10px] text-surface-400 font-mono">{completedCount}/{tasks.length}</span>
      </div>

      {/* Row 2: Category name */}
      <div className="flex items-center gap-2 mb-1">
        <h4 className="text-[13px] font-semibold text-surface-900">
          {onSelect ? (
            <button
              className="hover:text-[#00C5DF] hover:underline transition-colors text-left"
              onClick={() => onSelect(insight.category)}
            >
              {insight.category}
            </button>
          ) : (
            insight.category
          )}
        </h4>
        {insight.isNewTopic && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-[#00C5DF]/10 text-[#00C5DF] border border-[#00C5DF]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C5DF] animate-pulse" />
            New Topic
          </span>
        )}
      </div>

      {/* Row 3: Signal interpretation — collapsible "why" */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-start gap-1.5 mb-2 w-full text-left group/signal"
      >
        <svg className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
        <p className={`text-[11px] leading-relaxed text-surface-600 ${expanded ? '' : 'line-clamp-2'}`}>
          {getSignalInterpretation(insight, goalLabel)}
        </p>
      </button>

      {/* Row 4: Progress bar (always visible) */}
      <div className="mb-2">
        <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#00C5DF] transition-all duration-500"
            style={{ width: `${taskPct}%` }}
          />
        </div>
      </div>

      {/* Row 5: Task checklist (collapsed by default, shows around current task) */}
      <div className="space-y-0.5 mb-2">
        {visibleTasks.map((task) => (
          <TaskItem key={task.idx} task={task} isCurrent={task.idx === currentTaskIdx} />
        ))}
        {hasMany && !expanded && hiddenCount > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="text-[10px] text-surface-400 hover:text-[#00C5DF] pl-6 py-0.5 transition-colors"
          >
            +{hiddenCount} more step{hiddenCount > 1 ? 's' : ''}
          </button>
        )}
        {expanded && hasMany && (
          <button
            onClick={() => setExpanded(false)}
            className="text-[10px] text-surface-400 hover:text-[#00C5DF] pl-6 py-0.5 transition-colors"
          >
            Show less
          </button>
        )}
      </div>

      {/* Row 6: Metrics (small, muted) */}
      <div className="flex items-center gap-2.5 pt-1.5 border-t border-surface-100 text-[10px] text-surface-400">
        <span>Leads <span className="font-medium text-surface-500 font-mono">{insight.keyMetrics.leads}</span></span>
        <span className="text-surface-200">&middot;</span>
        <span>Impr <span className="font-medium text-surface-500 font-mono">{insight.keyMetrics.totalImpressions > 1000 ? `${(insight.keyMetrics.totalImpressions / 1000).toFixed(1)}K` : insight.keyMetrics.totalImpressions}</span></span>
        <span className="text-surface-200">&middot;</span>
        <span>Pages <span className="font-medium text-surface-500 font-mono">{insight.keyMetrics.pageCount}</span></span>
      </div>
    </div>
  );
}

/* ── Kanban Column ── */

function KanbanColumn({ priority, insights, total, onSelect, goalLabel }: { priority: ProductionPriority; insights: ContentProductionInsight[]; total: number; onSelect?: (category: string) => void; goalLabel: string }) {
  const c = PRIORITY_CONFIG[priority];

  return (
    <div className="flex flex-col min-w-0">
      {/* Column header with colored top border */}
      <div className="rounded-t-[10px] border-t-[3px] pt-3 pb-2 px-1" style={{ borderColor: c.ringColor }}>
        <div className="flex items-center gap-2">
          <MiniRing current={insights.length} total={total} color={c.ringColor} size={24} strokeWidth={2.5} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-surface-900 font-mono leading-none">{insights.length}</span>
              <span className={`text-[11px] font-medium ${c.text}`}>{c.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stacked cards */}
      <div className="space-y-2.5 mt-1">
        {insights.map((insight) => (
          <AgentClusterCard key={insight.category} insight={insight} onSelect={onSelect} goalLabel={goalLabel} />
        ))}
        {insights.length === 0 && (
          <div className="text-center py-6 text-xs text-surface-400 border border-dashed border-surface-200 rounded-[12px]">
            No clusters
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Agent Mission Control (main export) ── */

export function AgentMissionControl({ insights, goal, onSelect }: { insights: ContentProductionInsight[]; goal: AgentGoal; onSelect?: (category: string) => void }) {

  if (insights.length === 0) return null;

  const priorities: ProductionPriority[] = ['monitor', 'double-down', 'optimize-first', 'delete-merge'];
  const grouped: Record<ProductionPriority, ContentProductionInsight[]> = {
    'double-down': [],
    'optimize-first': [],
    'delete-merge': [],
    'monitor': [],
  };
  insights.forEach((i) => { grouped[i.priority].push(i); });

  return (
    <div className="space-y-3">
      <AgentMissionHeader goal={goal} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {priorities.map((p) => (
          <KanbanColumn
            key={p}
            priority={p}
            insights={grouped[p]}
            total={insights.length}
            onSelect={onSelect}
            goalLabel={goal.label}
          />
        ))}
      </div>
    </div>
  );
}
