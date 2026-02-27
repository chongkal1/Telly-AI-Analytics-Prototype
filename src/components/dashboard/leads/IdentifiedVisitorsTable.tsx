'use client';

import React, { useState, useMemo } from 'react';
import { Lead } from '@/types';
import { formatDate } from '@/lib/utils';

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

function LinkedInIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

interface IdentifiedVisitorsTableProps {
  visitors: Lead[];
}

export function IdentifiedVisitorsTable({ visitors }: IdentifiedVisitorsTableProps) {
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
    return [...visitors].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortKey];
      const bVal = (b as unknown as Record<string, unknown>)[sortKey];
      let cmp = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') cmp = aVal.localeCompare(bVal);
      else if (typeof aVal === 'number' && typeof bVal === 'number') cmp = aVal - bVal;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [visitors, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const columns: { key: string; label: string; align: 'left' | 'right' }[] = [
    { key: 'name', label: 'Name', align: 'left' },
    { key: 'email', label: 'Email', align: 'left' },
    { key: 'linkedinUrl', label: 'LinkedIn', align: 'left' },
    { key: 'company', label: 'Company', align: 'left' },
    { key: 'industry', label: 'Industry', align: 'left' },
    { key: 'title', label: 'Title', align: 'left' },
    { key: 'sourceUrl', label: 'Source Page', align: 'left' },
    { key: 'createdAt', label: 'Date', align: 'left' },
  ];

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'LinkedIn', 'Company', 'Industry', 'Title', 'Source Page', 'Date'];
    const rows = sorted.map((r) => [r.name, r.email, r.linkedinUrl, r.company, r.industry, r.title, r.sourceUrl, formatDate(r.createdAt)]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'identified-visitors.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendToCRM = () => {
    alert(`${sorted.length} visitors queued for CRM sync. This is a prototype — no data was sent.`);
  };

  return (
    <div className="bg-white rounded-[14px] border border-surface-200 shadow-card">
      <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-surface-900">Identified Visitors</h3>
          <p className="text-xs text-surface-500 mt-0.5">
            {sorted.length} visitors via RB2B &middot; Showing {(currentPage - 1) * PAGE_SIZE + 1}&ndash;{Math.min(currentPage * PAGE_SIZE, sorted.length)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-700 bg-white border border-surface-300 rounded-lg hover:bg-surface-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={handleSendToCRM}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            Send to CRM
          </button>
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
          </thead>
          <tbody className="divide-y divide-surface-200">
            {paginated.map((row) => (
              <tr key={row.id} className="hover:bg-surface-50">
                <td className="px-3 py-2 text-sm font-medium text-surface-900 whitespace-nowrap">{row.name}</td>
                <td className="px-3 py-2 text-sm text-surface-600 whitespace-nowrap max-w-[200px] truncate">
                  <a href={`mailto:${row.email}`} className="hover:text-indigo-600 hover:underline transition-colors">
                    {row.email}
                  </a>
                </td>
                <td className="px-3 py-2">
                  {row.linkedinUrl && (
                    <a
                      href={row.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#0A66C2] hover:text-[#004182] transition-colors"
                    >
                      <LinkedInIcon />
                      <span className="text-xs">Profile</span>
                    </a>
                  )}
                </td>
                <td className="px-3 py-2 text-sm text-surface-700 whitespace-nowrap">{row.company}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-indigo-50 text-indigo-700">
                    {row.industry}
                  </span>
                </td>
                <td className="px-3 py-2 text-sm text-surface-700 max-w-[180px] truncate">{row.title}</td>
                <td className="px-3 py-2 text-sm text-surface-500 max-w-[200px] truncate font-mono text-xs">{row.sourceUrl}</td>
                <td className="px-3 py-2 text-sm text-surface-500 whitespace-nowrap">{formatDate(row.createdAt)}</td>
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
                  p === currentPage ? 'bg-indigo-600 text-white' : 'text-surface-600 hover:bg-surface-100'
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
