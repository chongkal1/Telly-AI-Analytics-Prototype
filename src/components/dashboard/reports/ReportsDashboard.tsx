'use client';

import { useState, useMemo } from 'react';
import { getAllReports, getReport } from '@/data/reports';
import { ReportList } from './ReportList';
import { ReportDetail } from './ReportDetail';

export function ReportsDashboard() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const reports = useMemo(() => getAllReports(), []);
  const selectedReport = useMemo(
    () => selectedReportId ? getReport(selectedReportId) : undefined,
    [selectedReportId],
  );

  if (selectedReport) {
    return <ReportDetail report={selectedReport} onBack={() => setSelectedReportId(null)} />;
  }

  return <ReportList reports={reports} onSelect={setSelectedReportId} />;
}
