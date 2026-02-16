interface ReportNarrativeProps {
  text: string;
}

export function ReportNarrative({ text }: ReportNarrativeProps) {
  const paragraphs = text.split('\n\n').filter(Boolean);

  return (
    <div className="border-l-2 border-indigo-200 bg-indigo-50/40 rounded-r-lg px-4 py-3 space-y-3">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-sm text-gray-700 leading-relaxed">
          {p}
        </p>
      ))}
    </div>
  );
}
