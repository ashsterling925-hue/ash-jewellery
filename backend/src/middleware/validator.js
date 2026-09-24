/**
 * Request Validation Middleware Helpers using Zod
 */
import { validate } from "../validators/validate.middleware.js";

export { validate };

export function validateBody(schema) {
  return validate({ body: schema });
}

export function validateQuery(schema) {
  return validate({ query: schema });
}

export function validateParams(schema) {
  return validate({ params: schema });
}

export default {
  validate,
  validateBody,
  validateQuery,
  validateParams,
};
