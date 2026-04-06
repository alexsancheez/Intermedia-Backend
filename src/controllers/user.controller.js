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
      .select("-password -verificationCode -verificationAttempts")
      .populate("company");

    if (!user) {
      return next(AppError.notFound("User not found"));
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};
