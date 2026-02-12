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
    className: 'text-gray-500',
  },
  'no-data': { icon: null, className: 'text-gray-400' },
};

export function TrendIndicator({ change, invertChange }: TrendIndicatorProps) {
  const trend = getTrend(change, invertChange);
  const config = trendConfig[trend];

  if (change === null) return <span className="text-xs text-gray-400">—</span>;

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${config.className}`}>
      {config.icon}
      {Math.abs(change)}%
    </span>
  );
}
