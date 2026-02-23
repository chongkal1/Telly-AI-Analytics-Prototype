'use client';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { id: string; label: string }[];
}

export function DashboardTabs({ activeTab, onTabChange, tabs }: DashboardTabsProps) {
  return (
    <div className="flex gap-1 border-b border-surface-200 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === tab.id
              ? 'text-indigo-600'
              : 'text-surface-500 hover:text-surface-700'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
