'use client';

interface Command {
  command: string;
  description: string;
  badge: string;
  icon: string;
  iconBg: string;
}

interface CommandCategory {
  label: string;
  commands: Command[];
}

const COMMAND_CATEGORIES: CommandCategory[] = [
  {
    label: 'ANALYTICS',
    commands: [
      { command: '/traffic overview', description: 'View organic traffic summary', badge: 'metrics', icon: '📊', iconBg: 'bg-blue-50' },
      { command: '/traffic top-pages', description: 'See your best performing pages', badge: 'pages', icon: '📄', iconBg: 'bg-indigo-50' },
      { command: '/traffic movers', description: 'Rising & falling pages', badge: 'trends', icon: '📈', iconBg: 'bg-green-50' },
      { command: '/leads pipeline', description: 'Lead pipeline by status', badge: 'leads', icon: '🎯', iconBg: 'bg-orange-50' },
      { command: '/ai visibility', description: 'AI engine visibility & citations', badge: 'ai', icon: '🤖', iconBg: 'bg-purple-50' },
    ],
  },
  {
    label: 'CONTENT',
    commands: [
      { command: '/topics clusters', description: 'Cluster performance overview', badge: 'clusters', icon: '🧩', iconBg: 'bg-teal-50' },
      { command: '/topics funnel', description: 'Content conversion funnel', badge: 'funnel', icon: '🔻', iconBg: 'bg-rose-50' },
      { command: '/topics gaps', description: 'Industry content gap analysis', badge: 'gaps', icon: '🔍', iconBg: 'bg-amber-50' },
      { command: '/content categories', description: 'Performance by category', badge: 'content', icon: '📁', iconBg: 'bg-cyan-50' },
    ],
  },
  {
    label: 'REPORTS',
    commands: [
      { command: '/report', description: 'Latest monthly report summary', badge: 'report', icon: '📋', iconBg: 'bg-violet-50' },
      { command: '/report recommendations', description: 'Strategic recommendations', badge: 'strategy', icon: '💡', iconBg: 'bg-yellow-50' },
      { command: '/summary', description: 'ROAS & ROI overview', badge: 'roi', icon: '💰', iconBg: 'bg-[#00C5DF]/10' },
      { command: '/compare', description: 'Compare time periods', badge: 'periods', icon: '⚖️', iconBg: 'bg-slate-50' },
    ],
  },
];

interface CommandListProps {
  onCommand: (command: string) => void;
  filter?: string;
}

export function CommandList({ onCommand, filter = '' }: CommandListProps) {
  // Filter categories and commands based on the typed text
  const filtered = COMMAND_CATEGORIES.map((category) => ({
    ...category,
    commands: category.commands.filter((cmd) => {
      if (!filter) return true;
      const search = filter.toLowerCase();
      return (
        cmd.command.toLowerCase().includes(search) ||
        cmd.description.toLowerCase().includes(search) ||
        cmd.badge.toLowerCase().includes(search)
      );
    }),
  })).filter((category) => category.commands.length > 0);

  if (filtered.length === 0) {
    return (
      <div className="bg-white border border-surface-200 rounded-[14px] shadow-lg mx-3 mb-1 p-4">
        <p className="text-xs text-surface-400 text-center">No matching commands</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-surface-200 rounded-[14px] shadow-lg mx-3 mb-1 overflow-hidden">
      <div className="max-h-[340px] overflow-y-auto px-2 py-2">
        {filtered.map((category) => (
          <div key={category.label} className="mb-1.5 last:mb-0">
            <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-surface-400">
              {category.label}
            </div>
            <div className="space-y-px">
              {category.commands.map((cmd) => (
                <button
                  key={cmd.command}
                  onClick={() => onCommand(cmd.command)}
                  className="w-full flex items-center gap-2.5 px-2 py-[7px] rounded-lg hover:bg-surface-100 transition-colors group text-left"
                >
                  <span className={`h-7 w-7 rounded-full ${cmd.iconBg} flex items-center justify-center text-sm shrink-0`}>
                    {cmd.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-[0.76rem] text-surface-700 group-hover:text-surface-900">
                      <span className="text-[#00C5DF]">/</span>{cmd.command.slice(1)}
                    </span>
                    <p className="text-[0.66rem] text-surface-400 leading-tight mt-0.5 truncate">
                      {cmd.description}
                    </p>
                  </div>
                  <span className="text-[0.6rem] px-2 py-0.5 rounded-full bg-surface-100 border border-surface-200 text-surface-500 shrink-0">
                    {cmd.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
