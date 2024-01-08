// Custom error/exception handler
class AppError extends Error {
  // This custom error handler has access to built-in Error class.
  constructor(message, statusCode) {
    super(message); // Built-in Error Class has 'message' as the constructor.

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Operational errors are user-generated, not system or server generated.

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
