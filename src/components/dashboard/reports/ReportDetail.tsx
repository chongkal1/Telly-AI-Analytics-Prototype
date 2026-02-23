'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { MonthlyReport } from '@/types';
import { TrendIndicator } from '@/components/shared/TrendIndicator';
import { CHART_COLOR_ARRAY } from '@/lib/constants';
import { ReportSection } from './ReportSection';
import { ReportNarrative } from './ReportNarrative';
import { ReportEmailTemplate } from './ReportEmailTemplate';

interface ReportDetailProps {
  report: MonthlyReport;
  onBack: () => void;
}

const fmt = (n: number) => n.toLocaleString();
const fmtUsd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

function KpiCard({ label, value, change }: { label: string; value: string; change?: number }) {
  return (
    <div className="bg-surface-50 rounded-lg p-3">
      <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-xl font-bold text-surface-900 font-mono">{value}</p>
      {change !== undefined && (
        <div className="mt-1">
          <TrendIndicator change={change} />
        </div>
      )}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  Converted: '#00C5DF',
  Qualified: '#33D4EB',
  Contacted: '#80E3F3',
  New: '#B3EEF7',
};

export function ReportDetail({ report, onBack }: ReportDetailProps) {
  const [showEmail, setShowEmail] = useState(false);
  const [fullPage, setFullPage] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('fullpage') === '1') setFullPage(true);
  }, []);

  const { snapshot: s, comparison: c, narrative: n } = report;

  const totalStatusLeads = s.leadsByStatus.reduce((sum, d) => sum + d.value, 0);

  return (
    <>
      <div className="max-w-[900px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-900 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All Reports
          </button>
          <button
            onClick={() => setShowEmail(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Preview Email
          </button>
        </div>

        {/* Title block */}
        <div className="bg-white rounded-[14px] border border-surface-200 shadow-card p-6">
          <p className="text-xs text-surface-400 font-medium uppercase tracking-wider mb-1">{report.periodLabel}</p>
          <h2 className="text-xl font-bold text-surface-900 mb-1">{report.title}</h2>
          <p className="text-xs text-surface-400">
            Generated {new Date(report.generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {' '}| Period: {new Date(report.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' '}&ndash; {new Date(report.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* 1. Executive Summary */}
        <ReportSection title="Executive Summary">
          <ReportNarrative text={n.executiveSummary} />
        </ReportSection>

        {/* 2. Traffic Overview */}
        <ReportSection title="Traffic Overview">
          <div className="grid grid-cols-3 gap-3 mb-5">
            <KpiCard label="Clicks" value={fmt(s.totalClicks)} change={c.clicks} />
            <KpiCard label="Impressions" value={fmt(s.totalImpressions)} change={c.impressions} />
            <KpiCard label="CTR" value={fmtPct(s.avgCtr)} change={c.ctr} />
          </div>

          <div className="h-48 mb-5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.dailyTraffic}>
                <defs>
                  <linearGradient id="reportClicksGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  labelFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  formatter={(v: number | undefined) => [fmt(v ?? 0), 'Clicks']}
                />
                <Area type="monotone" dataKey="clicks" stroke="#4f46e5" strokeWidth={2} fill="url(#reportClicksGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <ReportNarrative text={n.trafficAnalysis} />
        </ReportSection>

        {/* 3. AI Visibility */}
        <ReportSection title="AI Visibility">
          <div className="grid grid-cols-4 gap-3 mb-5">
            <KpiCard label="Citations" value={fmt(s.aiCitations)} change={c.aiCitations} />
            <KpiCard label="Appearances" value={fmt(s.aiAppearances)} />
            <KpiCard label="Visibility" value={`${s.aiVisibilityScore}%`} change={c.aiVisibility} />
            <KpiCard label="Sentiment" value={`${s.aiSentiment}/100`} />
          </div>

          <div className="flex items-center justify-center mb-5">
            <div className="w-56 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={s.aiEngineBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {s.aiEngineBreakdown.map((_, i) => (
                      <Cell key={i} fill={CHART_COLOR_ARRAY[i % CHART_COLOR_ARRAY.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number | undefined) => [fmt(v ?? 0), 'Citations']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <ReportNarrative text={n.aiVisibilityAnalysis} />
        </ReportSection>

        {/* 4. Topical Cluster Performance */}
        <ReportSection title="Topical Cluster Performance">
          <div className="overflow-x-auto mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left py-2 pr-4 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Cluster</th>
                  <th className="text-right py-2 px-2 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Pages</th>
                  <th className="text-right py-2 px-2 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Clicks</th>
                  <th className="text-right py-2 px-2 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Impr.</th>
                  <th className="text-right py-2 px-2 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">CTR</th>
                  <th className="text-right py-2 px-2 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Leads</th>
                  <th className="text-right py-2 pl-2 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Growth</th>
                </tr>
              </thead>
              <tbody>
                {s.clusterPerformance.map((cluster) => (
                  <tr key={cluster.category} className="border-b border-surface-50 last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-surface-900">{cluster.category}</td>
                    <td className="py-2.5 px-2 text-right text-surface-600 font-mono">{cluster.pages}</td>
                    <td className="py-2.5 px-2 text-right text-surface-900 font-mono">{fmt(cluster.clicks)}</td>
                    <td className="py-2.5 px-2 text-right text-surface-600 font-mono">{fmt(cluster.impressions)}</td>
                    <td className="py-2.5 px-2 text-right text-surface-600 font-mono">{fmtPct(cluster.ctr)}</td>
                    <td className="py-2.5 px-2 text-right text-surface-900 font-mono">{cluster.leads}</td>
                    <td className="py-2.5 pl-2 text-right">
                      <TrendIndicator change={cluster.growth} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ReportNarrative text={n.clusterAnalysis} />
        </ReportSection>

        {/* 5. Lead Generation */}
        <ReportSection title="Lead Generation">
          <div className="grid grid-cols-3 gap-3 mb-5">
            <KpiCard label="Identified Visitors" value={fmt(s.identifiedVisitors)} change={c.visitors} />
            <KpiCard label="Captured Leads" value={fmt(s.capturedLeads)} change={c.leads} />
            <KpiCard label="Pipeline Value" value={fmtUsd(s.pipelineValue)} change={c.pipeline} />
          </div>

          {/* Lead status bar */}
          <div className="mb-5">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider font-semibold mb-2">Leads by Status</p>
            <div className="flex h-5 rounded-full overflow-hidden">
              {s.leadsByStatus.map((seg) => (
                <div
                  key={seg.name}
                  className="transition-all duration-500"
                  style={{
                    width: totalStatusLeads > 0 ? `${(seg.value / totalStatusLeads) * 100}%` : '25%',
                    backgroundColor: STATUS_COLORS[seg.name] || '#d1d5db',
                  }}
                />
              ))}
            </div>
            <div className="flex gap-4 mt-2">
              {s.leadsByStatus.map((seg) => (
                <div key={seg.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[seg.name] || '#d1d5db' }} />
                  <span className="text-[10px] text-surface-500">{seg.name} ({seg.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Industry breakdown */}
          <div className="mb-5">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider font-semibold mb-2">Leads by Industry</p>
            <div className="space-y-1.5">
              {s.leadsByIndustry.map((ind) => {
                const maxVal = Math.max(...s.leadsByIndustry.map((d) => d.value));
                return (
                  <div key={ind.name} className="flex items-center gap-3">
                    <span className="text-xs text-surface-600 w-24 shrink-0">{ind.name}</span>
                    <div className="flex-1 bg-surface-100 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-400 transition-all duration-500"
                        style={{ width: `${(ind.value / maxVal) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-surface-900 w-6 text-right">{ind.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top leads table */}
          <div className="mb-5">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider font-semibold mb-2">Notable Leads</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left py-2 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Name</th>
                  <th className="text-left py-2 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Company</th>
                  <th className="text-left py-2 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Industry</th>
                  <th className="text-right py-2 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Value</th>
                  <th className="text-right py-2 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {s.topLeads.map((lead) => (
                  <tr key={lead.name} className="border-b border-surface-50 last:border-0">
                    <td className="py-2 text-surface-900 font-medium">{lead.name}</td>
                    <td className="py-2 text-surface-600">{lead.company}</td>
                    <td className="py-2 text-surface-600">{lead.industry}</td>
                    <td className="py-2 text-right font-mono text-surface-900">{fmtUsd(lead.value)}</td>
                    <td className="py-2 text-right">
                      <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        lead.status === 'converted' ? 'bg-green-100 text-green-700' :
                        lead.status === 'qualified' ? 'bg-blue-100 text-blue-700' :
                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-surface-100 text-surface-600'
                      }`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ReportNarrative text={n.leadsAnalysis} />
        </ReportSection>

        {/* 6. ROAS */}
        <ReportSection title="Content ROAS">
          <div className="grid grid-cols-4 gap-3 mb-5">
            <KpiCard label="Monthly Cost" value={fmtUsd(s.monthlyCost)} />
            <KpiCard label="Pipeline" value={fmtUsd(s.pipelineValue)} change={c.pipeline} />
            <KpiCard label="ROAS" value={`${s.roas}x`} change={c.roas} />
            <KpiCard label="Cost / Lead" value={fmtUsd(s.costPerLead)} />
          </div>

          {/* ROAS ratio bar */}
          <div className="mb-2">
            <div className="relative h-6 rounded-full overflow-hidden bg-surface-100">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${Math.min((s.pipelineValue / (s.pipelineValue + s.monthlyCost)) * 100, 99)}%`,
                  background: 'linear-gradient(90deg, #4f46e5, #818cf8)',
                }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-l-full bg-surface-300"
                style={{
                  width: `${Math.max((s.monthlyCost / (s.pipelineValue + s.monthlyCost)) * 100, 1)}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] font-mono text-surface-400">Cost: {fmtUsd(s.monthlyCost)}</span>
              <span className="text-[10px] font-mono text-indigo-400">Pipeline: {fmtUsd(s.pipelineValue)}</span>
            </div>
          </div>
        </ReportSection>

        {/* 7. Strategic Recommendations */}
        <ReportSection title="Strategic Recommendations">
          <ul className="space-y-3">
            {n.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 text-sm text-surface-700">
                <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </ReportSection>
      </div>

      {/* Email preview modal */}
      {showEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowEmail(false)}>
          <div
            className="bg-white rounded-xl shadow-2xl w-[700px] max-h-[90vh] overflow-y-auto m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-surface-200 sticky top-0 bg-white rounded-t-xl z-10">
              <h3 className="text-sm font-semibold text-surface-900">Email Preview</h3>
              <button onClick={() => setShowEmail(false)} className="text-surface-400 hover:text-surface-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <ReportEmailTemplate report={report} />
            </div>
          </div>
        </div>
      )}

      {/* Full-page email render for Figma capture (no modal overlay) */}
      {fullPage && (
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow-2xl w-[700px] mx-auto">
            <div className="flex items-center justify-between p-4 border-b border-surface-200 bg-white rounded-t-xl">
              <h3 className="text-sm font-semibold text-surface-900">Email Preview</h3>
            </div>
            <div className="p-6">
              <ReportEmailTemplate report={report} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
