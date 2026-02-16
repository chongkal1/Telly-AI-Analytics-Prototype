'use client';

import { Widget } from '@/types';
import { getChartData, getMetricValue, getComparisonChartData } from '@/data/chart-data';
import { useDateRange } from '@/hooks/useDateRange';
import { MetricCard } from '@/components/shared/MetricCard';
import { LineChartWidget } from '@/components/charts/LineChartWidget';
import { BarChartWidget } from '@/components/charts/BarChartWidget';
import { PieChartWidget } from '@/components/charts/PieChartWidget';
import { DataTable } from '@/components/charts/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { CHART_COLORS } from '@/lib/constants';
import { LeadStatus } from '@/types';
import { AI_ENGINES } from '@/data/ai-analytics';


interface DashboardWidgetProps {
  widget: Widget;
}

export function DashboardWidget({ widget }: DashboardWidgetProps) {
  const { startDate, endDate, compareEnabled, compareStartDate, compareEndDate } = useDateRange();

  // Section header divider — data-driven by title
  if (widget.type === 'section') {
    const sectionConfig: Record<string, { accent: string; bg: string; badge: string; badgeText: string; description: string }> = {
      'AI Analytics': {
        accent: 'bg-purple-500', bg: 'bg-purple-50', badge: 'text-purple-600', badgeText: 'AI-Powered',
        description: 'Track how your content appears across ChatGPT, Perplexity, Gemini, Claude, Copilot, and Meta AI',
      },
    };
    const cfg = sectionConfig[widget.title] || sectionConfig['AI Analytics'];

    return (
      <div className="pt-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-1 h-5 ${cfg.accent} rounded-full`} />
            <h2 className="text-base font-semibold text-gray-900">{widget.title}</h2>
          </div>
          <div className="flex-1 h-px bg-gray-200" />
          <span className={`text-xs ${cfg.badge} font-medium ${cfg.bg} px-2 py-0.5 rounded-full`}>
            {cfg.badgeText}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1 ml-4">
          {cfg.description}
        </p>
      </div>
    );
  }

  if (widget.type === 'metric') {
    const { value, change, previousValue } = getMetricValue(
      widget.dataKey,
      startDate,
      endDate,
      compareEnabled ? compareStartDate : undefined,
      compareEnabled ? compareEndDate : undefined,
    );

    // AI metrics get a special accent color on the card
    const isAIMetric = widget.dataKey.startsWith('ai');

    return (
      <MetricCard
        label={widget.title}
        value={value}
        change={change}
        previousValue={previousValue}
        showComparison={compareEnabled}
        invertChange={widget.dataKey === 'aiAvgPosition'}
        accent={isAIMetric ? 'ai' : undefined}
      />
    );
  }

  // For line charts with comparison enabled, use merged data
  if (widget.type === 'line' && compareEnabled && widget.dataKey === 'dailyTraffic') {
    const comparisonData = getComparisonChartData(
      widget.dataKey,
      startDate,
      endDate,
      compareStartDate,
      compareEndDate,
    );

    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{widget.title}</h3>
        <LineChartWidget
          data={comparisonData}
          lines={[
            { dataKey: 'clicks', color: CHART_COLORS.indigo, name: 'Clicks' },
            { dataKey: 'impressions', color: CHART_COLORS.emerald, name: 'Impressions' },
          ]}
          comparisonLines={[
            { dataKey: 'prev_clicks', color: CHART_COLORS.indigo, name: 'Prev Clicks' },
            { dataKey: 'prev_impressions', color: CHART_COLORS.emerald, name: 'Prev Impressions' },
          ]}
          height={200}
        />
      </div>
    );
  }

  const data = getChartData(widget.dataKey, startDate, endDate);

  // AI Citations Trend — show citations & appearances
  if (widget.type === 'line' && widget.dataKey === 'dailyAITraffic') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{widget.title}</h3>
        <LineChartWidget
          data={data}
          lines={[
            { dataKey: 'citations', color: '#7c3aed', name: 'Citations' },
            { dataKey: 'appearances', color: '#06b6d4', name: 'Appearances' },
          ]}
          height={200}
        />
      </div>
    );
  }

  // AI Engine Timeline — one line per AI engine
  if (widget.type === 'line' && widget.dataKey === 'aiEngineTimeline') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{widget.title}</h3>
        <LineChartWidget
          data={data}
          lines={AI_ENGINES.map((eng) => ({
            dataKey: eng.name,
            color: eng.color,
            name: eng.name,
          }))}
          height={240}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{widget.title}</h3>

      {widget.type === 'line' && (
        <LineChartWidget
          data={data}
          lines={[
            { dataKey: 'clicks', color: CHART_COLORS.indigo, name: 'Clicks' },
            { dataKey: 'impressions', color: CHART_COLORS.emerald, name: 'Impressions' },
          ]}
          height={200}
        />
      )}

      {widget.type === 'bar' && widget.dataKey === 'aiCompetitorVisibility' && (
        <BarChartWidget
          data={data}
          bars={[{ dataKey: 'visibility', color: '#7c3aed', name: 'Visibility %' }]}
          height={200}
        />
      )}

      {widget.type === 'bar' && widget.dataKey === 'aiCompetitorSOV' && (
        <BarChartWidget
          data={data}
          bars={[{ dataKey: 'shareOfVoice', color: '#06b6d4', name: 'Share of Voice %' }]}
          height={200}
        />
      )}

      {widget.type === 'bar' && widget.dataKey === 'industryByValue' && (
        <BarChartWidget
          data={data}
          bars={[{ dataKey: 'value', color: CHART_COLORS.emerald, name: 'Pipeline Value' }]}
          height={200}
        />
      )}

      {widget.type === 'bar' && !widget.dataKey.startsWith('ai') && widget.dataKey !== 'industryByValue' && (
        <BarChartWidget
          data={data}
          bars={[{ dataKey: widget.dataKey === 'categoryPerformance' ? 'avgClicks' : 'clicks', color: CHART_COLORS.indigo }]}
          height={200}
        />
      )}

      {widget.type === 'pie' && (
        <PieChartWidget
          data={data as { name: string; value: number }[]}
          height={200}
        />
      )}

      {widget.type === 'table' && widget.dataKey === 'recentLeads' && (
        <DataTable
          columns={[
            { key: 'name', label: 'Name', sortable: true },
            { key: 'company', label: 'Company', sortable: true },
            {
              key: 'industry',
              label: 'Industry',
              sortable: true,
              render: (val) => (
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                  {val as string}
                </span>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              render: (val) => <StatusBadge status={val as LeadStatus} />,
            },
            {
              key: 'value',
              label: 'Value',
              align: 'right',
              sortable: true,
              render: (val) => formatCurrency(val as number),
            },
            {
              key: 'createdAt',
              label: 'Date',
              sortable: true,
              render: (val) => formatDate(val as string),
            },
          ]}
          data={data}
        />
      )}

      {widget.type === 'table' && widget.dataKey === 'contentTable' && (
        <DataTable
          columns={[
            { key: 'title', label: 'Title', sortable: true },
            { key: 'category', label: 'Category', sortable: true },
            { key: 'clicks', label: 'Clicks', sortable: true, align: 'right' },
            { key: 'impressions', label: 'Impressions', sortable: true, align: 'right' },
            {
              key: 'ctr',
              label: 'CTR',
              sortable: true,
              align: 'right',
              render: (val) => `${((val as number) * 100).toFixed(2)}%`,
            },
            {
              key: 'position',
              label: 'Position',
              sortable: true,
              align: 'right',
              render: (val) => (val as number).toFixed(1),
            },
          ]}
          data={data}
        />
      )}

    </div>
  );
}
