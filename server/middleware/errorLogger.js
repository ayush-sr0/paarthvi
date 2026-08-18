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
       WHERE message = ? AND endpoint IS ?`,
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

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const message = err.message || 'Internal Server Error';
  const endpoint = `${req.method} ${req.originalUrl}`;

  logSystemError({
    severity: statusCode >= 500 ? 'CRITICAL' : 'ERROR',
    category: 'BACKEND',
    message,
    stack_trace: process.env.NODE_ENV === 'development' ? err.stack : null,
    endpoint,
    user_id: req.user ? req.user.id : null,
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
