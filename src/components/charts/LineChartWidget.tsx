'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CHART_COLORS } from '@/lib/constants';
import { formatDateShort } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface LineChartWidgetProps {
  data: any[];
  lines?: { dataKey: string; color?: string; name?: string }[];
  comparisonLines?: { dataKey: string; color?: string; name?: string }[];
  xKey?: string;
  height?: number;
}

export function LineChartWidget({
  data,
  lines = [{ dataKey: 'clicks', color: CHART_COLORS.indigo, name: 'Clicks' }],
  comparisonLines,
  xKey = 'date',
  height = 240,
}: LineChartWidgetProps) {
  const chartData = data.map((item) => ({
    ...item,
    [xKey]: typeof item[xKey] === 'string' ? formatDateShort(item[xKey] as string) : item[xKey],
  }));

  const showLegend = lines.length > 1 || !!comparisonLines;

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={45}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          />
          {showLegend && <Legend />}
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color || CHART_COLORS.indigo}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              name={line.name || line.dataKey}
            />
          ))}
          {comparisonLines?.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color || CHART_COLORS.indigo}
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 3 }}
              name={line.name || line.dataKey}
              opacity={0.5}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
