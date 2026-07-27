export interface HealthStatus {
  status: string;
  app_name: string;
  version: string;
  environment: string;
}

export interface PhaseInfo {
  phase: number;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
}
