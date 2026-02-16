'use client';

import React, { useState, useMemo } from 'react';
import { Lead, LeadStatus } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate, formatCurrency } from '@/lib/utils';

const PAGE_SIZE = 10;

type SortDirection = 'asc' | 'desc';

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  return (
    <span className="ml-1 inline-flex flex-col">
      <svg className={`h-2 w-2 ${active && direction === 'asc' ? 'text-indigo-600' : 'text-gray-400'}`} viewBox="0 0 8 4" fill="currentColor">
        <path d="M4 0L8 4H0L4 0Z" />
      </svg>
      <svg className={`h-2 w-2 -mt-0.5 ${active && direction === 'desc' ? 'text-indigo-600' : 'text-gray-400'}`} viewBox="0 0 8 4" fill="currentColor">
        <path d="M4 4L0 0H8L4 4Z" />
      </svg>
    </span>
  );
}

interface RecentLeadsTableProps {
  leads: Lead[];
}

export function RecentLeadsTable({ leads }: RecentLeadsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string>('createdAt');
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
    return [...leads].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortKey];
      const bVal = (b as unknown as Record<string, unknown>)[sortKey];
      let cmp = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') cmp = aVal.localeCompare(bVal);
      else if (typeof aVal === 'number' && typeof bVal === 'number') cmp = aVal - bVal;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [leads, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const columns: { key: string; label: string; align: 'left' | 'right' }[] = [
    { key: 'name', label: 'Name', align: 'left' },
    { key: 'company', label: 'Company', align: 'left' },
    { key: 'industry', label: 'Industry', align: 'left' },
    { key: 'status', label: 'Status', align: 'left' },
    { key: 'value', label: 'Value', align: 'right' },
    { key: 'createdAt', label: 'Date', align: 'left' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Recent Leads</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {sorted.length} captured leads &middot; Showing {(currentPage - 1) * PAGE_SIZE + 1}&ndash;{Math.min(currentPage * PAGE_SIZE, sorted.length)}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                  onClick={() => toggleSort(col.key)}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    <SortIcon active={sortKey === col.key} direction={sortDir} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginated.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">{row.name}</td>
                <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{row.company}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-indigo-50 text-indigo-700">
                    {row.industry}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={row.status as LeadStatus} />
                </td>
                <td className="px-3 py-2 text-sm text-gray-700 font-mono text-right">{formatCurrency(row.value)}</td>
                <td className="px-3 py-2 text-sm text-gray-500 whitespace-nowrap">{formatDate(row.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
            >
              &larr; Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 text-xs font-medium rounded ${
                  p === currentPage ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
