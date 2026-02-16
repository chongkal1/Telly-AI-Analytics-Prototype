'use client';

import { useState, useMemo } from 'react';
import { getContentIntelligence, IndustryContentGap } from '@/data/chart-data';
import { formatCurrency } from '@/lib/utils';

function CreateClusterButton({ gap }: { gap: IndustryContentGap }) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('create-cluster', {
      detail: {
        industry: gap.industry,
        message: `I'm planning to create a ${gap.industry} topical cluster.`,
      },
    }));
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors"
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      Create Cluster
    </button>
  );
}

type SortDirection = 'asc' | 'desc';

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  return (
    <span className="ml-1 inline-flex flex-col">
      <svg
        className={`h-2 w-2 ${active && direction === 'asc' ? 'text-emerald-600' : 'text-gray-400'}`}
        viewBox="0 0 8 4"
        fill="currentColor"
      >
        <path d="M4 0L8 4H0L4 0Z" />
      </svg>
      <svg
        className={`h-2 w-2 -mt-0.5 ${active && direction === 'desc' ? 'text-emerald-600' : 'text-gray-400'}`}
        viewBox="0 0 8 4"
        fill="currentColor"
      >
        <path d="M4 4L0 0H8L4 4Z" />
      </svg>
    </span>
  );
}

function useSort<T>(data: T[], defaultKey?: string) {
  const [sortKey, setSortKey] = useState<string | null>(defaultKey ?? null);
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const toggle = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      let cmp = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') cmp = aVal.localeCompare(bVal);
      else if (typeof aVal === 'number' && typeof bVal === 'number') cmp = aVal - bVal;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  return { sorted, sortKey, sortDir, toggle };
}

function Th({ label, colKey, align, sortKey, sortDir, onSort }: {
  label: string; colKey: string; align?: 'right';
  sortKey: string | null; sortDir: SortDirection; onSort: (k: string) => void;
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
      onClick={() => onSort(colKey)}
    >
      <span className="inline-flex items-center">
        {label}
        <SortIcon active={sortKey === colKey} direction={sortDir} />
      </span>
    </th>
  );
}

function CoverageBadge({ coverage }: { coverage: 'strong' | 'moderate' | 'weak' }) {
  const config = {
    strong: { label: 'Strong', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    moderate: { label: 'Moderate', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    weak: { label: 'Weak', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  }[coverage];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function ImpactBadge({ impact }: { impact: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { label: 'High Impact', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    medium: { label: 'Medium Impact', bg: 'bg-amber-50', text: 'text-amber-700' },
    low: { label: 'Low Impact', bg: 'bg-gray-100', text: 'text-gray-600' },
  }[impact];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

/* ── Overview table ── */

function IndustryTable({ data, onSelect }: { data: IndustryContentGap[]; onSelect: (industry: string) => void }) {
  const { sorted, sortKey, sortDir, toggle } = useSort(data, 'leadCount');

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <Th label="Industry" colKey="industry" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
            <Th label="Visitors" colKey="leadCount" align="right" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
            <Th label="% Share" colKey="leadPercentage" align="right" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
            <Th label="Pipeline Value" colKey="pipelineValue" align="right" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
            <Th label="Conv. Rate" colKey="conversionRate" align="right" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">Coverage</th>
            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Topics</th>
            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sorted.map((row) => (
            <tr
              key={row.industry}
              className="hover:bg-emerald-50 cursor-pointer transition-colors"
              onClick={() => onSelect(row.industry)}
            >
              <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{row.industry}</td>
              <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono whitespace-nowrap">{row.leadCount}</td>
              <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono whitespace-nowrap">{row.leadPercentage}%</td>
              <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono whitespace-nowrap">{formatCurrency(row.pipelineValue)}</td>
              <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono whitespace-nowrap">{(row.conversionRate * 100).toFixed(0)}%</td>
              <td className="px-4 py-3 whitespace-nowrap"><CoverageBadge coverage={row.contentCoverage} /></td>
              <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono whitespace-nowrap">{row.suggestedTopics.length}</td>
              <td className="px-4 py-3 text-center whitespace-nowrap">
                {row.contentCoverage !== 'strong' && <CreateClusterButton gap={row} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Detail view (drill-down) ── */

function IndustryDetail({ gap, onBack }: { gap: IndustryContentGap; onBack: () => void }) {
  const stats = [
    { label: 'Visitors', value: gap.leadCount.toString() },
    { label: 'Pipeline Value', value: formatCurrency(gap.pipelineValue) },
    { label: 'Conversion Rate', value: `${(gap.conversionRate * 100).toFixed(0)}%` },
    { label: 'Pages Visited', value: gap.topPages.length.toString() },
  ];

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Industries
      </button>

      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-base font-semibold text-gray-900">{gap.industry}</h2>
        <CoverageBadge coverage={gap.contentCoverage} />
        {gap.contentCoverage !== 'strong' && <CreateClusterButton gap={gap} />}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
            <dt className="text-xs font-medium text-gray-500">{s.label}</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900 font-mono">{s.value}</dd>
          </div>
        ))}
      </div>

      {/* Content Coverage */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Content Coverage</h3>
        {gap.matchingCategories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {gap.matchingCategories.map((cat) => (
              <span key={cat} className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {cat}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-red-600 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            No matching content — major opportunity gap
          </p>
        )}
      </div>

      {/* Top Pages Visited */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Top Pages Visited</h3>
        <div className="space-y-1.5">
          {gap.topPages.map((url) => (
            <div key={url} className="text-sm text-gray-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
              <span className="font-mono text-xs">{url}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Topics */}
      {gap.suggestedTopics.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-900">Suggested Topics</h3>
          </div>
          <div className="space-y-3">
            {gap.suggestedTopics.map((topic, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-sm font-semibold text-gray-900">{topic.title}</h4>
                  <ImpactBadge impact={topic.estimatedImpact} />
                </div>
                <div className="mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700">
                    {topic.targetCategory}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-2">{topic.rationale}</p>
                <div className="flex flex-wrap gap-1.5">
                  {topic.keywords.map((kw) => (
                    <span key={kw} className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main component ── */

export function ContentIntelligencePanel() {
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const data = useMemo(() => getContentIntelligence(), []);

  const selected = selectedIndustry ? data.find((d) => d.industry === selectedIndustry) : null;

  if (selected) {
    return <IndustryDetail gap={selected} onBack={() => setSelectedIndustry(null)} />;
  }

  return <IndustryTable data={data} onSelect={setSelectedIndustry} />;
}
