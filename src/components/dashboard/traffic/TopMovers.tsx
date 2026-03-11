'use client';

import React, { useState, useMemo } from 'react';
import { PageOverviewData } from '@/data/chart-data';
import { TrendIndicator } from '@/components/shared/TrendIndicator';

const PAGE_SIZE_OPTIONS = [10, 50, 100, 200, 500];
const PERCENT_KEYS = new Set(['ctr']);

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

interface TopPagesProps {
  pages: PageOverviewData[];
  onPageClick?: (pageId: string) => void;
}

export function TopPages({ pages, onPageClick }: TopPagesProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const [rangeFilters, setRangeFilters] = useState<Record<string, { from: string; to: string }>>({});
  const [sortKey, setSortKey] = useState<string>('clicks');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const updateColFilter = (key: string, value: string) => {
    setColFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const updateRangeFilter = (key: string, bound: 'from' | 'to', value: string) => {
    setRangeFilters((prev) => ({ ...prev, [key]: { ...prev[key], [bound]: value } }));
    setCurrentPage(1);
  };

  const NUMERIC_KEYS = new Set(['impressions', 'clicks', 'clicksChange', 'ctr', 'leads', 'ctaClicks']);

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

  const categories = useMemo(() => Array.from(new Set(pages.map((p) => p.category))).sort(), [pages]);

  const filtered = useMemo(() => {
    let result = pages;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    Object.entries(colFilters).forEach(([key, val]) => {
      if (!val) return;
      const q = val.toLowerCase();
      result = result.filter((p) => {
        const field = (p as unknown as Record<string, unknown>)[key];
        if (typeof field === 'string') return field.toLowerCase().includes(q);
        return true;
      });
    });
    // Range filters
    Object.entries(rangeFilters).forEach(([key, range]) => {
      if (!range?.from && !range?.to) return;
      result = result.filter((p) => {
        let val = (p as unknown as Record<string, unknown>)[key];
        if (typeof val !== 'number') return true;
        if (PERCENT_KEYS.has(key)) val = (val as number) * 100;
        if (range.from && (val as number) < Number(range.from)) return false;
        if (range.to && (val as number) > Number(range.to)) return false;
        return true;
      });
    });
    return result;
  }, [pages, search, colFilters, rangeFilters]);

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

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    { key: 'title', label: 'Page', align: 'left' as const },
    { key: 'category', label: 'Cluster', align: 'left' as const },
    { key: 'impressions', label: 'Impressions', align: 'right' as const },
    { key: 'clicks', label: 'Clicks', align: 'right' as const },
    { key: 'clicksChange', label: 'Trend', align: 'right' as const },
    { key: 'ctr', label: 'CTR', align: 'right' as const },
    { key: 'leads', label: 'Leads', align: 'right' as const },
    { key: 'ctaClicks', label: 'Conversions', align: 'right' as const },
  ];

  return (
    <div className="bg-white rounded-[14px] border border-surface-200 shadow-card">
      <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-surface-900">All Pages</h3>
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
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search pages..."
              className="pl-7 pr-3 py-1.5 text-xs border border-surface-200 rounded-lg bg-white text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-indigo-300 w-48"
            />
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
                  className={`px-3 py-2 text-xs font-medium text-surface-500 uppercase tracking-wider cursor-pointer hover:bg-surface-100 select-none ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                  onClick={() => toggleSort(col.key)}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    <SortIcon active={sortKey === col.key} direction={sortDir} />
                  </span>
                </th>
              ))}
            </tr>
            {/* Column filter row */}
            {showFilters && <tr className="bg-surface-50/50">
              {columns.map((col) => (
                <th key={`filter-${col.key}`} className="px-2 py-1.5">
                  {col.key === 'category' ? (
                    <select
                      value={colFilters[col.key] || ''}
                      onChange={(e) => updateColFilter(col.key, e.target.value)}
                      className="w-full text-xs border border-surface-200 rounded px-1.5 py-1 text-surface-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                    >
                      <option value="">All</option>
                      {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  ) : col.key === 'title' ? (
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
              <tr key={row.id} className="hover:bg-surface-50">
                <td className="px-3 py-2 text-sm font-medium text-surface-900 max-w-xs truncate">
                      {onPageClick ? (
                        <button
                          onClick={() => onPageClick(row.id)}
                          className="text-left hover:text-indigo-600 hover:underline transition-colors"
                        >
                          {row.title}
                        </button>
                      ) : (
                        row.title
                      )}
                    </td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-indigo-50 text-indigo-700">
                    {row.category}
                  </span>
                </td>
                <td className="px-3 py-2 text-sm text-surface-700 font-mono text-right">{row.impressions.toLocaleString()}</td>
                <td className="px-3 py-2 text-sm text-surface-700 font-mono text-right">{row.clicks.toLocaleString()}</td>
                <td className="px-3 py-2 text-right">
                  <TrendIndicator change={row.clicksChange} />
                </td>
                <td className="px-3 py-2 text-sm text-surface-700 font-mono text-right">{(row.ctr * 100).toFixed(2)}%</td>
                <td className="px-3 py-2 text-sm text-surface-700 font-mono text-right">{row.leads}</td>
                <td className="px-3 py-2 text-sm text-surface-700 font-mono text-right">{row.ctaClicks.toLocaleString()}</td>
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
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="text-xs border border-surface-200 rounded px-1.5 py-0.5 text-surface-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
              >
                {PAGE_SIZE_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
          </div>
          {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage <= 1} className="px-2 py-1 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded disabled:opacity-40 disabled:cursor-not-allowed">&larr; Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setCurrentPage(p)} className={`w-7 h-7 text-xs font-medium rounded ${p === currentPage ? 'bg-indigo-600 text-white' : 'text-surface-600 hover:bg-surface-100'}`}>{p}</button>
            ))}
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages} className="px-2 py-1 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded disabled:opacity-40 disabled:cursor-not-allowed">Next &rarr;</button>
          </div>
          )}
        </div>
    </div>
  );
}
