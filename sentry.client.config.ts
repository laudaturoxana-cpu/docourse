import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // Capture 100% in dev, 10% in production (adjust as needed)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  // Never send PII
  sendDefaultPii: false,
  beforeSend(event) {
    // Strip sensitive headers from request context
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
    }
    return event;
  },
});
