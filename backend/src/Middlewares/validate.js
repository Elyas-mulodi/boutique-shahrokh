import ApiError from "../Utils/ApiError.js";

const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return next(ApiError.badRequest("اطلاعات ارسالی نامعتبر است", errors));
  }

  req[source] = result.data;
  next();
};

export default validate;