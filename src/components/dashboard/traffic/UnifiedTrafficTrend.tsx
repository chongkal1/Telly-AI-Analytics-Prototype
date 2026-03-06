'use client';

import { useState, useMemo } from 'react';
import { useDateRange } from '@/hooks/useDateRange';
import { getChartData } from '@/data/chart-data';
import { filterAITrafficByDate, dailyAITraffic, AI_ENGINES } from '@/data/ai-analytics';
import { LineChartWidget } from '@/components/charts/LineChartWidget';
import { CHART_COLORS } from '@/lib/constants';
import { DailyTraffic } from '@/types';

type TrafficTrendMode = 'combined' | 'bySource';

function ModeToggle({ mode, onChange }: { mode: TrafficTrendMode; onChange: (m: TrafficTrendMode) => void }) {
  return (
    <div className="inline-flex items-center bg-surface-100 rounded-lg p-0.5">
      <button
        onClick={() => onChange('combined')}
        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
          mode === 'combined' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'
        }`}
      >
        Combined
      </button>
      <button
        onClick={() => onChange('bySource')}
        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
          mode === 'bySource' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'
        }`}
      >
        By Source
      </button>
    </div>
  );
}

const COMBINED_LINES = [
  { dataKey: 'totalClicks', color: CHART_COLORS.indigo, name: 'Total Clicks' },
  { dataKey: 'totalImpressions', color: CHART_COLORS.cyan, name: 'Total Impressions' },
];

const COMBINED_COMPARISON_LINES = [
  { dataKey: 'prev_totalClicks', color: CHART_COLORS.indigo, name: 'Prev Clicks' },
  { dataKey: 'prev_totalImpressions', color: CHART_COLORS.cyan, name: 'Prev Impressions' },
];

const SEARCH_ENGINES = [
  { key: 'Google', color: '#4285f4' },
  { key: 'Bing', color: '#00809d' },
  { key: 'DuckDuckGo', color: '#de5833' },
  { key: 'Yahoo', color: '#7b0099' },
];

const BY_SOURCE_LINES = [
  ...SEARCH_ENGINES.map((eng) => ({
    dataKey: eng.key,
    color: eng.color,
    name: eng.key,
  })),
  ...AI_ENGINES.map((eng) => ({
    dataKey: eng.name,
    color: eng.color,
    name: eng.name,
  })),
];

export function UnifiedTrafficTrend() {
  const [mode, setMode] = useState<TrafficTrendMode>('combined');
  const { startDate, endDate, compareEnabled, compareStartDate, compareEndDate } = useDateRange();

  const organicData = useMemo(
    () => getChartData('dailyTraffic', startDate, endDate) as DailyTraffic[],
    [startDate, endDate],
  );

  const aiData = useMemo(
    () => filterAITrafficByDate(dailyAITraffic, startDate, endDate),
    [startDate, endDate],
  );

  // Combined mode: merge organic + AI into total clicks / total impressions
  const combinedData = useMemo(() => {
    const aiMap = new Map(aiData.map((d) => [d.date, d]));
    return organicData.map((d) => {
      const ai = aiMap.get(d.date);
      return {
        date: d.date,
        totalClicks: d.clicks + (ai?.citations ?? 0),
        totalImpressions: d.impressions + (ai?.appearances ?? 0),
      };
    });
  }, [organicData, aiData]);

  // Combined mode with comparison period
  const combinedComparisonData = useMemo(() => {
    if (!compareEnabled || mode !== 'combined') return null;

    const prevOrganic = getChartData('dailyTraffic', compareStartDate, compareEndDate) as DailyTraffic[];
    const prevAI = filterAITrafficByDate(dailyAITraffic, compareStartDate, compareEndDate);
    const prevAIMap = new Map(prevAI.map((d) => [d.date, d]));

    const prevCombined = prevOrganic.map((d) => {
      const ai = prevAIMap.get(d.date);
      return {
        totalClicks: d.clicks + (ai?.citations ?? 0),
        totalImpressions: d.impressions + (ai?.appearances ?? 0),
      };
    });

    // Align by index (same pattern as getComparisonChartData)
    const maxLen = Math.max(combinedData.length, prevCombined.length);
    const merged = [];
    for (let i = 0; i < maxLen; i++) {
      const cur = combinedData[i];
      const prev = prevCombined[i];
      merged.push({
        date: cur?.date ?? '',
        totalClicks: cur?.totalClicks ?? null,
        totalImpressions: cur?.totalImpressions ?? null,
        prev_totalClicks: prev?.totalClicks ?? null,
        prev_totalImpressions: prev?.totalImpressions ?? null,
      });
    }
    return merged;
  }, [compareEnabled, mode, combinedData, compareStartDate, compareEndDate]);

  // By Source mode: traditional search engines + AI engines
  const bySourceData = useMemo(() => {
    const aiMap = new Map(aiData.map((d) => [d.date, d]));
    return organicData.map((d) => {
      const ai = aiMap.get(d.date);
      // Split organic clicks into search engines (Google ~87%, Bing ~7%, DuckDuckGo ~1.5%, Yahoo ~2%)
      const google = Math.round(d.clicks * 0.87);
      const bing = Math.round(d.clicks * 0.07);
      const duckduckgo = Math.round(d.clicks * 0.015);
      const yahoo = Math.round(d.clicks * 0.02);
      return {
        date: d.date,
        Google: google,
        Bing: bing,
        DuckDuckGo: duckduckgo,
        Yahoo: yahoo,
        ChatGPT: ai?.chatgpt ?? 0,
        Perplexity: ai?.perplexity ?? 0,
        Gemini: ai?.gemini ?? 0,
        Claude: ai?.claude ?? 0,
        Copilot: ai?.copilot ?? 0,
        'Meta AI': ai?.metaAi ?? 0,
      };
    });
  }, [organicData, aiData]);

  const chartData = mode === 'combined'
    ? (combinedComparisonData ?? combinedData)
    : bySourceData;

  const chartLines = mode === 'combined' ? COMBINED_LINES : BY_SOURCE_LINES;
  const comparisonLines = mode === 'combined' && combinedComparisonData
    ? COMBINED_COMPARISON_LINES
    : undefined;

  return (
    <div className="bg-white rounded-[14px] border border-surface-200 shadow-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-surface-900">Traffic Trends</h3>
          <p className="text-xs text-surface-500 mt-0.5">
            {mode === 'combined'
              ? 'Search + AI referral traffic combined'
              : 'Traffic broken down by source'}
          </p>
        </div>
        <ModeToggle mode={mode} onChange={setMode} />
      </div>
      <LineChartWidget
        data={chartData}
        lines={chartLines}
        comparisonLines={comparisonLines}
        height={240}
      />
    </div>
  );
}
