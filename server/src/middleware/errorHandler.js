/**
 * Centralised Express error handler.
 * Must be registered AFTER all routes (four-argument signature required by Express).
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500

  // MulterError — file too large, unexpected field, etc.
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`,
    })
  }

  // CORS rejection
  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ success: false, error: err.message })
  }

  // Log server-side errors (500s) but don't leak internals to the client
  if (status >= 500) {
    console.error('[DeepDive] Unhandled error:', err)
  }

  res.status(status).json({
    success: false,
    error: status < 500 ? err.message : 'Internal server error',
  })
}
