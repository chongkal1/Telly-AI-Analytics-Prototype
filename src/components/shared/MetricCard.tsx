import { TrendIndicator } from './TrendIndicator';

interface MetricCardProps {
  label: string;
  value: string;
  change: number | null;
  invertChange?: boolean;
  previousValue?: string;
  showComparison?: boolean;
  accent?: 'ai';
}

export function MetricCard({ label, value, change, invertChange, previousValue, showComparison, accent }: MetricCardProps) {
  return (
    <div className={`bg-white rounded-lg border shadow-sm p-4 ${accent === 'ai' ? 'border-purple-200 bg-gradient-to-br from-white to-purple-50/40' : 'border-surface-200'}`}>
      <dt className="text-sm font-medium text-surface-500 truncate">{label}</dt>
      <dd className={`mt-1 text-2xl font-semibold font-mono ${accent === 'ai' ? 'text-purple-900' : 'text-surface-900'}`}>{value}</dd>
      {change !== null && (
        <div className="mt-2 flex items-center gap-2">
          <TrendIndicator change={change} invertChange={invertChange} />
          {showComparison && previousValue ? (
            <span className="text-xs text-surface-400">vs {previousValue}</span>
          ) : (
            <span className="text-xs text-surface-400">vs prev period</span>
          )}
        </div>
      )}
    </div>
  );
}
