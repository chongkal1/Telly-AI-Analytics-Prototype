import { MonthlyReport } from '@/types';

interface ReportEmailTemplateProps {
  report: MonthlyReport;
}

const fmt = (n: number) => n.toLocaleString();
const fmtUsd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

function changeLabel(n: number) {
  return n >= 0 ? `+${n}%` : `${n}%`;
}

function changeColor(n: number) {
  return n >= 0 ? '#059669' : '#dc2626';
}

export function ReportEmailTemplate({ report }: ReportEmailTemplateProps) {
  const { snapshot: s, comparison: c, narrative: n } = report;

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: 600, margin: '0 auto' }}>
      {/* Header */}
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderBottom: '3px solid #4f46e5' }}>
        <tbody>
          <tr>
            <td style={{ padding: '24px 0 16px' }}>
              <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
                {report.periodLabel}
              </p>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
                {report.title}
              </h1>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                Generated {new Date(report.generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Key Metrics */}
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ margin: '24px 0' }}>
        <tbody>
          <tr>
            <td style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 8, width: '33%', textAlign: 'center' as const }}>
              <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', margin: '0 0 4px' }}>Clicks</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 2px', fontFamily: 'monospace' }}>{fmt(s.totalClicks)}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: changeColor(c.clicks), margin: 0 }}>{changeLabel(c.clicks)}</p>
            </td>
            <td style={{ width: 8 }} />
            <td style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 8, width: '33%', textAlign: 'center' as const }}>
              <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', margin: '0 0 4px' }}>Leads</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 2px', fontFamily: 'monospace' }}>{s.capturedLeads}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: changeColor(c.leads), margin: 0 }}>{changeLabel(c.leads)}</p>
            </td>
            <td style={{ width: 8 }} />
            <td style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 8, width: '33%', textAlign: 'center' as const }}>
              <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', margin: '0 0 4px' }}>Pipeline</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 2px', fontFamily: 'monospace' }}>{fmtUsd(s.pipelineValue)}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: changeColor(c.pipeline), margin: 0 }}>{changeLabel(c.pipeline)}</p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Executive Summary */}
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ margin: '24px 0' }}>
        <tbody>
          <tr>
            <td>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                Executive Summary
              </h2>
              <div style={{ borderLeft: '3px solid #c7d2fe', background: '#eef2ff', borderRadius: '0 8px 8px 0', padding: '12px 16px' }}>
                {n.executiveSummary.split('\n\n').map((p, i) => (
                  <p key={i} style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: i === 0 ? 0 : '12px 0 0' }}>{p}</p>
                ))}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Traffic & AI Metrics Table */}
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ margin: '24px 0' }}>
        <tbody>
          <tr>
            <td>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                Performance Snapshot
              </h2>
            </td>
          </tr>
          <tr>
            <td>
              <table width="100%" cellPadding={0} cellSpacing={0} style={{ fontSize: 13 }}>
                <tbody>
                  {[
                    { label: 'Total Clicks', value: fmt(s.totalClicks), change: c.clicks },
                    { label: 'Impressions', value: fmt(s.totalImpressions), change: c.impressions },
                    { label: 'CTR', value: fmtPct(s.avgCtr), change: c.ctr },
                    { label: 'AI Citations', value: fmt(s.aiCitations), change: c.aiCitations },
                    { label: 'AI Visibility', value: `${s.aiVisibilityScore}%`, change: c.aiVisibility },
                    { label: 'Identified Visitors', value: fmt(s.identifiedVisitors), change: c.visitors },
                    { label: 'Captured Leads', value: fmt(s.capturedLeads), change: c.leads },
                    { label: 'Pipeline Value', value: fmtUsd(s.pipelineValue), change: c.pipeline },
                    { label: 'ROAS', value: `${s.roas}x`, change: c.roas },
                    { label: 'Cost per Lead', value: fmtUsd(s.costPerLead), change: undefined },
                  ].map((row, i) => (
                    <tr key={row.label} style={{ background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                      <td style={{ padding: '8px 12px', color: '#6b7280' }}>{row.label}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: '#111827', fontFamily: 'monospace', textAlign: 'right' as const }}>{row.value}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: row.change !== undefined ? changeColor(row.change) : '#9ca3af', textAlign: 'right' as const, width: 80 }}>
                        {row.change !== undefined ? changeLabel(row.change) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Cluster Performance */}
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ margin: '24px 0' }}>
        <tbody>
          <tr>
            <td>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                Cluster Performance
              </h2>
            </td>
          </tr>
          <tr>
            <td>
              <table width="100%" cellPadding={0} cellSpacing={0} style={{ fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left' as const, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', fontSize: 10 }}>Cluster</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' as const, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', fontSize: 10 }}>Clicks</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' as const, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', fontSize: 10 }}>Leads</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' as const, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', fontSize: 10 }}>Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {s.clusterPerformance.map((cluster, i) => (
                    <tr key={cluster.category} style={{ background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                      <td style={{ padding: '6px 8px', color: '#111827', fontWeight: 500 }}>{cluster.category}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right' as const, color: '#111827', fontFamily: 'monospace' }}>{fmt(cluster.clicks)}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right' as const, color: '#111827', fontFamily: 'monospace' }}>{cluster.leads}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right' as const, fontWeight: 600, color: changeColor(cluster.growth) }}>{changeLabel(cluster.growth)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Recommendations */}
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ margin: '24px 0' }}>
        <tbody>
          <tr>
            <td>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                Strategic Recommendations
              </h2>
              <table width="100%" cellPadding={0} cellSpacing={0}>
                <tbody>
                  {n.recommendations.map((rec, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px 0', verticalAlign: 'top', width: 28 }}>
                        <div style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: '#eef2ff',
                          color: '#4f46e5',
                          fontSize: 10,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center' as const,
                          lineHeight: '20px',
                        }}>
                          {i + 1}
                        </div>
                      </td>
                      <td style={{ padding: '8px 0 8px 8px', fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
                        {rec}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderTop: '1px solid #e5e7eb', marginTop: 24 }}>
        <tbody>
          <tr>
            <td style={{ padding: '16px 0', textAlign: 'center' as const }}>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                Generated by Tely.ai Content Intelligence | {report.periodLabel}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
