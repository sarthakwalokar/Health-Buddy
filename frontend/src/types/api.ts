export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ErrorResponse {
  success: boolean;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  database: string;
  timestamp: string;
}
