import { IncidentReport } from '../types';

const STORAGE_KEY = 'safety_lens_history';

export const getStoredReports = (): IncidentReport[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load reports', error);
    return [];
  }
};

export const saveReport = (report: IncidentReport): IncidentReport[] => {
  try {
    const reports = getStoredReports();
    // Check if report already exists (update), otherwise add new
    const existingIndex = reports.findIndex(r => r.id === report.id);
    
    let updatedReports;
    if (existingIndex >= 0) {
      updatedReports = [...reports];
      updatedReports[existingIndex] = report;
    } else {
      updatedReports = [report, ...reports];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReports));
    return updatedReports;
  } catch (error) {
    console.error('Failed to save report', error);
    return [];
  }
};

export const deleteReport = (id: string): IncidentReport[] => {
  try {
    const reports = getStoredReports();
    const updatedReports = reports.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReports));
    return updatedReports;
  } catch (error) {
    console.error('Failed to delete report', error);
    return [];
  }
};