/**
 * Sentry initialisation module.
 * Import this file as the very first side-effect in any entry point to ensure
 * error reporting is active before any application code runs.
 */
import * as Sentry from '@sentry/node';
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'production',
});
//# sourceMappingURL=instrument.js.map