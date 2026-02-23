import { LeadStatus } from '@/types';

const statusConfig: Record<LeadStatus, { label: string; bgColor: string; textColor: string; dotColor: string }> = {
  new: { label: 'New', bgColor: 'bg-blue-100', textColor: 'text-blue-800', dotColor: 'bg-blue-400' },
  contacted: { label: 'Contacted', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', dotColor: 'bg-yellow-400' },
  qualified: { label: 'Qualified', bgColor: 'bg-purple-100', textColor: 'text-purple-800', dotColor: 'bg-purple-400' },
  converted: { label: 'Converted', bgColor: 'bg-green-100', textColor: 'text-green-800', dotColor: 'bg-green-400' },
  lost: { label: 'Lost', bgColor: 'bg-surface-100', textColor: 'text-surface-800', dotColor: 'bg-surface-400' },
};

interface StatusBadgeProps {
  status: LeadStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}
