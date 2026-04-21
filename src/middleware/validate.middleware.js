import { ZodError } from "zod";
import { ApiError } from "../utils/apiError.js";

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      console.log(err.issues);

      const message = Array.isArray(err.issues)
        ? err.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
        : err.message;
      return next(new ApiError(`خطأ في البيانات المدخلة: ${message}`, 400));
    }
    next(new ApiError(`خطأ في البيانات المدخلة: ${err.message}`, 500));
  }
};

export default validate;
