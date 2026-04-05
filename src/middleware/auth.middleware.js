import jwt from "jsonwebtoken";
import config from "../config/index.js";
import AppError from "../utils/AppError.js";

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Token not provided"));
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    req.user = decoded;
    next();
  } catch (error) {
    next(AppError.unauthorized("Invalid or expired token"));
  }
};

export default authenticate;
