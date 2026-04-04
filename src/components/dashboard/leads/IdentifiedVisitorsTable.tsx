'use client';

import React, { useState, useMemo } from 'react';
import { Lead, LeadStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import { CrmInfo } from './CrmIntegrationModal';

const PAGE_SIZE_OPTIONS = [10, 50, 100, 200, 500];

type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'identified' | 'contacted' | 'captured';

/** Map raw lead statuses to the 3 display statuses */
function getDisplayStatus(status: LeadStatus): 'identified' | 'contacted' | 'captured' {
  if (status === 'contacted') return 'contacted';
  if (status === 'captured') return 'captured';
  return 'identified'; // new, identified, qualified, converted → identified
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  identified: { label: 'Identified', dot: 'bg-[#00C5DF]', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  contacted: { label: 'Contacted', dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  captured: { label: 'Captured', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
};

function StatusBadgeInline({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.identified;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium rounded-full ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

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
  connectedCrm: CrmInfo | null;
  onConnectCrm: () => void;
  onManageCrm: () => void;
  onOpenConversation?: (lead: Lead) => void;
}

export function IdentifiedVisitorsTable({ visitors, connectedCrm, onConnectCrm, onManageCrm, onOpenConversation }: IdentifiedVisitorsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortKey, setSortKey] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const updateColFilter = (key: string, value: string) => {
    setColFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const hasActiveFilters = search || Object.values(colFilters).some(v => v) || statusFilter !== 'all' || dateFrom || dateTo;

  const clearAllFilters = () => {
    setSearch('');
    setColFilters({});
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
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

  // Compute status counts for filter badges
  const statusCounts = useMemo(() => {
    const counts = { all: visitors.length, identified: 0, contacted: 0, captured: 0 };
    visitors.forEach((v) => { counts[getDisplayStatus(v.status)]++; });
    return counts;
  }, [visitors]);

  const industries = useMemo(() => Array.from(new Set(visitors.map((v) => v.industry))).sort(), [visitors]);

  const filtered = useMemo(() => {
    let result = visitors;
    if (statusFilter !== 'all') {
      result = result.filter((v) => getDisplayStatus(v.status) === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((v) => v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q) || v.company.toLowerCase().includes(q) || v.industry.toLowerCase().includes(q) || v.title.toLowerCase().includes(q));
    }
    // Column-level filters
    Object.entries(colFilters).forEach(([key, val]) => {
      if (!val) return;
      if (key === 'conversation') {
        result = result.filter((v) => {
          const hasConv = getDisplayStatus(v.status) === 'contacted' || getDisplayStatus(v.status) === 'captured';
          return val === 'has' ? hasConv : !hasConv;
        });
        return;
      }
      const q = val.toLowerCase();
      result = result.filter((v) => {
        const field = (v as unknown as Record<string, unknown>)[key];
        if (typeof field === 'string') return field.toLowerCase().includes(q);
        return true;
      });
    });
    // Date range filter
    if (dateFrom) {
      result = result.filter((v) => v.createdAt >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((v) => v.createdAt <= dateTo + 'T23:59:59');
    }
    return result;
  }, [visitors, statusFilter, search, colFilters, dateFrom, dateTo]);

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

  const columns: { key: string; label: string; align: 'left' | 'right' }[] = [
    { key: 'name', label: 'Name', align: 'left' },
    { key: 'email', label: 'Email', align: 'left' },
    { key: 'linkedinUrl', label: 'LinkedIn', align: 'left' },
    { key: 'company', label: 'Company', align: 'left' },
    { key: 'industry', label: 'Industry', align: 'left' },
    { key: 'title', label: 'Title', align: 'left' },
    { key: 'sourceUrl', label: 'Source Page', align: 'left' },
    { key: 'status', label: 'Status', align: 'left' },
    { key: 'conversation', label: 'Conversation', align: 'left' },
    { key: 'createdAt', label: 'Date', align: 'left' },
  ];

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'LinkedIn', 'Company', 'Industry', 'Title', 'Source Page', 'Status', 'Date'];
    const rows = sorted.map((r) => [r.name, r.email, r.linkedinUrl, r.company, r.industry, r.title, r.sourceUrl, getDisplayStatus(r.status), formatDate(r.createdAt)]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const FILTER_BUTTONS: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'identified', label: 'Identified' },
    { key: 'contacted', label: 'Contacted' },
    { key: 'captured', label: 'Captured' },
  ];

  return (
    <div className="bg-white rounded-[14px] border border-surface-200 shadow-card">
      <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-surface-900">Organic Leads</h3>
          <p className="text-xs text-surface-500 mt-0.5">
            {sorted.length} leads &middot; Showing {sorted.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}&ndash;{Math.min(currentPage * pageSize, sorted.length)}
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
              placeholder="Search leads..."
              className="pl-7 pr-3 py-1.5 text-xs border border-surface-200 rounded-lg bg-white text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-indigo-300 w-44"
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-700 bg-white border border-surface-300 rounded-lg hover:bg-surface-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>
          {connectedCrm ? (
            <button
              onClick={onManageCrm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Connected to {connectedCrm.name}
            </button>
          ) : (
            <button
              onClick={onConnectCrm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              Connect CRM
            </button>
          )}
        </div>
      </div>

      {/* Status filter bar */}
      <div className="px-4 py-2 border-b border-surface-100 flex items-center gap-1.5">
        {FILTER_BUTTONS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setStatusFilter(f.key); setCurrentPage(1); }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === f.key
                ? 'bg-surface-900 text-white'
                : 'text-surface-600 bg-surface-50 hover:bg-surface-100'
            }`}
          >
            {f.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              statusFilter === f.key ? 'bg-white/20' : 'bg-surface-200/80'
            }`}>
              {statusCounts[f.key]}
            </span>
          </button>
        ))}
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
              {connectedCrm && (
                <th className="px-3 py-2 text-xs font-medium text-surface-500 uppercase tracking-wider text-left">
                  CRM
                </th>
              )}
            </tr>
            {/* Column filter row */}
            {showFilters && <tr className="bg-surface-50/50">
              {columns.map((col) => (
                <th key={`filter-${col.key}`} className="px-2 py-1.5">
                  {col.key === 'industry' ? (
                    <select
                      value={colFilters[col.key] || ''}
                      onChange={(e) => updateColFilter(col.key, e.target.value)}
                      className="w-full text-xs border border-surface-200 rounded px-1.5 py-1 text-surface-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                    >
                      <option value="">All</option>
                      {industries.map((ind) => (<option key={ind} value={ind}>{ind}</option>))}
                    </select>
                  ) : col.key === 'status' ? (
                    <select
                      value={colFilters[col.key] || ''}
                      onChange={(e) => updateColFilter(col.key, e.target.value)}
                      className="w-full text-xs border border-surface-200 rounded px-1.5 py-1 text-surface-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                    >
                      <option value="">All</option>
                      <option value="identified">Identified</option>
                      <option value="contacted">Contacted</option>
                      <option value="captured">Captured</option>
                    </select>
                  ) : col.key === 'conversation' ? (
                    <select
                      value={colFilters[col.key] || ''}
                      onChange={(e) => updateColFilter(col.key, e.target.value)}
                      className="w-full text-xs border border-surface-200 rounded px-1.5 py-1 text-surface-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                    >
                      <option value="">All</option>
                      <option value="has">Has Conversation</option>
                      <option value="no">No Conversation</option>
                    </select>
                  ) : col.key === 'createdAt' ? (
                    <div className="flex gap-1">
                      <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }} className="w-1/2 text-xs border border-surface-200 rounded px-1 py-1 text-surface-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                      <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }} className="w-1/2 text-xs border border-surface-200 rounded px-1 py-1 text-surface-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                    </div>
                  ) : col.key === 'linkedinUrl' ? (
                    <span />
                  ) : (
                    <input
                      type="text"
                      value={colFilters[col.key] || ''}
                      onChange={(e) => updateColFilter(col.key, e.target.value)}
                      placeholder="Filter..."
                      className="w-full text-xs border border-surface-200 rounded px-1.5 py-1 text-surface-700 bg-white placeholder:text-surface-300 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                    />
                  )}
                </th>
              ))}
              {connectedCrm && <th className="px-2 py-1.5" />}
            </tr>}
          </thead>
          <tbody className="divide-y divide-surface-200">
            {paginated.map((row) => (
              <tr key={row.id} className="hover:bg-surface-50">
                <td className="px-3 py-2 text-sm font-medium whitespace-nowrap">
                  {(getDisplayStatus(row.status) === 'contacted' || getDisplayStatus(row.status) === 'captured') ? (
                    <button
                      onClick={() => onOpenConversation?.(row)}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors text-left"
                    >
                      {row.name}
                    </button>
                  ) : (
                    <span className="text-surface-900">{row.name}</span>
                  )}
                </td>
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
                <td className="px-3 py-2">
                  <StatusBadgeInline status={getDisplayStatus(row.status)} />
                </td>
                <td className="px-3 py-2">
                  {(getDisplayStatus(row.status) === 'contacted' || getDisplayStatus(row.status) === 'captured') ? (
                    <button
                      onClick={() => onOpenConversation?.(row)}
                      className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                      </svg>
                      View Chat
                    </button>
                  ) : (
                    <span className="text-xs text-surface-300">&mdash;</span>
                  )}
                </td>
                <td className="px-3 py-2 text-sm text-surface-500 whitespace-nowrap">{formatDate(row.createdAt)}</td>
                {connectedCrm && (
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-50 text-green-700">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Sent
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200">
          <div className="flex items-center gap-3">
            <span className="text-xs text-surface-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-surface-400">Show</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="text-xs border border-surface-200 rounded px-1.5 py-0.5 text-surface-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
              >
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage <= 1} className="px-2 py-1 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded disabled:opacity-40 disabled:cursor-not-allowed">&larr; Prev</button>
            {(() => {
              const pages: (number | string)[] = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (currentPage > 3) pages.push('...');
                for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
                if (currentPage < totalPages - 2) pages.push('...');
                pages.push(totalPages);
              }
              return pages.map((p, idx) =>
                typeof p === 'string'
                  ? <span key={`e${idx}`} className="w-7 h-7 flex items-center justify-center text-xs text-surface-400">...</span>
                  : <button key={p} onClick={() => setCurrentPage(p)} className={`w-7 h-7 text-xs font-medium rounded ${p === currentPage ? 'bg-indigo-600 text-white' : 'text-surface-600 hover:bg-surface-100'}`}>{p}</button>
              );
            })()}
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages} className="px-2 py-1 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded disabled:opacity-40 disabled:cursor-not-allowed">Next &rarr;</button>
          </div>
          )}
        </div>
    </div>
  );
}
