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
      const message = err.errors
        .map((e) => `${e.path.slice(1).join(".")}: ${e.message}`)
        .join(", ");
      return next(new ApiError(message, 400));
    }
    next(err);
  }
};

export default validate;
