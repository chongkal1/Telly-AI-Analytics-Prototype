interface ReportSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ReportSection({ title, children }: ReportSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{title}</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      {children}
    </div>
  );
}
