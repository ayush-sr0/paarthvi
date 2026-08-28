import { run } from '../db/database.js';

export const logSystemError = async ({
  severity = 'ERROR',
  category = 'BACKEND',
  message,
  stack_trace = null,
  endpoint = null,
  user_id = null
}) => {
  try {
    const existing = await run(
      `UPDATE error_logs
       SET occurrence_count = occurrence_count + 1, timestamp = CURRENT_TIMESTAMP
       WHERE message = ? AND endpoint IS NOT DISTINCT FROM ?`,
      [message, endpoint]
    );


    if (!existing.changes) {
      await run(
        `INSERT INTO error_logs (severity, category, message, stack_trace, endpoint, status)
         VALUES (?, ?, ?, ?, ?, 'NEW')`,
        [severity, category, message, stack_trace, endpoint]
      );
    }
  } catch (err) {
    console.error('Failed to write to error_logs table:', err);
  }
};

/**
 * Patterns that indicate an internal infrastructure error whose raw message
 * must not be sent to clients outside of development.
 */
const INFRA_ERROR_PATTERNS = [
  /ENOTFOUND/,
  /ECONNREFUSED/,
  /ECONNRESET/,
  /ETIMEDOUT/,
  /getaddrinfo/,
  /pooler\.supabase\.com/,
  /postgresql:/i,
  /pg error/i,
];

const sanitizeErrorMessage = (message) => {
  if (process.env.NODE_ENV === 'development') return message;
  const isInfra = INFRA_ERROR_PATTERNS.some((re) => re.test(message));
  return isInfra ? 'Service temporarily unavailable. Please try again.' : message;
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const rawMessage = err.message || 'Internal Server Error';
  const endpoint = `${req.method} ${req.originalUrl}`;

  logSystemError({
    severity: statusCode >= 500 ? 'CRITICAL' : 'ERROR',
    category: 'BACKEND',
    message: rawMessage,
    stack_trace: process.env.NODE_ENV === 'development' ? err.stack : null,
    endpoint,
    user_id: req.user ? req.user.id : null,
  });

  res.status(statusCode).json({
    success: false,
    error: sanitizeErrorMessage(rawMessage),
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
