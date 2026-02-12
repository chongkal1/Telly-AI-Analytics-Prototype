'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/lib/constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface BarChartWidgetProps {
  data: any[];
  bars?: { dataKey: string; color?: string; name?: string }[];
  xKey?: string;
  height?: number;
  layout?: 'vertical' | 'horizontal';
}

export function BarChartWidget({
  data,
  bars = [{ dataKey: 'clicks', color: CHART_COLORS.indigo, name: 'Clicks' }],
  xKey = 'name',
  height = 240,
  layout = 'horizontal',
}: BarChartWidgetProps) {
  if (layout === 'vertical') {
    return (
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
              width={120}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            />
            {bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                fill={bar.color || CHART_COLORS.indigo}
                radius={[0, 4, 4, 0]}
                name={bar.name || bar.dataKey}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
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
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              fill={bar.color || CHART_COLORS.indigo}
              radius={[4, 4, 0, 0]}
              name={bar.name || bar.dataKey}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
