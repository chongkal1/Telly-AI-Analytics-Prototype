'use client';

import { Dashboard } from '@/types';
import { DashboardWidget } from './DashboardWidget';

interface DashboardGridProps {
  dashboard: Dashboard;
}

export function DashboardGrid({ dashboard }: DashboardGridProps) {
  return (
    <div
      className="gap-4"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
      }}
    >
      {dashboard.widgets.map((widget) => (
        <div
          key={widget.id}
          style={{ gridColumn: `span ${Math.min(widget.colSpan, 12)}` }}
          className="min-w-0"
        >
          <DashboardWidget widget={widget} />
        </div>
      ))}
    </div>
  );
}
