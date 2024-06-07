import { ForbiddenError } from "../core/ApiError.js";

export default authorization = (allowedRoles) => (req, res, next) => {
  const hasPermission = allowedRoles.some((role) => role === req.user.role);
  if (!hasPermission) return next(new ForbiddenError("Permission Denied"));
  next();
};
