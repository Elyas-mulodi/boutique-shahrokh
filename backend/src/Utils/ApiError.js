class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "درخواست نامعتبر است", errors = []) {
    return new ApiError(400, message, errors);
  }
  static unauthorized(message = "احراز هویت انجام نشده است") {
    return new ApiError(401, message);
  }
  static forbidden(message = "دسترسی غیرمجاز است") {
    return new ApiError(403, message);
  }
  static notFound(message = "مورد درخواستی یافت نشد") {
    return new ApiError(404, message);
  }
  static conflict(message = "این مورد قبلا ثبت شده است") {
    return new ApiError(409, message);
  }
}

export default ApiError;