import { Router } from "express";
import { register, validateEmail, login, updatePersonalData, updateCompany, uploadLogo, getUser, refreshSession, logout, deleteUser, inviteUser, changePassword } from "../controllers/user.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import authorize from "../middleware/role.middleware.js";
import upload from "../middleware/upload.js";
import {
  registerSchema,
  validationSchema,
  loginSchema,
  personalDataSchema,
  companySchema,
  inviteSchema,
  changePasswordSchema,
} from "../validators/user.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.put("/validation", authenticate, validate(validationSchema), validateEmail);
router.post("/login", validate(loginSchema), login);
router.put("/register", authenticate, validate(personalDataSchema), updatePersonalData);
router.patch("/company", authenticate, validate(companySchema), updateCompany);
router.patch("/logo", authenticate, upload.single("logo"), uploadLogo);
router.get("/", authenticate, getUser);
router.post("/refresh", refreshSession);
router.post("/logout", authenticate, logout);
router.delete("/", authenticate, deleteUser);
router.post("/invite", authenticate, authorize("admin"), validate(inviteSchema), inviteUser);
router.put("/password", authenticate, validate(changePasswordSchema), changePassword);

export default router;
