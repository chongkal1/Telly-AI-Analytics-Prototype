type TrendType = 'up' | 'down' | 'stable' | 'no-data';

interface TrendIndicatorProps {
  change: number | null;
  invertChange?: boolean;
}

function getTrend(change: number | null, invert?: boolean): TrendType {
  if (change === null) return 'no-data';
  const effective = invert ? -change : change;
  if (effective > 0) return 'up';
  if (effective < 0) return 'down';
  return 'stable';
}

/* Mini sparkline — deterministic points based on change value */
function MiniSparkline({ change, trend }: { change: number; trend: TrendType }) {
  const color = trend === 'up' ? '#16a34a' : trend === 'down' ? '#dc2626' : '#6b7280';
  const abs = Math.abs(change);

  // Generate 7 points that trend up or down
  const seed = abs * 7 + 3;
  const points: number[] = [];
  for (let i = 0; i < 7; i++) {
    const base = trend === 'up'
      ? 12 - (i / 6) * 8  // trending up: high→low in y (SVG y is inverted)
      : 4 + (i / 6) * 8;  // trending down: low→high in y
    const jitter = ((seed * (i + 1) * 13) % 7) - 3; // small deterministic noise
    points.push(Math.max(1, Math.min(15, base + jitter * 0.4)));
  }

  const pathData = points
    .map((y, i) => `${i === 0 ? 'M' : 'L'}${i * 5},${y}`)
    .join(' ');

  return (
    <svg width="30" height="16" viewBox="0 0 30 16" className="shrink-0">
      <path d={pathData} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const trendConfig: Record<TrendType, { icon: React.ReactNode; className: string }> = {
  up: {
    icon: (
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    ),
    className: 'text-green-600',
  },
  down: {
    icon: (
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
    className: 'text-red-600',
  },
  stable: {
    icon: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    ),
    className: 'text-surface-500',
  },
  'no-data': { icon: null, className: 'text-surface-400' },
};

export function TrendIndicator({ change, invertChange }: TrendIndicatorProps) {
  const trend = getTrend(change, invertChange);
  const config = trendConfig[trend];

  if (change === null) return <span className="text-xs text-surface-400">—</span>;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${config.className}`}>
      <MiniSparkline change={change} trend={trend} />
      {config.icon}
      {Math.abs(change)}%
    </span>
  );
}
