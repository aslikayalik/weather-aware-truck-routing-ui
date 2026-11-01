import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import store, { persistor } from '@app/store/store';
import ErrorBoundary from '@app/shared/error/error-boundary';
import AppComponent from '@app/app';
import { loadIcons } from '@app/config/icon-loader';
import { reportClientError } from '@app/shared/error/reportClientError';

loadIcons();

window.addEventListener('error', event => {
  reportClientError({
    source: 'window_onerror',
    message: event.message || event.error?.toString() || 'Unknown window error',
    stack: event.error?.stack,
  });
});

window.addEventListener('unhandledrejection', event => {
  const reason = event.reason;
  reportClientError({
    source: 'unhandled_rejection',
    message: reason?.message ?? reason?.toString() ?? 'Unhandled promise rejection',
    stack: reason?.stack,
  });
});

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element not found');
}

createRoot(rootEl).render(
  <ErrorBoundary>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppComponent />
      </PersistGate>
    </Provider>
  </ErrorBoundary>,
);
