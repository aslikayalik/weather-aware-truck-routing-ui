import { reportClientError } from '@app/shared/error/reportClientError';

const getErrorMessage = errorData => {
  let message = errorData.message;
  if (errorData.fieldErrors) {
    errorData.fieldErrors.forEach(fErr => {
      message += `\nfield: ${fErr.field},  Object: ${fErr.objectName}, message: ${fErr.message}\n`;
    });
  }
  return message;
};

export default () => next => action => {
  /**
   *
   * The error middleware serves to log error messages from dispatch
   * It need not run in production
   */
  const { error } = action;
  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`${action.type} caught at middleware with reason: ${JSON.stringify(error.message)}.`);
      if (error.response && error.response.data) {
        const message = getErrorMessage(error.response.data);
        console.error(`Actual cause: ${message}`);
      }
    }
    // Harmless aborts that RTK Query issues for condition/dedup reasons (not real
    // API errors) are not reported - otherwise every skipped query would add noise.
    const isBenignAbort = error.name === 'ConditionError' || String(error.message ?? '').includes('condition callback returning false');
    if (!isBenignAbort) {
      reportClientError({
        source: 'rtk_query',
        message: error.message ?? `${action.type} failed`,
        extra: { actionType: action.type, status: error.status ?? error.originalStatus },
      });
    }
  }
  // Dispatch initial action
  return next(action);
};
