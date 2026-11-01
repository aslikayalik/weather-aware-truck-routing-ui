type ClientErrorSource = 'error_boundary' | 'rtk_query' | 'window_onerror' | 'unhandled_rejection';

interface ReportClientErrorInput {
  source: ClientErrorSource;
  message: string;
  stack?: string;
  component_stack?: string;
  extra?: Record<string, unknown>;
}

const THROTTLE_WINDOW_MS = 10_000;
const THROTTLE_MAX_PER_WINDOW = 5;
let windowStart = 0;
let windowCount = 0;

const isThrottled = (): boolean => {
  const now = Date.now();
  if (now - windowStart > THROTTLE_WINDOW_MS) {
    windowStart = now;
    windowCount = 0;
  }
  windowCount += 1;
  return windowCount > THROTTLE_MAX_PER_WINDOW;
};

/**
 * Reads the access token from the auth slice that redux-persist stores under the 'root' key
 * (persist:root -> auth -> accessToken). The Redux store is not imported because
 * store.ts loads this middleware chain (error-middleware.ts), which would make it depend
 * on this file and create a circular import; reading from localStorage keeps this
 * completely independent of the store.
 */
const readAccessTokenFromStorage = (): string | null => {
  try {
    const persistedRoot = localStorage.getItem('persist:root');
    if (!persistedRoot) return null;
    const rootObj = JSON.parse(persistedRoot);
    if (!rootObj?.auth) return null;
    const authObj = JSON.parse(rootObj.auth);
    return authObj?.accessToken ?? null;
  } catch {
    return null;
  }
};

/**
 * Persists client errors on the backend (system-logs/client/).
 * Sent with plain fetch, NOT through baseApi/RTK Query: baseQueryWithReauth
 * has its own 401-retry loop, so a crash caused by an auth loop could recurse.
 * This function never throws and never updates state.
 */
export const reportClientError = (input: ReportClientErrorInput): void => {
  try {
    if (isThrottled()) return;

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost/api/v1/';
    const accessToken = readAccessTokenFromStorage();

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const body = JSON.stringify({
      source: input.source,
      message: input.message?.toString().slice(0, 10_000) ?? '',
      stack: input.stack?.toString().slice(0, 20_000) ?? '',
      component_stack: input.component_stack?.toString().slice(0, 20_000) ?? '',
      url: typeof window !== 'undefined' ? window.location.href : '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      extra: input.extra ?? {},
    });

    fetch(`${apiUrl}system-logs/client/`, {
      method: 'POST',
      headers,
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // reporting must never break the app
  }
};
