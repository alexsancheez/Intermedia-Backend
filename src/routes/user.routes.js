import { Router } from "express";
import { register, validateEmail, login, updatePersonalData, updateCompany, uploadLogo, getUser } from "../controllers/user.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import upload from "../middleware/upload.js";
import {
  registerSchema,
  validationSchema,
  loginSchema,
  personalDataSchema,
  companySchema,
} from "../validators/user.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.put("/validation", authenticate, validate(validationSchema), validateEmail);
router.post("/login", validate(loginSchema), login);
router.put("/register", authenticate, validate(personalDataSchema), updatePersonalData);
router.patch("/company", authenticate, validate(companySchema), updateCompany);
router.patch("/logo", authenticate, upload.single("logo"), uploadLogo);
router.get("/", authenticate, getUser);

export default router;
