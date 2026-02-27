'use client';

import React, { useState, useMemo } from 'react';
import { AIPageCitation } from '@/data/ai-analytics';
import { TrendIndicator } from '@/components/shared/TrendIndicator';

const PAGE_SIZE = 10;

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
  const [sortKey, setSortKey] = useState<string>('totalCitations');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setCurrentPage(1);
  };

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortKey];
      const bVal = (b as unknown as Record<string, unknown>)[sortKey];
      let cmp = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') cmp = aVal.localeCompare(bVal);
      else if (typeof aVal === 'number' && typeof bVal === 'number') cmp = aVal - bVal;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const maxCitations = useMemo(() => {
    return data.reduce((max, d) => Math.max(max, d.totalCitations), 1);
  }, [data]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
      <div className="px-4 py-3 border-b border-surface-100">
        <h3 className="text-sm font-semibold text-surface-900">AI Page Visibility</h3>
        <p className="text-xs text-surface-500 mt-0.5">
          {sorted.length} pages &middot; Showing {(currentPage - 1) * PAGE_SIZE + 1}&ndash;{Math.min(currentPage * PAGE_SIZE, sorted.length)}
        </p>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200">
          <span className="text-xs text-surface-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-2 py-1 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
            >
              &larr; Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 text-xs font-medium rounded ${
                  p === currentPage ? 'bg-purple-600 text-white' : 'text-surface-600 hover:bg-surface-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-2 py-1 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
