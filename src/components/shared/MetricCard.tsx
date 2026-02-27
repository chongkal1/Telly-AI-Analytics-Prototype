import { TrendIndicator } from './TrendIndicator';

interface MetricCardProps {
  label: string;
  value: string;
  change: number | null;
  invertChange?: boolean;
  previousValue?: string;
  showComparison?: boolean;
  accent?: 'ai';
  size?: 'default' | 'hero';
}

export function MetricCard({ label, value, change, invertChange, previousValue, showComparison, accent, size = 'default' }: MetricCardProps) {
  const isHero = size === 'hero';

  return (
    <div className={`bg-white rounded-lg border shadow-sm h-full flex flex-col ${isHero ? 'p-6 justify-center' : 'p-4'} ${accent === 'ai' ? 'border-purple-200 bg-gradient-to-br from-white to-purple-50/40' : 'border-surface-200'}`}>
      <dt className={`font-medium text-surface-500 truncate ${isHero ? 'text-base' : 'text-sm'}`}>{label}</dt>
      <dd className={`mt-1 font-semibold font-mono ${isHero ? 'text-4xl' : 'text-2xl'} ${accent === 'ai' ? 'text-purple-900' : 'text-surface-900'}`}>{value}</dd>
      {change !== null && (
        <div className={`flex items-center gap-2 ${isHero ? 'mt-3' : 'mt-2'}`}>
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
