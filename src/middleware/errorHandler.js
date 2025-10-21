const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Check if it's an API request
  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Render error page for web requests
  res.status(statusCode).render('error', {
    message,
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
};

const notFound = (req, res, next) => {
  const err = new Error('Page Not Found');
  err.statusCode = 404;
  next(err);
};

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  notFound,
  AppError,
};
