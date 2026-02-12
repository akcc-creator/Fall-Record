export interface IncidentReport {
  id: string;
  createdAt: number;
  residentName: string;
  incidentDate: string;
  incidentTime: string;
  location: string;
  description: string;
  hasInjury: string;       // '有' or '沒有'
  injuryDetails: string;   // Description of injury
  hospitalizationStatus: string; // '有' or '沒有'
  rootCauseAnalysis: string;
  suggestedAction: string;
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  REVIEW = 'REVIEW',
  SUCCESS = 'SUCCESS',
}

export interface ProcessingState {
  status: 'idle' | 'analyzing' | 'error';
  errorMessage?: string;
}