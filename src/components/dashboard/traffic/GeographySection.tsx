'use client';

import { useState, useMemo, memo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { GeoTrafficEntry } from '@/data/geography';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const ALPHA2_TO_NUMERIC: Record<string, string> = {
  US: '840', GB: '826', CA: '124', DE: '276', AU: '036',
  IN: '356', FR: '250', NL: '528', SG: '702', BR: '076',
  JP: '392', SE: '752', IL: '376', KR: '410', AE: '784',
};

type SortDirection = 'asc' | 'desc';

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

function Th({ label, colKey, align, sortKey, sortDir, onSort }: {
  label: string; colKey: string; align?: 'right';
  sortKey: string | null; sortDir: SortDirection; onSort: (k: string) => void;
}) {
  return (
    <th
      className={`px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none ${align === 'right' ? 'text-right' : 'text-left'}`}
      onClick={() => onSort(colKey)}
    >
      <span className="inline-flex items-center">
        {label}
        <SortIcon active={sortKey === colKey} direction={sortDir} />
      </span>
    </th>
  );
}

/* ── World Map with react-simple-maps ── */

const WorldMap = memo(function WorldMap({ data }: { data: GeoTrafficEntry[] }) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const maxSessions = Math.max(...data.map((d) => d.sessions));

  // Build lookup by numeric code
  const sessionsByNumeric = useMemo(() => {
    const map: Record<string, GeoTrafficEntry> = {};
    data.forEach((d) => {
      const numeric = ALPHA2_TO_NUMERIC[d.countryCode];
      if (numeric) map[numeric] = d;
    });
    return map;
  }, [data]);

  const hoveredEntry = hoveredCountry ? sessionsByNumeric[hoveredCountry] : null;

  return (
    <div className="relative" onMouseLeave={() => setHoveredCountry(null)}>
      <ComposableMap
        projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
        width={800}
        height={400}
        style={{ width: '100%', height: 'auto' }}
      >
        <ZoomableGroup center={[0, 20]} zoom={1}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const numericCode = geo.id;
                const entry = sessionsByNumeric[numericCode];
                const opacity = entry ? 0.2 + (entry.sessions / maxSessions) * 0.8 : 1;
                const fill = entry ? '#4f46e5' : '#e5e7eb';

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    fillOpacity={entry ? opacity : 1}
                    stroke={hoveredCountry === numericCode ? '#4f46e5' : '#d1d5db'}
                    strokeWidth={hoveredCountry === numericCode ? 1.5 : 0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: entry ? '#4f46e5' : '#d1d5db', fillOpacity: entry ? Math.min(opacity + 0.15, 1) : 1 },
                      pressed: { outline: 'none' },
                    }}
                    onMouseEnter={(e) => {
                      setHoveredCountry(numericCode);
                      const rect = (e.target as SVGElement).ownerSVGElement?.getBoundingClientRect();
                      if (rect) {
                        setTooltipPos({
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top - 10,
                        });
                      }
                    }}
                    onMouseMove={(e) => {
                      const rect = (e.target as SVGElement).ownerSVGElement?.getBoundingClientRect();
                      if (rect) {
                        setTooltipPos({
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top - 10,
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredCountry(null)}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {hoveredEntry && (
        <div
          className="absolute pointer-events-none bg-gray-900 text-white rounded-lg px-3 py-2 text-xs shadow-lg z-10"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="font-semibold">{hoveredEntry.country}</p>
          <p className="text-gray-300">{hoveredEntry.sessions.toLocaleString()} sessions</p>
          <p className="text-gray-300">{hoveredEntry.clicks.toLocaleString()} clicks</p>
          <p className="text-gray-300">{hoveredEntry.leads} leads</p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
        <span className="text-[10px] text-gray-400">Low</span>
        <div className="flex h-2 rounded-full overflow-hidden">
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((op) => (
            <div key={op} className="w-4 h-full" style={{ backgroundColor: '#4f46e5', opacity: op }} />
          ))}
        </div>
        <span className="text-[10px] text-gray-400">High</span>
      </div>
    </div>
  );
});

/* ── Geography Section ── */

interface GeographySectionProps {
  data: GeoTrafficEntry[];
}

export function GeographySection({ data }: GeographySectionProps) {
  const { sorted, sortKey, sortDir, toggle } = useSort(data, 'sessions');

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Geography</h3>
        <p className="text-xs text-gray-500 mt-0.5">Traffic distribution by country</p>
      </div>

      <div className="grid grid-cols-12 divide-x divide-gray-200">
        {/* Map */}
        <div className="col-span-7 p-4">
          <WorldMap data={data} />
        </div>

        {/* Table */}
        <div className="col-span-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <Th label="Country" colKey="country" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                <Th label="Sessions" colKey="sessions" align="right" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                <Th label="Clicks" colKey="clicks" align="right" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                <Th label="Leads" colKey="leads" align="right" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                <Th label="Conv." colKey="conversionRate" align="right" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
                <Th label="%" colKey="percentageOfTotal" align="right" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sorted.map((entry) => (
                <tr key={entry.countryCode} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">{entry.country}</td>
                  <td className="px-3 py-2 text-sm text-gray-700 text-right font-mono">{entry.sessions.toLocaleString()}</td>
                  <td className="px-3 py-2 text-sm text-gray-700 text-right font-mono">{entry.clicks.toLocaleString()}</td>
                  <td className="px-3 py-2 text-sm text-gray-700 text-right font-mono">{entry.leads}</td>
                  <td className="px-3 py-2 text-sm text-gray-700 text-right font-mono">{entry.conversionRate.toFixed(1)}%</td>
                  <td className="px-3 py-2 text-sm text-gray-700 text-right font-mono">{entry.percentageOfTotal}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
