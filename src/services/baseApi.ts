import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { RootState } from '@store/store';
import { TokenPayload, logout, refreshToken } from '@store/slices/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL,
  prepareHeaders(headers, { getState }) {
    const accessToken = (getState() as RootState).auth.accessToken;

    // If we have a token set in state, let's assume that we should be passing it for every request
    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`);
    }

    return headers;
  },
});

// Create a mutex to prevent multiple requests to refresh the token
const mutex = new Mutex();

/**
 * See: https://redux-toolkit.js.org/rtk-query/usage/customizing-queries#automatic-re-authorization-by-extending-fetchbasequery
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  // Wait for the mutex to unlock before continuing
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  const isSessionTerminated =
    result.error && result.error.status === 401 && (result.error.data as any)?.code === 'session_terminated';

  if (isSessionTerminated) {
    // The backend ended the session (login/logout elsewhere); refreshing is pointless, so log out directly.
    // Note: resetApiState() is deliberately NOT used - the login page's captcha also goes through baseApi.
    sessionStorage.setItem('session_terminated_message', 'Your session has ended. Please sign in again.');
    api.dispatch(logout());
    return result;
  }

  if (result.error && result.error.status === 401 && (api.getState() as RootState).auth.refreshToken) {
    // Checking if the mutux is locked before trying to re-authenticate
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        // try to get a new token
        const refreshResult = await baseQuery(
          {
            url: 'auth/token/refresh/',
            method: 'POST',
            body: {
              refresh: (api.getState() as RootState).auth.refreshToken,
            },
          },
          api,
          extraOptions,
        );
        if (refreshResult.data) {
          // If the refresh was successful, we update the auth state
          api.dispatch(refreshToken(refreshResult.data as TokenPayload));

          // And then we re-run the initial query
          result = await baseQuery(args, api, extraOptions);
        } else {
          // If the refresh failed, we log the user out
          api.dispatch(logout());
        }
      } finally {
        // Release the mutex
        release();
      }
    } else {
      // wait until the mutex is unlocked
      await mutex.waitForUnlock();

      // re-run the initial query
      result = await baseQuery(args, api, extraOptions);
    }
  } else if (result.error && result.error.status === 401) {
    // If the refresh failed, we log the user out
    api.dispatch(logout());
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'privateApi',
  baseQuery: baseQueryWithReauth,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
  tagTypes: [
    'AdminUser',
    'AdminUserGroup',
    'UserAndGroupSearch',
    'User',
    'UserRole',
    'UserSettings',
    'ServerLog',
    'ClientLog',
    'QueryStatLog',
  ],
});

export const baseApiPublic = createApi({
  reducerPath: 'publicApi',
  baseQuery,
  endpoints: () => ({}),
});