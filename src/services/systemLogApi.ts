import { baseApi } from './baseApi';
import type { ServerErrorLog, ClientErrorLog, QueryStatSnapshot } from '../types/systemLog';

export interface ServerErrorLogListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ServerErrorLog[];
}

export interface ClientErrorLogListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ClientErrorLog[];
}

export interface QueryStatSnapshotListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: QueryStatSnapshot[];
}

export interface ServerErrorLogFilterParams {
  source?: string;
  level?: string;
  exception_type?: string;
  message?: string;
  request_path?: string;
  task_name?: string;
  created_at_from?: string;
  created_at_to?: string;
  ordering?: string;
  page?: number;
  rowsPerPage?: number;
}

export interface ClientErrorLogFilterParams {
  source?: string;
  level?: string;
  message?: string;
  url?: string;
  created_at_from?: string;
  created_at_to?: string;
  ordering?: string;
  page?: number;
  rowsPerPage?: number;
}

export interface QueryStatSnapshotFilterParams {
  metric?: string;
  query?: string;
  captured_at_from?: string;
  captured_at_to?: string;
  ordering?: string;
  page?: number;
  rowsPerPage?: number;
}

const buildParams = (filters: Record<string, string | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  return params;
};

export const systemLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServerLogs: builder.query<ServerErrorLogListResponse, ServerErrorLogFilterParams>({
      query({ page = 0, rowsPerPage = 100, ...filters }) {
        const params = buildParams(filters);
        params.append('limit', String(Math.min(rowsPerPage, 1000)));
        params.append('offset', String(page * rowsPerPage));
        return `system-logs/server/?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'ServerLog' as const, id })),
              { type: 'ServerLog', id: 'LIST' },
            ]
          : [{ type: 'ServerLog', id: 'LIST' }],
    }),
    getClientLogs: builder.query<ClientErrorLogListResponse, ClientErrorLogFilterParams>({
      query({ page = 0, rowsPerPage = 100, ...filters }) {
        const params = buildParams(filters);
        params.append('limit', String(Math.min(rowsPerPage, 1000)));
        params.append('offset', String(page * rowsPerPage));
        return `system-logs/client/?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'ClientLog' as const, id })),
              { type: 'ClientLog', id: 'LIST' },
            ]
          : [{ type: 'ClientLog', id: 'LIST' }],
    }),
    getQueryStats: builder.query<QueryStatSnapshotListResponse, QueryStatSnapshotFilterParams>({
      query({ page = 0, rowsPerPage = 100, ...filters }) {
        const params = buildParams(filters);
        params.append('limit', String(Math.min(rowsPerPage, 1000)));
        params.append('offset', String(page * rowsPerPage));
        return `system-logs/query-stats/?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'QueryStatLog' as const, id })),
              { type: 'QueryStatLog', id: 'LIST' },
            ]
          : [{ type: 'QueryStatLog', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetServerLogsQuery, useGetClientLogsQuery, useGetQueryStatsQuery } = systemLogApi;
