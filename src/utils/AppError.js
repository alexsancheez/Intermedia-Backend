class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }

  static badRequest(message) {
    return new AppError(message || "Bad request", 400);
  }

  static unauthorized(message) {
    return new AppError(message || "Unauthorized", 401);
  }

  static forbidden(message) {
    return new AppError(message || "Forbidden", 403);
  }

  static notFound(message) {
    return new AppError(message || "Not found", 404);
  }

  static conflict(message) {
    return new AppError(message || "Conflict", 409);
  }

  static tooManyRequests(message) {
    return new AppError(message || "Too many requests", 429);
  }
}

export default AppError;
