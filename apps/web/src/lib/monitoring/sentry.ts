/**
 * Sentry monitoring stub
 * TODO: Install @sentry/nextjs for production error tracking
 */

// Stub implementation for zero-dependency compilation
const Sentry = {
  init: () => {},
  captureException: (error: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Sentry stub]', error);
    }
  },
  captureMessage: (message: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Sentry stub]', message);
    }
  },
};

export { Sentry };

