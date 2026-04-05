import { Router } from "express";
import { register, validateEmail, login } from "../controllers/user.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import {
  registerSchema,
  validationSchema,
  loginSchema,
} from "../validators/user.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.put("/validation", authenticate, validate(validationSchema), validateEmail);
router.post("/login", validate(loginSchema), login);

export default router;
