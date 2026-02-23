import { MonthlyReport } from '@/types';
import { TrendIndicator } from '@/components/shared/TrendIndicator';

interface ReportListProps {
  reports: MonthlyReport[];
  onSelect: (id: string) => void;
}

const fmt = (n: number) => n.toLocaleString();
const fmtUsd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

export function ReportList({ reports, onSelect }: ReportListProps) {
  const latestId = reports[reports.length - 1]?.id;

  return (
    <div className="bg-white rounded-[14px] border border-surface-200 shadow-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-100">
            <th className="text-left py-3 px-4 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Period</th>
            <th className="text-right py-3 px-3 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Clicks</th>
            <th className="text-right py-3 px-3 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Impressions</th>
            <th className="text-right py-3 px-3 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">CTR</th>
            <th className="text-right py-3 px-3 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Leads</th>
            <th className="text-right py-3 px-3 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Pipeline</th>
            <th className="text-right py-3 px-3 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">ROAS</th>
            <th className="text-right py-3 px-3 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">AI Citations</th>
            <th className="py-3 px-3" />
          </tr>
        </thead>
        <tbody>
          {[...reports].reverse().map((report) => (
            <tr
              key={report.id}
              onClick={() => onSelect(report.id)}
              className="border-b border-surface-50 last:border-0 cursor-pointer hover:bg-surface-50 transition-colors group"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-surface-900">{report.periodLabel}</span>
                  {report.id === latestId && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                      Latest
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-3 text-right">
                <span className="font-mono text-surface-900">{fmt(report.snapshot.totalClicks)}</span>
                <div className="mt-0.5"><TrendIndicator change={report.comparison.clicks} /></div>
              </td>
              <td className="py-3 px-3 text-right">
                <span className="font-mono text-surface-600">{fmt(report.snapshot.totalImpressions)}</span>
                <div className="mt-0.5"><TrendIndicator change={report.comparison.impressions} /></div>
              </td>
              <td className="py-3 px-3 text-right">
                <span className="font-mono text-surface-600">{fmtPct(report.snapshot.avgCtr)}</span>
                <div className="mt-0.5"><TrendIndicator change={report.comparison.ctr} /></div>
              </td>
              <td className="py-3 px-3 text-right">
                <span className="font-mono text-surface-900">{report.snapshot.capturedLeads}</span>
                <div className="mt-0.5"><TrendIndicator change={report.comparison.leads} /></div>
              </td>
              <td className="py-3 px-3 text-right">
                <span className="font-mono text-surface-900">{fmtUsd(report.snapshot.pipelineValue)}</span>
                <div className="mt-0.5"><TrendIndicator change={report.comparison.pipeline} /></div>
              </td>
              <td className="py-3 px-3 text-right">
                <span className="font-mono text-surface-900">{report.snapshot.roas}x</span>
                <div className="mt-0.5"><TrendIndicator change={report.comparison.roas} /></div>
              </td>
              <td className="py-3 px-3 text-right">
                <span className="font-mono text-surface-600">{fmt(report.snapshot.aiCitations)}</span>
                <div className="mt-0.5"><TrendIndicator change={report.comparison.aiCitations} /></div>
              </td>
              <td className="py-3 px-3 text-right">
                <svg className="w-4 h-4 text-surface-300 group-hover:text-indigo-400 transition-colors inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
