interface SplitPanelProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export function SplitPanel({ left, right }: SplitPanelProps) {
  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div className="w-full lg:w-[60%] border-b lg:border-b-0 lg:border-r border-surface-200 flex flex-col min-h-0">
        {left}
      </div>
      <div className="w-full lg:w-[40%] flex flex-col min-h-0">
        {right}
      </div>
    </div>
  );
}
