import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Company from "../models/Company.js";
import config from "../config/index.js";
import AppError from "../utils/AppError.js";
import notificationService from "../services/notification.service.js";

const generateTokens = (user) => {
  const payload = { id: user._id, email: user.email, role: user.role };

  const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry,
  });

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  });

  return { accessToken, refreshToken };
};

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.status === "verified") {
      return next(AppError.conflict("Email already registered"));
    }

    if (existingUser) {
      await existingUser.deleteOne();
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = await User.create({
      email,
      password: hashedPassword,
      verificationCode,
      verificationAttempts: 3,
    });

    notificationService.emit("user:registered", user);

    const tokens = generateTokens(user);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(201).json({
      user: { email: user.email, status: user.status, role: user.role },
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

export const validateEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(AppError.notFound("User not found"));
    }

    if (user.verificationAttempts <= 0) {
      return next(AppError.tooManyRequests("No verification attempts remaining"));
    }

    if (req.body.code !== user.verificationCode) {
      user.verificationAttempts -= 1;
      await user.save();
      return next(AppError.badRequest("Invalid verification code"));
    }

    user.status = "verified";
    await user.save();

    notificationService.emit("user:verified", user);

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(AppError.unauthorized("Invalid credentials"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(AppError.unauthorized("Invalid credentials"));
    }

    const tokens = generateTokens(user);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      user: {
        email: user.email,
        status: user.status,
        role: user.role,
        name: user.name,
        lastName: user.lastName,
      },
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePersonalData = async (req, res, next) => {
  try {
    const { name, lastName, nif } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, lastName, nif },
      { new: true }
    );

    if (!user) {
      return next(AppError.notFound("User not found"));
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(AppError.notFound("User not found"));
    }

    let companyData = req.body;

    if (companyData.isFreelance) {
      companyData = {
        name: user.name + " " + user.lastName,
        cif: user.nif,
        address: user.address,
        isFreelance: true,
      };
    }

    const existingCompany = await Company.findOne({ cif: companyData.cif });

    if (existingCompany) {
      user.company = existingCompany._id;
      user.role = "guest";
      await user.save();

      return res.json({ user, company: existingCompany });
    }

    const company = await Company.create({
      ...companyData,
      owner: user._id,
    });

    user.company = company._id;
    await user.save();

    res.status(201).json({ user, company });
  } catch (error) {
    next(error);
  }
};

export const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(AppError.badRequest("No file uploaded"));
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.company) {
      return next(AppError.badRequest("User has no company assigned"));
    }

    const company = await Company.findByIdAndUpdate(
      user.company,
      { logo: req.file.path },
      { new: true }
    );

    res.json({ company });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -verificationCode -verificationAttempts -refreshToken")
      .populate("company");

    if (!user) {
      return next(AppError.notFound("User not found"));
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const refreshSession = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(AppError.badRequest("Refresh token is required"));
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch (err) {
      return next(AppError.unauthorized("Invalid or expired refresh token"));
    }

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return next(AppError.unauthorized("Invalid refresh token"));
    }

    const tokens = generateTokens(user);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json(tokens);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(AppError.notFound("User not found"));
    }

    user.refreshToken = null;
    await user.save();

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const isSoft = req.query.soft === "true";

    if (isSoft) {
      await User.findByIdAndUpdate(req.user.id, { deleted: true });
    } else {
      await User.findByIdAndDelete(req.user.id);
    }

    notificationService.emit("user:deleted", { email: req.user.email });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const inviteUser = async (req, res, next) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin || !admin.company) {
      return next(AppError.badRequest("User has no company assigned"));
    }

    const { email, password, name, lastName, nif } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(AppError.conflict("Email already registered"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      lastName,
      nif,
      role: "guest",
      status: "verified",
      company: admin.company,
    });

    notificationService.emit("user:invited", user);

    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(AppError.notFound("User not found"));
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return next(AppError.unauthorized("Current password is incorrect"));
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};
