export interface ServerErrorLog {
  id: number;
  created_at: string;
  source: 'http' | 'celery';
  level: string;
  logger_name: string;
  exception_type: string;
  message: string;
  traceback: string;
  request_method: string | null;
  request_path: string | null;
  status_code: number | null;
  task_name: string | null;
  task_id: string | null;
  user: number | null;
  extra: Record<string, unknown>;
}

export interface QueryStatSnapshot {
  id: number;
  captured_at: string;
  metric: 'total_time' | 'calls';
  query: string;
  calls: number;
  total_exec_time_ms: number;
  mean_exec_time_ms: number;
  rows: number;
}

export interface ClientErrorLog {
  id: number;
  created_at: string;
  source: 'error_boundary' | 'rtk_query' | 'window_onerror' | 'unhandled_rejection';
  level: string;
  message: string;
  stack: string;
  component_stack: string;
  url: string;
  user_agent: string;
  app_version: string | null;
  user: number | null;
  extra: Record<string, unknown>;
}
