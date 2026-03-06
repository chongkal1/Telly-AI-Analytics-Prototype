'use client';

import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getContentIntelligence } from '@/data/chart-data';
import { useMaturityStage } from '@/hooks/useMaturityStage';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#00C5DF', '#818cf8', '#f59e0b', '#34d399', '#f472b6', '#a78bfa', '#fb923c', '#38bdf8'];

export function VisitorIndustrySummary({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { stage } = useMaturityStage();
  const [excludedIndustries, setExcludedIndustries] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.industry) {
        setExcludedIndustries((prev) => new Set(prev).add(detail.industry));
      }
    };
    window.addEventListener('cluster-created', handler);
    return () => window.removeEventListener('cluster-created', handler);
  }, []);

  const allData = useMemo(() => getContentIntelligence(stage), [stage]);
  const uncovered = useMemo(
    () => allData
      .filter((g) => g.contentCoverage !== 'strong' && !excludedIndustries.has(g.industry))
      .sort((a, b) => b.leadCount - a.leadCount)
      .slice(0, 5),
    [allData, excludedIndustries],
  );

  const totalUncovered = allData.filter(
    (g) => g.contentCoverage !== 'strong' && !excludedIndustries.has(g.industry),
  ).length;

  const totalVisitors = uncovered.reduce((s, g) => s + g.leadCount, 0);

  // Hide on stages with no identified visitors
  if (stage === '1mo' || stage === '3mo') return null;

  const handleCreateCluster = (industry: string) => {
    window.dispatchEvent(new CustomEvent('create-cluster', {
      detail: {
        industry,
        message: `I'm planning to create a ${industry} topical cluster.`,
      },
    }));
  };

  if (uncovered.length === 0) return null;

  const chartData = uncovered.map((g) => ({ name: g.industry, value: g.leadCount }));

  return (
    <div className="bg-white rounded-[14px] border border-surface-200 shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-100">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#00C5DF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-surface-900">Visitor Industry Insights</h3>
            <p className="text-xs text-surface-500 mt-0.5">Your visitors come from industries you don&apos;t cover yet</p>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-[#00C5DF]/10 text-[#00C5DF] border border-[#00C5DF]/30">
            {totalUncovered}
          </span>
        </div>
      </div>

      <div className="flex">
        {/* Donut chart — left (1/3) */}
        <div className="w-1/3 shrink-0 flex flex-col items-center justify-center py-4 px-2">
          <div className="w-[160px] h-[160px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                  stroke="none"
                  paddingAngle={2}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} visitors`, '']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold text-surface-900 font-mono leading-none">{totalVisitors}</span>
              <span className="text-[10px] text-surface-400 mt-0.5">visitors</span>
            </div>
          </div>
        </div>

        {/* Table — right (2/3) */}
        <div className="w-2/3 min-w-0 border-l border-surface-100">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="px-4 py-2 text-[10px] font-medium text-surface-400 uppercase tracking-wider text-left">Industry</th>
                <th className="px-4 py-2 text-[10px] font-medium text-surface-400 uppercase tracking-wider text-right">Visitors</th>
                <th className="px-4 py-2 text-[10px] font-medium text-surface-400 uppercase tracking-wider text-right">Pipeline Value</th>
                <th className="px-4 py-2 text-[10px] font-medium text-surface-400 uppercase tracking-wider text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {uncovered.map((gap, i) => (
                <tr key={gap.industry} className="hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-2.5 text-sm text-surface-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {gap.industry}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-surface-700 text-right font-mono whitespace-nowrap">{gap.leadCount}</td>
                  <td className="px-4 py-2.5 text-sm text-surface-700 text-right font-mono whitespace-nowrap">{formatCurrency(gap.pipelineValue)}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleCreateCluster(gap.industry)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-surface-500 bg-surface-50 border border-surface-200 rounded-md hover:bg-surface-100 hover:text-surface-700 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Create Topic
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {onNavigate && (
        <div className="px-4 py-2.5 border-t border-surface-100 bg-surface-50">
          <button
            onClick={() => onNavigate('clusters')}
            className="text-xs font-medium text-[#00C5DF] hover:text-[#00a8bf] transition-colors flex items-center gap-1"
          >
            View all opportunities
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
