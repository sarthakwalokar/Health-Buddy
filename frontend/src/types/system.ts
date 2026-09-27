export interface SystemStatus {
  status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
  api: string;
  database: string;
  timestamp: string;
}
