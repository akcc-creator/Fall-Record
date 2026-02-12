import { IncidentReport } from '../types';

export const generateCSV = (report: IncidentReport): string => {
  const headers = ['住客姓名', '發生日期', '發生時間', '地點', '有否受傷', '傷勢詳情', '有否送院', '事發經過', '原因分析', '建議跟進'];
  const values = [
    report.residentName,
    report.incidentDate,
    report.incidentTime,
    report.location,
    report.hasInjury,
    report.injuryDetails,
    report.hospitalizationStatus,
    report.description,
    report.rootCauseAnalysis,
    report.suggestedAction,
  ];

  // Escape quotes and wrap in quotes to handle commas within fields
  const csvRow = values.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',');
  const csvHeader = headers.join(',');

  return `${csvHeader}\n${csvRow}`;
};

export const downloadCSV = (report: IncidentReport) => {
  const csvContent = "\uFEFF" + generateCSV(report); // Add BOM for Excel Chinese support
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  // Format filename with date
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `意外報告_${report.residentName.replace(/\s+/g, '_')}_${dateStr}.csv`);
  
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const copyToClipboard = async (report: IncidentReport): Promise<boolean> => {
   const values = [
    report.residentName,
    report.incidentDate,
    report.incidentTime,
    report.location,
    report.hasInjury,
    report.injuryDetails,
    report.hospitalizationStatus,
    report.description,
    report.rootCauseAnalysis,
    report.suggestedAction,
  ];
  // Tab separated for easy paste into Excel/Sheets
  const text = values.join('\t');
  
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy', err);
    return false;
  }
};