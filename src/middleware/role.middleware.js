import AppError from "../utils/AppError.js";

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(AppError.forbidden("Insufficient permissions"));
  }
  next();
};

export default authorize;
