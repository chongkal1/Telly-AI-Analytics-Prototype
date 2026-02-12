'use client';

import { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useDateRange } from '@/hooks/useDateRange';
import { getCtaMetrics, getCtaFunnelData, filterCtaClicksByDate, dailyCtaClicks } from '@/data/cta-clicks';
import { pages } from '@/data/pages';
import { TrendIndicator } from '@/components/shared/TrendIndicator';

/* ── Tiny sparkline (self-contained, same pattern as DashboardSummary) ── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Sparkline({ data, dataKey, color, height = 32 }: { data: any[]; dataKey: string; color: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ── Mini funnel bars ── */

function FunnelBars({ organic, cta, leads }: { organic: number; cta: number; leads: number }) {
  const max = organic || 1;
  const bars = [
    { label: 'Organic', value: organic, color: '#4f46e5', width: 100 },
    { label: 'CTA Clicks', value: cta, color: '#6366f1', width: (cta / max) * 100 },
    { label: 'Leads', value: leads, color: '#10b981', width: (leads / max) * 100 },
  ];

  return (
    <div className="space-y-1.5 mt-2">
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-2">
          <span className="text-[9px] text-gray-400 w-12 text-right shrink-0">{b.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(b.width, 1)}%`, backgroundColor: b.color }}
            />
          </div>
          <span className="text-[9px] font-mono text-gray-500 w-10 shrink-0">{b.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Main CTA Performance Card ── */

export function CTAPerformanceCard() {
  const { startDate, endDate } = useDateRange();

  const metrics = useMemo(
    () => getCtaMetrics(startDate, endDate),
    [startDate, endDate],
  );

  const funnel = useMemo(
    () => getCtaFunnelData(startDate, endDate),
    [startDate, endDate],
  );

  const sparkData = useMemo(
    () => filterCtaClicksByDate(dailyCtaClicks, startDate, endDate),
    [startDate, endDate],
  );

  // Lookup page titles for top blog articles
  const pageLookup = useMemo(() => {
    const m: Record<string, string> = {};
    pages.forEach((p) => { m[p.id] = p.title; });
    return m;
  }, []);

  const topArticles = metrics.topBlogArticles.slice(0, 5);
  const topLPs = metrics.topLandingPages;

  // Max clicks for horizontal bar scale
  const maxLpClicks = topLPs.length > 0 ? topLPs[0].clicks : 1;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-700">Content CTA Performance</h3>
        <span className="text-[10px] text-gray-400">Blog CTAs → Landing Pages</span>
      </div>

      <div className="grid grid-cols-12 gap-4 p-3" style={{ minHeight: 170 }}>
        {/* Left: Key Metrics + Funnel */}
        <div className="col-span-3 flex flex-col justify-between">
          {/* CTA Clicks */}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">CTA Clicks</span>
              {metrics.ctaClicksChange !== null && (
                <TrendIndicator change={metrics.ctaClicksChange} />
              )}
            </div>
            <div className="flex items-end gap-2">
              <span className="text-xl font-semibold text-gray-900 font-mono">
                {metrics.totalCtaClicks.toLocaleString()}
              </span>
              <div className="w-16 shrink-0 mb-0.5">
                <Sparkline data={sparkData} dataKey="totalClicks" color="#6366f1" />
              </div>
            </div>
          </div>

          {/* CTA Rate */}
          <div className="mt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">CTA Rate</span>
              {metrics.ctaRateChange !== null && (
                <TrendIndicator change={metrics.ctaRateChange} />
              )}
            </div>
            <span className="text-sm font-semibold text-amber-600 font-mono">
              {(metrics.ctaRate * 100).toFixed(1)}%
            </span>
          </div>

          {/* Click→Lead */}
          <div className="mt-1">
            <span className="text-xs text-gray-500">Click→Lead</span>
            <div>
              <span className="text-sm font-semibold text-emerald-600 font-mono">
                {(funnel.leadConvRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Mini funnel */}
          <FunnelBars organic={funnel.organicVisits} cta={funnel.ctaClicks} leads={funnel.leads} />
        </div>

        {/* Middle: Top Blog Articles by CTA Clicks */}
        <div className="col-span-5">
          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Top Articles by CTA Clicks
          </h4>
          <div className="divide-y divide-gray-50">
            {topArticles.map((article, idx) => {
              const title = pageLookup[article.pageId] || article.pageId;
              const truncated = title.length > 45 ? title.slice(0, 45) + '...' : title;
              return (
                <div key={article.pageId} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono text-gray-300 w-3 shrink-0">{idx + 1}</span>
                    <span className="text-xs text-gray-700 truncate" title={title}>
                      {truncated}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span className="text-xs font-mono font-medium text-gray-900">
                      {article.ctaClicks.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono text-amber-600">
                      {(article.ctaRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Landing Page Destinations */}
        <div className="col-span-4">
          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Landing Page Destinations
          </h4>
          <div className="space-y-2">
            {topLPs.map((lp) => (
              <div key={lp.id}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-gray-700">{lp.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-gray-900">
                      {lp.clicks.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      {(lp.share * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${(lp.clicks / maxLpClicks) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
