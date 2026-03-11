'use client';

import React, { useState, useMemo } from 'react';
import { AIPageCitation } from '@/data/ai-analytics';
import { TrendIndicator } from '@/components/shared/TrendIndicator';

const PAGE_SIZE_OPTIONS = [10, 50, 100, 200, 500];

type SortDirection = 'asc' | 'desc';

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  return (
    <span className="ml-1 inline-flex flex-col">
      <svg className={`h-2 w-2 ${active && direction === 'asc' ? 'text-indigo-600' : 'text-surface-400'}`} viewBox="0 0 8 4" fill="currentColor">
        <path d="M4 0L8 4H0L4 0Z" />
      </svg>
      <svg className={`h-2 w-2 -mt-0.5 ${active && direction === 'desc' ? 'text-indigo-600' : 'text-surface-400'}`} viewBox="0 0 8 4" fill="currentColor">
        <path d="M4 4L0 0H8L4 4Z" />
      </svg>
    </span>
  );
}

function DistributionBar({ citations, clicks, maxCitations }: { citations: number; clicks: number; maxCitations: number }) {
  const citationWidth = maxCitations > 0 ? (citations / maxCitations) * 100 : 0;
  const clickWidth = maxCitations > 0 ? (clicks / maxCitations) * 100 : 0;

  return (
    <div className="w-28 space-y-1">
      <div className="flex items-center gap-1.5">
        <div className="w-16 h-1.5 bg-surface-100 rounded-full overflow-hidden">
          <div className="h-full bg-purple-400 rounded-full" style={{ width: `${citationWidth}%` }} />
        </div>
        <span className="text-[10px] text-purple-600 tabular-nums">{citations} cit.</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-16 h-1.5 bg-surface-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-400 rounded-full" style={{ width: `${clickWidth}%` }} />
        </div>
        <span className="text-[10px] text-blue-600 tabular-nums">{clicks} clicks</span>
      </div>
    </div>
  );
}

interface AIPageVisibilityProps {
  data: AIPageCitation[];
  onPageClick?: (pageId: string) => void;
}

export function AIPageVisibility({ data, onPageClick }: AIPageVisibilityProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string>('totalCitations');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const [showFilters, setShowFilters] = useState(false);
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const [rangeFilters, setRangeFilters] = useState<Record<string, { from: string; to: string }>>({});

  const updateColFilter = (key: string, value: string) => {
    setColFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const updateRangeFilter = (key: string, bound: 'from' | 'to', value: string) => {
    setRangeFilters((prev) => ({ ...prev, [key]: { ...prev[key], [bound]: value } }));
    setCurrentPage(1);
  };

  const NUMERIC_KEYS = new Set(['totalCitations', 'aiClicks', 'leads', 'change']);

  const hasActiveFilters = search || Object.values(colFilters).some(v => v) || Object.values(rangeFilters).some(r => r?.from || r?.to);

  const clearAllFilters = () => {
    setSearch('');
    setColFilters({});
    setRangeFilters({});
    setCurrentPage(1);
  };

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    let result = data;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d) => d.title.toLowerCase().includes(q));
    }
    Object.entries(colFilters).forEach(([key, val]) => {
      if (!val) return;
      const q = val.toLowerCase();
      result = result.filter((d) => {
        const field = (d as unknown as Record<string, unknown>)[key];
        if (typeof field === 'string') return field.toLowerCase().includes(q);
        return true;
      });
    });
    // Range filters
    Object.entries(rangeFilters).forEach(([key, range]) => {
      if (!range?.from && !range?.to) return;
      result = result.filter((d) => {
        const val = (d as unknown as Record<string, unknown>)[key];
        if (typeof val !== 'number') return true;
        if (range.from && val < Number(range.from)) return false;
        if (range.to && val > Number(range.to)) return false;
        return true;
      });
    });
    return result;
  }, [data, search, colFilters, rangeFilters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortKey];
      const bVal = (b as unknown as Record<string, unknown>)[sortKey];
      let cmp = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') cmp = aVal.localeCompare(bVal);
      else if (typeof aVal === 'number' && typeof bVal === 'number') cmp = aVal - bVal;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const maxCitations = useMemo(() => {
    return data.reduce((max, d) => Math.max(max, d.totalCitations), 1);
  }, [data]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns: { key: string; label: string; align: 'left' | 'right'; sortable: boolean }[] = [
    { key: 'title', label: 'Page', align: 'left', sortable: true },
    { key: 'totalCitations', label: 'Citations', align: 'right', sortable: true },
    { key: 'aiClicks', label: 'AI Clicks', align: 'right', sortable: true },
    { key: 'leads', label: 'Leads', align: 'right', sortable: true },
    { key: 'distribution', label: 'Distribution', align: 'left', sortable: false },
    { key: 'change', label: 'Change', align: 'right', sortable: true },
  ];

  return (
    <div className="bg-white rounded-[14px] border border-surface-200 shadow-card">
      <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-surface-900">AI Page Visibility</h3>
          <p className="text-xs text-surface-500 mt-0.5">
            {sorted.length} pages &middot; Showing {(currentPage - 1) * pageSize + 1}&ndash;{Math.min(currentPage * pageSize, sorted.length)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${showFilters ? 'text-[#00C5DF] border-[#00C5DF]/30 bg-[#00C5DF]/5' : 'text-surface-600 border-surface-200 bg-white hover:bg-surface-50'}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg>
            Filters
          </button>
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#00C5DF] bg-white border border-[#00C5DF]/30 rounded-lg hover:bg-[#00C5DF]/5 transition-colors">
              Clear
            </button>
          )}
          <div className="relative">
            <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search pages..." className="pl-7 pr-3 py-1.5 text-xs border border-surface-200 rounded-lg bg-white text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-indigo-300 w-48" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-surface-200">
          <thead className="bg-surface-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2 text-xs font-medium text-surface-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:bg-surface-100' : ''} select-none ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                  onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    {col.sortable && <SortIcon active={sortKey === col.key} direction={sortDir} />}
                  </span>
                </th>
              ))}
            </tr>
            {/* Column filter row */}
            {showFilters && <tr className="bg-surface-50/50">
              {columns.map((col) => (
                <th key={`filter-${col.key}`} className="px-2 py-1.5">
                  {col.key === 'title' ? (
                    <input
                      type="text"
                      value={colFilters[col.key] || ''}
                      onChange={(e) => updateColFilter(col.key, e.target.value)}
                      placeholder="Filter..."
                      className="w-full text-xs border border-surface-200 rounded px-1.5 py-1 text-surface-700 bg-white placeholder:text-surface-300 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                    />
                  ) : NUMERIC_KEYS.has(col.key) ? (
                    <div className="flex gap-1">
                      <input type="number" value={rangeFilters[col.key]?.from || ''} onChange={(e) => updateRangeFilter(col.key, 'from', e.target.value)} placeholder="from" className="w-1/2 text-xs border border-surface-200 rounded px-1.5 py-1 text-surface-700 bg-white placeholder:text-surface-300 focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                      <input type="number" value={rangeFilters[col.key]?.to || ''} onChange={(e) => updateRangeFilter(col.key, 'to', e.target.value)} placeholder="to" className="w-1/2 text-xs border border-surface-200 rounded px-1.5 py-1 text-surface-700 bg-white placeholder:text-surface-300 focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                    </div>
                  ) : (
                    <span />
                  )}
                </th>
              ))}
            </tr>}
          </thead>
          <tbody className="divide-y divide-surface-200">
            {paginated.map((row) => (
              <tr key={row.pageId} className="hover:bg-surface-50">
                <td className="px-3 py-2 text-sm font-medium text-surface-900 max-w-xs truncate">
                      {onPageClick ? (
                        <button
                          onClick={() => onPageClick(row.pageId)}
                          className="text-left hover:text-indigo-600 hover:underline transition-colors"
                        >
                          {row.title}
                        </button>
                      ) : (
                        row.title
                      )}
                    </td>
                <td className="px-3 py-2 text-sm text-surface-700 font-mono text-right">{row.totalCitations}</td>
                <td className="px-3 py-2 text-sm text-surface-700 font-mono text-right">{row.aiClicks}</td>
                <td className="px-3 py-2 text-sm text-surface-700 font-mono text-right">{row.leads}</td>
                <td className="px-3 py-2">
                  <DistributionBar citations={row.totalCitations} clicks={row.aiClicks} maxCitations={maxCitations} />
                </td>
                <td className="px-3 py-2 text-right">
                  <TrendIndicator change={row.change} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200">
          <div className="flex items-center gap-3">
            <span className="text-xs text-surface-500">Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-surface-400">Show</span>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="text-xs border border-surface-200 rounded px-1.5 py-0.5 text-surface-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300">
                {PAGE_SIZE_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
          </div>
          {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage <= 1} className="px-2 py-1 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded disabled:opacity-40 disabled:cursor-not-allowed">&larr; Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setCurrentPage(p)} className={`w-7 h-7 text-xs font-medium rounded ${p === currentPage ? 'bg-purple-600 text-white' : 'text-surface-600 hover:bg-surface-100'}`}>{p}</button>
            ))}
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages} className="px-2 py-1 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded disabled:opacity-40 disabled:cursor-not-allowed">Next &rarr;</button>
          </div>
          )}
        </div>
    </div>
  );
}
