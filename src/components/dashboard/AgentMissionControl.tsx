'use client';

import { useState } from 'react';
import { ContentProductionInsight, ProductionPriority } from '@/data/chart-data';
import { AgentGoal, AgentActivityEntry } from '@/types';

const AVAILABLE_GOALS = [
  'Lead Generation',
  'Brand Awareness',
  'Organic Traffic Growth',
];

/* ── Priority config (shared) ── */

export const PRIORITY_CONFIG: Record<ProductionPriority, { label: string; bg: string; text: string; border: string; dot: string; borderLeft: string }> = {
  'double-down': { label: 'Scale Production', bg: 'bg-[#00C5DF]/10', text: 'text-[#00C5DF]', border: 'border-[#00C5DF]/30', dot: 'bg-[#00C5DF]/100', borderLeft: 'border-l-[#00C5DF]' },
  'optimize-first': { label: 'Update Content', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', borderLeft: 'border-l-amber-400' },
  'delete-merge': { label: 'Delete & Merge', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', borderLeft: 'border-l-red-400' },
  'monitor': { label: 'Monitor', bg: 'bg-surface-50', text: 'text-surface-600', border: 'border-surface-200', dot: 'bg-surface-400', borderLeft: 'border-l-surface-300' },
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

/* ── Mini progress ring (for summary bar) ── */

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
  const [savedGoal, setSavedGoal] = useState(goal.label);
  const [selectedGoal, setSelectedGoal] = useState(goal.label);
  const [isOpen, setIsOpen] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const hasUnsavedChange = selectedGoal !== savedGoal;

  const handleSave = () => {
    setSaveState('saving');
    setTimeout(() => {
      setSavedGoal(selectedGoal);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    }, 800);
  };

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

      <div className="flex-1 min-w-0">
        {/* Goal selector */}
        <div className="relative mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
            >
              <svg className="w-4 h-4 text-[#00C5DF] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
              <span className="text-sm font-semibold text-white">Goal: {selectedGoal}</span>
              <svg className={`w-3.5 h-3.5 text-surface-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Save button — appears when goal changed */}
            {hasUnsavedChange && saveState === 'idle' && (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00C5DF] hover:bg-[#00C5DF]/80 text-surface-900 text-xs font-semibold transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Save
              </button>
            )}
            {saveState === 'saving' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-surface-400">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                Saving...
              </span>
            )}
            {saveState === 'saved' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#00C5DF]">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Saved — agent strategy updated
              </span>
            )}
          </div>
          {isOpen && (
            <div className="absolute top-full left-0 mt-1 z-20 bg-surface-800 border border-surface-700 rounded-lg shadow-xl py-1 min-w-[220px]">
              {AVAILABLE_GOALS.map((g) => (
                <button
                  key={g}
                  onClick={() => { setSelectedGoal(g); setIsOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                    g === selectedGoal
                      ? 'text-[#00C5DF] bg-white/5'
                      : 'text-surface-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {g}
                  {g === selectedGoal && (
                    <svg className="w-3.5 h-3.5 inline ml-2 text-[#00C5DF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Warning: changing goal affects strategy */}
          {hasUnsavedChange && saveState === 'idle' && (
            <p className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-400/80">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              Changing the goal will affect how the agent prioritizes clusters and content production
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {goal.stats.map((stat) => (
            <div key={stat.label} className="bg-white/5 rounded-lg px-3 py-2">
              <p className="text-[10px] text-surface-400 uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-white font-mono">{stat.value}</span>
                {stat.change !== undefined && (
                  <span className={`text-[10px] font-medium ${stat.change > 0 ? 'text-[#00C5DF]' : 'text-red-400'}`}>
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Operations Summary Bar ── */

function OperationsSummaryBar({ insights }: { insights: ContentProductionInsight[] }) {
  const counts: Record<ProductionPriority, number> = { 'double-down': 0, 'optimize-first': 0, 'delete-merge': 0, 'monitor': 0 };
  insights.forEach((i) => { counts[i.priority] += 1; });

  const total = insights.length;
  const order: ProductionPriority[] = ['double-down', 'optimize-first', 'delete-merge', 'monitor'];
  const ringColors: Record<ProductionPriority, string> = {
    'double-down': '#00C5DF',
    'optimize-first': '#F59E0B',
    'delete-merge': '#EF4444',
    'monitor': '#9CA3AF',
  };

  return (
    <div className="grid grid-cols-4 gap-3">
      {order.map((p) => (
        <div key={p} className="bg-white rounded-[14px] border border-surface-200 shadow-card px-3 py-2.5 flex items-center gap-2.5">
          <MiniRing current={counts[p]} total={total} color={ringColors[p]} />
          <div className="min-w-0">
            <p className="text-lg font-bold text-surface-900 font-mono leading-none">{counts[p]}</p>
            <p className="text-[10px] text-surface-500 mt-0.5 truncate">{PRIORITY_CONFIG[p].label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Agent Cluster Card ── */

function AgentClusterCard({ insight, onSelect }: { insight: ContentProductionInsight; onSelect?: (category: string) => void }) {
  const c = PRIORITY_CONFIG[insight.priority];
  const growth = insight.keyMetrics.clusterGrowth;
  const isActive = insight.agentStatus === 'in-progress';

  // Mock task progress — derive from pageCount
  const totalTasks = Math.max(3, Math.min(8, insight.keyMetrics.pageCount));
  const completedTasks = Math.max(1, Math.round(totalTasks * (insight.priority === 'double-down' ? 0.6 : insight.priority === 'delete-merge' ? 0.3 : insight.priority === 'optimize-first' ? 0.5 : 0.8)));
  const taskPct = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className={`group bg-white rounded-[14px] border border-surface-200 shadow-card p-4 border-l-[3px] ${c.borderLeft} transition-colors hover:border-surface-300`}>
      <div className="flex items-start justify-between mb-2">
        <PriorityBadge priority={insight.priority} />
        <div className="flex items-center gap-2">
          {isActive && <span className="w-2 h-2 rounded-full bg-[#00C5DF] animate-pulse" />}
          {growth !== 0 && (
            <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${growth > 0 ? 'text-[#00C5DF]' : 'text-red-600'}`}>
              <svg className={`w-3 h-3 ${growth > 0 ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
              {Math.abs(growth)}%
            </span>
          )}
        </div>
      </div>

      <h4 className="text-sm font-semibold text-surface-900 mb-1">
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

      {/* Task progress bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-surface-400">{completedTasks} of {totalTasks} tasks complete</span>
          <span className="text-[10px] font-medium text-surface-500 font-mono">{taskPct}%</span>
        </div>
        <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#00C5DF] transition-all duration-500"
            style={{ width: `${taskPct}%` }}
          />
        </div>
      </div>

      {/* Agent activity */}
      <AgentActivityLine activity={insight.agentActivity} />

      {/* Mini metrics row */}
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-surface-100">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-surface-400">Leads</span>
          <span className="text-xs font-semibold text-surface-900 font-mono">{insight.keyMetrics.leads}</span>
        </div>
        <div className="w-px h-3 bg-surface-200" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-surface-400">Impr</span>
          <span className="text-xs font-semibold text-surface-900 font-mono">{insight.keyMetrics.totalImpressions > 1000 ? `${(insight.keyMetrics.totalImpressions / 1000).toFixed(1)}K` : insight.keyMetrics.totalImpressions}</span>
        </div>
        <div className="w-px h-3 bg-surface-200" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-surface-400">Pages</span>
          <span className="text-xs font-semibold text-surface-900 font-mono">{insight.keyMetrics.pageCount}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Activity type icon ── */

function ActivityTypeIcon({ type }: { type: AgentActivityEntry['type'] }) {
  const configs: Record<AgentActivityEntry['type'], { bg: string; color: string; icon: string }> = {
    publish: { bg: 'bg-[#00C5DF]/10', color: 'text-[#00C5DF]', icon: 'M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z' },
    optimize: { bg: 'bg-amber-50', color: 'text-amber-600', icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182' },
    research: { bg: 'bg-indigo-50', color: 'text-indigo-600', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' },
    create: { bg: 'bg-purple-50', color: 'text-purple-600', icon: 'M12 4.5v15m7.5-7.5h-15' },
    update: { bg: 'bg-blue-50', color: 'text-blue-600', icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125' },
    analyze: { bg: 'bg-emerald-50', color: 'text-emerald-600', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' },
  };
  const cfg = configs[type];

  return (
    <div className={`w-7 h-7 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
      <svg className={`w-3.5 h-3.5 ${cfg.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={cfg.icon} />
      </svg>
    </div>
  );
}

/* ── Agent Activity Feed ── */

function AgentActivityFeed({ entries }: { entries: AgentActivityEntry[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? entries : entries.slice(0, 3);

  return (
    <div className="bg-white rounded-[14px] border border-surface-200 shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-sm font-semibold text-surface-900">Live Activity Feed</h3>
        <span className="inline-flex items-center gap-1 text-[10px] text-surface-400 ml-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C5DF] animate-pulse" />
          Streaming
        </span>
      </div>
      <div className="relative">
        {/* Timeline connector */}
        <div className="absolute left-[13px] top-4 bottom-4 w-px bg-surface-200" />
        <div className="space-y-0">
          {visible.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 py-2 relative">
              <ActivityTypeIcon type={entry.type} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-surface-700">
                  {entry.action}
                  <span className="text-surface-400"> in </span>
                  <span className="font-medium text-surface-900">{entry.cluster}</span>
                </p>
              </div>
              <span className="text-[10px] text-surface-400 whitespace-nowrap shrink-0">{entry.relativeTime}</span>
            </div>
          ))}
        </div>
      </div>
      {entries.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 w-full text-center text-xs font-medium text-surface-500 hover:text-[#00C5DF] py-1.5 rounded-lg hover:bg-surface-50 transition-colors"
        >
          {showAll ? 'Show less' : `View more (${entries.length - 3})`}
        </button>
      )}
    </div>
  );
}

/* ── Agent Mission Control (main export) ── */

export function AgentMissionControl({ insights, goal, activityFeed, onSelect }: { insights: ContentProductionInsight[]; goal: AgentGoal; activityFeed: AgentActivityEntry[]; onSelect?: (category: string) => void }) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-3">
      <AgentMissionHeader goal={goal} />
      <OperationsSummaryBar insights={insights} />
      <div className="grid grid-cols-2 gap-3">
        {insights.map((insight) => (
          <AgentClusterCard key={insight.category} insight={insight} onSelect={onSelect} />
        ))}
      </div>
      <AgentActivityFeed entries={activityFeed} />
    </div>
  );
}
