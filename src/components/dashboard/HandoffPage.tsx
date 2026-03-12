'use client';

import { useState } from 'react';
import { handoffSections, HandoffComponent } from '@/data/handoff-content';

/* ── Live component imports ── */
import { MaturityStageSwitcher } from './MaturityStageSwitcher';
import { AgentMissionControl } from './AgentMissionControl';
import { ContentFunnel } from './traffic/ContentFunnel';
import { VisitorIndustrySummary } from './VisitorIndustrySummary';
import { UnifiedTrafficTrend } from './traffic/UnifiedTrafficTrend';
import { TopPages } from './traffic/TopMovers';
import { GeographySection } from './traffic/GeographySection';
import { NewTopicOpportunities } from './NewTopicOpportunities';
import { IdentifiedVisitorsTable } from './leads/IdentifiedVisitorsTable';
import { ConversationPage, AgentRulesPanel, LeadInfoPanel } from './leads/ConversationPage';
import { leads } from '@/data/leads';
import { ReportList } from './reports/ReportList';
import { ReportEmailTemplate } from './reports/ReportEmailTemplate';
import { ReportSection } from './reports/ReportSection';
import { ReportNarrative } from './reports/ReportNarrative';
import { TrendIndicator } from '@/components/shared/TrendIndicator';
import { getAllReports, getReport } from '@/data/reports';
import { DateRangePicker } from './DateRangePicker';
import { ChatPanel } from '../chat/ChatPanel';
import { CommandList } from '../chat/CommandList';
import { MetricCard } from '@/components/shared/MetricCard';
import { PieChartWidget } from '@/components/charts/PieChartWidget';
import { getContentFunnelData, getAgentGoalData, getContentProductionInsights, getClusterData, getMetricValue, getAllPagesOverview, getChartData } from '@/data/chart-data';
import { getGeographicData } from '@/data/geography';


/* ── Inline KPI card (mirrors PrimaryCard from DashboardSummary) ── */

function HandoffPrimaryCard({ label, value, subtitle, accentColor, chartContent }: {
  label: string; value: string; subtitle?: string; accentColor: string; chartContent?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[14px] border border-surface-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }} />
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="text-sm font-medium text-surface-500">{label}</span>
        </div>
        <p className="text-3xl font-bold text-surface-900 font-mono tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-surface-400 mt-1 font-mono">{subtitle}</p>}
      </div>
      {chartContent && <div className="px-5 pb-4">{chartContent}</div>}
    </div>
  );
}

/* ── Live KPI card wrappers (use real data from hooks) ── */

function LiveRoasCard() {
  const funnelData = getContentFunnelData();
  const identified = funnelData.find(s => s.stage === 'Identified Visitors')?.count ?? 0;
  const dealSize = 500;
  const totalLeadValue = identified * dealSize;
  const cost = 1000;
  const roas = Math.round(totalLeadValue / cost);

  return (
    <HandoffPrimaryCard
      label="ROAS" value={`${roas}x`}
      subtitle={`$${Math.round(totalLeadValue / 1000)}K pipeline / $${cost / 1000}K cost`}
      accentColor="#4f46e5"
      chartContent={
        <div>
          <div className="relative h-6 rounded-full overflow-hidden bg-surface-100">
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min((totalLeadValue / (totalLeadValue + cost)) * 100, 99)}%`, background: 'linear-gradient(90deg, #4f46e5, #818cf8)' }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] font-mono text-surface-400">Cost: ${cost / 1000}K</span>
            <span className="text-[10px] font-mono text-indigo-400">Pipeline: ${Math.round(totalLeadValue / 1000)}K</span>
          </div>
        </div>
      }
    />
  );
}

function LiveOrganicLeadsCard() {
  const funnelData = getContentFunnelData();
  const identified = funnelData.find(s => s.stage === 'Identified Visitors')?.count ?? 0;
  const contacted = funnelData.find(s => s.stage === 'Contacted Leads')?.count ?? 0;
  const captured = funnelData.find(s => s.stage === 'Captured Leads')?.count ?? 0;
  const total = identified;
  const segments = [
    { key: 'identified', label: 'Identified', count: identified, color: '#00C5DF' },
    { key: 'contacted', label: 'Contacted', count: contacted, color: '#33D4EB' },
    { key: 'captured', label: 'Captured', count: captured, color: '#80E3F3' },
  ];

  return (
    <HandoffPrimaryCard
      label="Organic Leads" value={total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total.toString()}
      accentColor="#00C5DF"
      chartContent={
        <div>
          <div className="flex h-5 rounded-full overflow-hidden">
            {segments.map(s => (
              <div key={s.key} style={{ width: total > 0 ? `${(s.count / total) * 100}%` : '33%', backgroundColor: s.color }} />
            ))}
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {segments.map(s => (
              <div key={s.key} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[10px] font-mono text-surface-400">{s.label} {s.count}</span>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}

function LivePipelineCard() {
  const funnelData = getContentFunnelData();
  const identified = funnelData.find(s => s.stage === 'Identified Visitors')?.count ?? 0;
  const dealSize = 500;
  const pipeline = identified * dealSize;

  return (
    <HandoffPrimaryCard
      label="Pipeline Value" value={`$${Math.round(pipeline / 1000)}K`}
      accentColor="#f59e0b"
      chartContent={
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-surface-400 font-mono">{identified} leads &times; ${dealSize}</span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md">Edit Deal Size</span>
        </div>
      }
    />
  );
}

/* ── Leads pie with toggle ── */
function LiveLeadsPie() {
  const [mode, setMode] = useState<'industry' | 'topic'>('industry');
  const byIndustry = getChartData('leadsByIndustry') as { name: string; value: number }[];
  // group by topic (sourceUrl → category)
  const byTopic = (() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => {
      // simple fallback: use industry if pages unavailable
      counts[l.industry] = (counts[l.industry] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  })();
  const data = mode === 'industry' ? byIndustry : byTopic;
  const label = mode === 'industry' ? 'Leads by Industry' : 'Leads by Topic';

  return (
    <div className="bg-white rounded-[14px] border border-surface-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-surface-900">{label}</h3>
        <div className="inline-flex rounded-md border border-surface-200 bg-surface-50 p-0.5 text-xs">
          <button onClick={() => setMode('industry')} className={`px-2.5 py-1 rounded transition-colors ${mode === 'industry' ? 'bg-white text-surface-900 shadow-sm font-medium' : 'text-surface-500 hover:text-surface-700'}`}>By Industry</button>
          <button onClick={() => setMode('topic')} className={`px-2.5 py-1 rounded transition-colors ${mode === 'topic' ? 'bg-white text-surface-900 shadow-sm font-medium' : 'text-surface-500 hover:text-surface-700'}`}>By Topic</button>
        </div>
      </div>
      <PieChartWidget data={data} height={260} />
    </div>
  );
}

/* ── Map component IDs to live renders ── */

const LIVE_COMPONENTS: Record<string, React.ReactNode> = {
  'roas-card': <LiveRoasCard />,
  'organic-leads-card': <LiveOrganicLeadsCard />,
  'pipeline-value-card': <LivePipelineCard />,
  'maturity-stage-switcher': <MaturityStageSwitcher />,
  'agent-mission-control': (() => {
    const clusters = getClusterData();
    const insights = getContentProductionInsights(clusters);
    const goal = getAgentGoalData();
    return <AgentMissionControl insights={insights} goal={goal} />;
  })(),
  'content-funnel': <ContentFunnel data={getContentFunnelData()} />,
  'visitor-industry-summary': <VisitorIndustrySummary />,
  'metric-articles-published': <MetricCard label="Articles Published" value={getMetricValue('totalArticles').value} change={getMetricValue('totalArticles').change} />,
  'metric-content-pieces': <MetricCard label="Total Content Pieces" value={getMetricValue('totalContentPieces').value} change={getMetricValue('totalContentPieces').change} />,
  'metric-organic-clicks': <MetricCard label="Total Organic Clicks" value={getMetricValue('totalClicks').value} change={getMetricValue('totalClicks').change} />,
  'metric-impressions': <MetricCard label="Total Impressions" value={getMetricValue('totalImpressions').value} change={getMetricValue('totalImpressions').change} />,
  'metric-ctr': <MetricCard label="Avg. CTR" value={getMetricValue('avgCtr').value} change={getMetricValue('avgCtr').change} />,
  'metric-leads': <MetricCard label="Leads Generated" value={getMetricValue('leadsGenerated').value} change={getMetricValue('leadsGenerated').change} />,
  'unified-traffic-trend': <UnifiedTrafficTrend />,
  'traffic-by-engine': (() => {
    const aiEngines = getChartData('aiEngineBreakdown') as { name: string; value: number }[];
    const totalAI = aiEngines.reduce((s, e) => s + e.value, 0);
    const data = [
      { name: 'Google', value: Math.round(totalAI * 4.2) },
      { name: 'Bing', value: Math.round(totalAI * 0.45) },
      { name: 'DuckDuckGo', value: Math.round(totalAI * 0.08) },
      { name: 'Yahoo', value: Math.round(totalAI * 0.12) },
      ...aiEngines,
    ];
    return (
      <div className="bg-white rounded-[14px] border border-surface-200 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-surface-900 mb-2">Traffic by Engine</h3>
        <PieChartWidget data={data} height={260} />
      </div>
    );
  })(),
  'top-pages': <TopPages pages={getAllPagesOverview()} />,
  'geography-section': <GeographySection data={getGeographicData()} />,
  'content-funnel-topics': <ContentFunnel data={getContentFunnelData()} />,
  'new-topic-opportunities': <NewTopicOpportunities />,
  'metric-identified-visitors': <MetricCard label="Leads Identified" value={getMetricValue('identifiedVisitors').value} change={getMetricValue('identifiedVisitors').change} />,
  'metric-leads-contacted': <MetricCard label="Leads Contacted" value={getMetricValue('leadsContacted').value} change={getMetricValue('leadsContacted').change} />,
  'metric-organic-leads-captured': <MetricCard label="Leads Captured" value={getMetricValue('organicLeadsCaptured').value} change={getMetricValue('organicLeadsCaptured').change} />,
  'leads-pipeline-value': (() => {
    const captured = leads.filter(l => ['contacted', 'qualified', 'converted'].includes(l.status)).length;
    const dealSize = 500;
    const pipeline = captured * dealSize;
    return (
      <div className="bg-white rounded-lg border border-surface-200 shadow-sm p-4">
        <dt className="text-sm font-medium text-surface-500">Pipeline Value</dt>
        <dd className="mt-1 text-2xl font-semibold font-mono text-surface-900">${Math.round(pipeline / 1000)}K</dd>
        <div className="mt-2 text-[11px] text-surface-400 font-mono">{captured} leads &times; ${dealSize}</div>
      </div>
    );
  })(),
  'leads-by-industry': <LiveLeadsPie />,
  'leads-table': <IdentifiedVisitorsTable visitors={leads} connectedCrm={null} onConnectCrm={() => {}} onManageCrm={() => {}} />,
  'conversation-thread': (() => {
    const sampleLead = leads.find(l => l.status === 'captured') || leads[0];
    return (
      <div className="h-[600px] border border-surface-200 rounded-xl overflow-hidden">
        <ConversationPage lead={sampleLead} onBack={() => {}} />
      </div>
    );
  })(),
  'agent-rules-panel': (() => {
    const sampleLead = leads.find(l => l.status === 'captured') || leads[0];
    return (
      <div className="h-[450px] border border-surface-200 rounded-xl overflow-hidden bg-white">
        <AgentRulesPanel lead={sampleLead} />
      </div>
    );
  })(),
  'lead-info-panel': (() => {
    const sampleLead = leads.find(l => l.status === 'captured') || leads[0];
    return (
      <div className="h-[500px] border border-surface-200 rounded-xl overflow-hidden bg-white">
        <LeadInfoPanel lead={sampleLead} />
      </div>
    );
  })(),
  'report-list': <ReportList reports={getAllReports()} onSelect={() => {}} />,
  ...(() => {
    const r = getReport(getAllReports()[0]?.id);
    if (!r) return {};
    const { snapshot: s, comparison: c, narrative: n } = r;
    const fmt = (v: number) => v.toLocaleString();
    const fmtUsd = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
    const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;
    const KPI = ({ label, value, change }: { label: string; value: string; change?: number }) => (
      <div className="bg-surface-50 rounded-lg p-3">
        <p className="text-[10px] text-surface-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-xl font-bold text-surface-900 font-mono">{value}</p>
        {change !== undefined && <div className="mt-1"><TrendIndicator change={change} /></div>}
      </div>
    );
    const STATUS_COLORS: Record<string, string> = { Converted: '#00C5DF', Qualified: '#33D4EB', Contacted: '#80E3F3', New: '#B3EEF7' };
    const totalStatusLeads = s.leadsByStatus.reduce((sum, d) => sum + d.value, 0);

    return {
      'report-executive-summary': (
        <ReportSection title="Executive Summary">
          <ReportNarrative text={n.executiveSummary} />
        </ReportSection>
      ),
      'report-traffic-overview': (
        <ReportSection title="Traffic Overview">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <KPI label="Clicks" value={fmt(s.totalClicks)} change={c.clicks} />
            <KPI label="Impressions" value={fmt(s.totalImpressions)} change={c.impressions} />
            <KPI label="CTR" value={fmtPct(s.avgCtr)} change={c.ctr} />
          </div>
          <ReportNarrative text={n.trafficAnalysis} />
        </ReportSection>
      ),
      'report-traffic-by-source': (
        <ReportSection title="Traffic by Source">
          <div className="space-y-2 mb-4">
            {s.trafficBySource.map((src) => (
              <div key={src.name} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: src.color }} />
                <span className="text-sm text-surface-700 w-24">{src.name}</span>
                <div className="flex-1 bg-surface-100 rounded-full h-4 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(src.clicks / Math.max(...s.trafficBySource.map(x => x.clicks))) * 100}%`, backgroundColor: src.color }} />
                </div>
                <span className="text-sm font-mono text-surface-900 w-16 text-right">{fmt(src.clicks)}</span>
                <TrendIndicator change={src.change} />
              </div>
            ))}
          </div>
          <ReportNarrative text={n.trafficBySourceAnalysis} />
        </ReportSection>
      ),
      'report-cluster-performance': (
        <ReportSection title="Topical Cluster Performance">
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left py-2 pr-4 text-[10px] font-semibold text-surface-400 uppercase">Cluster</th>
                  <th className="text-right py-2 px-2 text-[10px] font-semibold text-surface-400 uppercase">Pages</th>
                  <th className="text-right py-2 px-2 text-[10px] font-semibold text-surface-400 uppercase">Clicks</th>
                  <th className="text-right py-2 px-2 text-[10px] font-semibold text-surface-400 uppercase">Leads</th>
                  <th className="text-right py-2 pl-2 text-[10px] font-semibold text-surface-400 uppercase">Growth</th>
                </tr>
              </thead>
              <tbody>
                {s.clusterPerformance.map((cl) => (
                  <tr key={cl.category} className="border-b border-surface-50">
                    <td className="py-2 pr-4 font-medium text-surface-900">{cl.category}</td>
                    <td className="py-2 px-2 text-right text-surface-600 font-mono">{cl.pages}</td>
                    <td className="py-2 px-2 text-right text-surface-900 font-mono">{fmt(cl.clicks)}</td>
                    <td className="py-2 px-2 text-right text-surface-900 font-mono">{cl.leads}</td>
                    <td className="py-2 pl-2 text-right"><TrendIndicator change={cl.growth} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ReportNarrative text={n.clusterAnalysis} />
        </ReportSection>
      ),
      'report-lead-generation': (
        <ReportSection title="Lead Generation">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <KPI label="Identified Visitors" value={fmt(s.identifiedVisitors)} change={c.visitors} />
            <KPI label="Captured Leads" value={fmt(s.capturedLeads)} change={c.leads} />
            <KPI label="Pipeline Value" value={fmtUsd(s.pipelineValue)} change={c.pipeline} />
          </div>
          <div className="mb-4">
            <p className="text-[10px] text-surface-400 uppercase tracking-wider font-semibold mb-2">Leads by Status</p>
            <div className="flex h-5 rounded-full overflow-hidden">
              {s.leadsByStatus.map((seg) => (
                <div key={seg.name} style={{ width: totalStatusLeads > 0 ? `${(seg.value / totalStatusLeads) * 100}%` : '25%', backgroundColor: STATUS_COLORS[seg.name] || '#d1d5db' }} />
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
          <ReportNarrative text={n.leadsAnalysis} />
        </ReportSection>
      ),
      'report-roas': (
        <ReportSection title="Content ROAS">
          <div className="grid grid-cols-4 gap-3 mb-4">
            <KPI label="Monthly Cost" value={fmtUsd(s.monthlyCost)} />
            <KPI label="Pipeline" value={fmtUsd(s.pipelineValue)} change={c.pipeline} />
            <KPI label="ROAS" value={`${s.roas}x`} change={c.roas} />
            <KPI label="Cost / Lead" value={fmtUsd(s.costPerLead)} />
          </div>
          <div className="relative h-6 rounded-full overflow-hidden bg-surface-100">
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min((s.pipelineValue / (s.pipelineValue + s.monthlyCost)) * 100, 99)}%`, background: 'linear-gradient(90deg, #4f46e5, #818cf8)' }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] font-mono text-surface-400">Cost: {fmtUsd(s.monthlyCost)}</span>
            <span className="text-[10px] font-mono text-indigo-400">Pipeline: {fmtUsd(s.pipelineValue)}</span>
          </div>
        </ReportSection>
      ),
      'report-agent-actions': (
        <ReportSection title="Agent Actions">
          <div className="grid grid-cols-2 gap-3">
            {s.clusterActions.map((ca) => {
              const colors: Record<string, { bg: string; text: string; border: string }> = {
                'Scale Production': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
                'Update Content': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
                'Delete & Merge': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
                'Publish & Monitor': { bg: 'bg-surface-50', text: 'text-surface-600', border: 'border-surface-200' },
              };
              const c2 = colors[ca.action] || colors['Publish & Monitor'];
              return (
                <div key={ca.category} className={`rounded-lg border ${c2.border} p-3`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-surface-900">{ca.category}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c2.bg} ${c2.text}`}>{ca.status}</span>
                  </div>
                  <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded ${c2.bg} ${c2.text} mb-1`}>{ca.action}</span>
                  <p className="text-xs text-surface-500 leading-relaxed">{ca.summary}</p>
                </div>
              );
            })}
          </div>
        </ReportSection>
      ),
      'report-email-template': (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-6 max-w-[650px]">
          <ReportEmailTemplate report={r} />
        </div>
      ),
    };
  })(),
  'date-range': <DateRangePicker />,
  'chat-panel': (
    <div className="w-[380px] h-[600px] border border-surface-200 rounded-xl overflow-hidden">
      <ChatPanel />
    </div>
  ),
  'use-chat': (
    <div className="w-[380px] border border-surface-200 rounded-xl overflow-hidden bg-white">
      {/* Static slash command list preview */}
      <div className="p-3 border-b border-surface-100">
        <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Slash Commands Preview</p>
      </div>
      <div className="relative">
        <CommandList onCommand={() => {}} filter="" />
      </div>
      {/* Input with "/" typed */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-surface-200 bg-white">
        <div className="flex-1 px-4 py-2.5 text-sm bg-surface-50 border border-surface-200 rounded-full flex items-center">
          <span className="text-[#00C5DF] font-mono">/</span>
          <span className="ml-0.5 w-[2px] h-4 bg-surface-900 animate-pulse" />
        </div>
        <div className="h-9 w-9 rounded-full bg-surface-900 text-white flex items-center justify-center opacity-30">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </div>
      </div>
    </div>
  ),
};

/* ── Component Card (always open) ── */

function ComponentCard({ component }: { component: HandoffComponent }) {
  const liveComponent = LIVE_COMPONENTS[component.id];

  return (
    <div className="border border-surface-200 rounded-xl bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-100">
        <span className="shrink-0 w-2 h-2 rounded-full bg-indigo-400" />
        <span className="font-semibold text-sm text-surface-900">{component.name}</span>
      </div>

      <div className="px-5 pb-5 space-y-4">
        {/* Live component preview */}
        {liveComponent && (
          <div className="pt-4">
            <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Компонент</h4>
            <div className="rounded-xl border border-dashed border-indigo-200 bg-surface-50/50 p-4 overflow-visible">
              {liveComponent}
            </div>
          </div>
        )}

        {/* Purpose */}
        <div className={liveComponent ? '' : 'pt-4'}>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Что это?</h4>
          <p className="text-sm text-surface-700 leading-relaxed">{component.purpose}</p>
        </div>

        {/* Logic */}
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Логика работы</h4>
          <pre className="text-[13px] text-surface-700 leading-relaxed whitespace-pre-wrap font-sans bg-surface-50 rounded-lg p-3 border border-surface-100">
            {component.logic}
          </pre>
        </div>

        {/* Data Source */}
        {component.dataSource && (
          <div>
            <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Источник данных</h4>
            <pre className="text-[13px] text-surface-700 leading-relaxed whitespace-pre-wrap font-sans bg-amber-50 rounded-lg p-3 border border-amber-200">
              {component.dataSource}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}

/* ── Section Content ── */

function SectionContent({ section }: { section: { id: string; title: string; description: string; components: HandoffComponent[] } }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-1">{section.title}</h2>
      <p className="text-sm text-surface-500 mb-5">{section.description}</p>
      <div className="space-y-5">
        {section.components.map((comp) => (
          <ComponentCard key={comp.id} component={comp} />
        ))}
      </div>
    </div>
  );
}

/* ── Main HandoffPage ── */

export function HandoffPage() {
  const [activeSectionId, setActiveSectionId] = useState(handoffSections[0].id);
  const activeSection = handoffSections.find((s) => s.id === activeSectionId) ?? handoffSections[0];

  return (
    <div>
      {/* DevMode Only banner */}
      <div className="mb-4 -mt-2 rounded-xl border border-dashed border-violet-300 bg-violet-50/60 px-4 py-2.5 flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-violet-200/60 text-violet-700">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">DevMode Only</span>
        </div>
        <span className="text-xs text-violet-700/70">Handoff-документация для разработки — покомпонентное описание логики и интерфейсов</span>
      </div>

      <div className="flex gap-6 min-h-0">
        {/* Left nav */}
        <nav className="w-48 shrink-0 space-y-0.5 sticky top-6 self-start">
          <div className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2 px-3">
            Разделы
          </div>
          {handoffSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSectionId === section.id
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-surface-600 hover:bg-surface-100 hover:text-surface-800'
              }`}
            >
              {section.title}
            </button>
          ))}
        </nav>

        {/* Right content */}
        <div className="flex-1 min-w-0">
          <SectionContent section={activeSection} />
        </div>
      </div>
    </div>
  );
}
