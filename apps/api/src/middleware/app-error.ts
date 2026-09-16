export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }

  static badRequest(message: string, details?: unknown): AppError {
    return new AppError(400, message, details);
  }

  static unauthorized(message = "Unauthorized"): AppError {
    return new AppError(401, message);
  }

  static forbidden(message = "Forbidden"): AppError {
    return new AppError(403, message);
  }

  static notFound(message = "Not found"): AppError {
    return new AppError(404, message);
  }

  static conflict(message: string): AppError {
    return new AppError(409, message);
  }

  static unprocessable(message: string, details?: unknown): AppError {
    return new AppError(422, message, details);
  }

  static internal(message = "Internal server error"): AppError {
    return new AppError(500, message);
  }
}
