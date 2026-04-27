import { db } from "../db/index.js";
import { passwordResetTokens, users } from "../db/schema.js";
import { configDotenv } from "dotenv";
import { and, eq, gt, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  generateOTP,
  resetPasswordSendEmail,
  send2FAEmail,
  sendEmail,
  isValidEmail,
  sendWelcomeEmail,
} from "../config/mail.js";
import crypto from "crypto";

configDotenv();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict",
  maxAge: 15 * 24 * 60 * 60 * 1000,
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "20d",
  });
};

const generateVerifyToken = (id, otp) => {
  return jwt.sign({ id, otp }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};
export async function getMe(req, res) {
  try {
    const userId = req.user.id;

    // Use Drizzle to find the user by ID
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        provider: users.provider,
        isVerified: users.isVerified,
        twoFactorEnabled: users.twoFactorEnabled,
        createdAt: users.createdAt,
        // Explicitly list fields you want to return, excluding passwordHash
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        err: "User not found",
      });
    }

    res.status(200).json({
      message: "User details fetched successfully",
      success: true,
      user,
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
}
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Strict email validation
    if (!isValidEmail(email)) {
      // Return structured field-level error for the frontend to map to the email input
      return res.status(400).json({
        errors: {
          email: ["Invalid email address. Please use a valid email."],
        },
      });
    }

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser) {
      // Provide structured field error so the frontend can display it inline
      return res.status(400).json({
        errors: {
          email: ["User already exists."],
        },
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [newUser] = await db
      .insert(users)
      .values({
        name: name,
        email: email,
        passwordHash: hashedPassword,
        provider: "email",
        isVerified: true,
      })
      .returning();

    await db
      .insert(passwordResetTokens)
      .values({
        userId: newUser.id,
      })
      .returning();

    // Send welcome email
    await sendWelcomeEmail({ to: email, name: name });

    const token = generateToken(newUser.id);
    res.cookie("token", token, cookieOptions);
    // Return the newly created user object (excluding sensitive fields like passwordHash)
    const userToReturn = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      provider: newUser.provider,
      isVerified: newUser.isVerified,
      twoFactorEnabled: newUser.twoFactorEnabled,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
    return res.status(201).json({
      message:
        "Account created successfully! Welcome to Aura Search. Check your email for a welcome message.",
      success: true,
      user: userToReturn,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong while signing up" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [userExist] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!userExist) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const validUser = await bcrypt.compare(password, userExist.passwordHash);
    if (!validUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (userExist.twoFactorEnabled) {
      const otp = generateOTP();
      await db
        .update(users)
        .set({
          twoFactorSecret: otp,
          tfA_expiresAT: new Date(Date.now() + 5 * 60 * 1000),
        })
        .where(eq(users.id, userExist.id));

      console.log(email);
      console.log(otp);
      await send2FAEmail({ to: email, code: otp });

      const tempToken = jwt.sign(
        {
          id: userExist.id,
          role: "partial_auth",
        },
        process.env.JWT_SECRET,
        { expiresIn: "5m" },
      );
      return res.status(200).json({
        message: "2FA Code sent",
        tempToken: tempToken,
      });
    }

    const token = generateToken(userExist.id);
    res.cookie("token", token, cookieOptions);
    return res.status(201).json({
      message: "Login successfully",
      success: true,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("token", "", { ...cookieOptions, maxAge: 1 });
    res.json({ message: "logged out sucessfully " });
  } catch (error) {
    console.error("Logout error ", error);
    return res.status(500).json({
      message: "Something went wrong while logout",
    });
  }
};

export const verify = async (req, res) => {
  try {
    const id = req.user.id;
    // All users are verified on signup now, so this endpoint is deprecated
    // Kept for backward compatibility
    const token = generateToken(id);
    res.cookie("token", token, cookieOptions);
    return res.status(200).json({
      message: "User already verified",
      success: true,
    });
  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const [user] = await db
      .select()
      .from(users)
      .where(eq(email, users.email))
      .limit(1);
    if (!user) {
      // Structured error for invalid user lookup during password reset/forgot flow
      return res.status(401).json({
        errors: {
          email: ["Invalid user credentials."],
        },
        message: "Invalid User credentials",
      });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    await db
      .update(passwordResetTokens)
      .set({
        tokenHash: hashedToken,
        expiresAt: oneHourFromNow,
      })
      .where(eq(passwordResetTokens.userId, user.id));
    const resetUrl = `http://localhost:3000/api/auth/resetPassword/${resetToken}`;
    await resetPasswordSendEmail({ to: user.email, resetUrl: resetUrl });
    res.status(200).json({ message: "Reset link sent to email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const [user] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, hashedToken),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      );
    if (!user) {
      // Token is invalid/expired — return a structured error keyed to token
      return res.status(401).json({
        errors: {
          token: ["Token is invalid or expired."],
        },
        message: "Token is invalid or expired",
      });
    }
    const password = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({ passwordHash: password })
      .where(eq(user.userId, users.id));
    await db
      .update(passwordResetTokens)
      .set({ tokenHash: null })
      .where(eq(passwordResetTokens.userId, user.userId));
    res
      .status(200)
      .json({ message: "Password reset successful! You can now login." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const twoFactorAuth = async (req, res) => {
  try {
    const { input } = req.body;
    const id = req.user.id;
    console.log(id);
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    console.log(user);
    if (user.isVerified) {
      if (input) {
        await db
          .update(users)
          .set({ twoFactorEnabled: true })
          .where(eq(users.id, id));
        return res
          .status(201)
          .send({ message: "Two Factor Authentication is now enabled" });
      }
      await db
        .update(users)
        .set({ twoFactorEnabled: false })
        .where(eq(users.id, id));
      return res
        .status(201)
        .send({ message: "Two Factor Authentication is now Disabled" });
    } else {
      return res.status(403).json({
        message: "Please verify your email to access this feature.",
        //nextStep: "/verify-otp"
      });
    }
  } catch (error) {
    console.error("Two Factor Authentication Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verify2FAcode = async (req, res) => {
  try {
    const { code, tempToken } = req.body;
    if (!code || !tempToken) {
      return res.status(404).json({ message: "Code and Token are required  " });
    }

    const decodeToken = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (decodeToken.role !== "partial_auth") {
      return res.status(401).json({
        message: "Invalid Token or Session expired. Please login again.",
      });
    }
    const userId = decodeToken.id;
    const [record] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, userId),
          eq(users.twoFactorSecret, code),
          gt(users.tfA_expiresAT, new Date()),
        ),
      );
    if (!record) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    await db
      .update(users)
      .set({ twoFactorSecret: null, tfA_expiresAT: null })
      .where(eq(users.id, userId));
    const token = generateToken(userId);
    res.cookie("token", token, cookieOptions);
    return res.status(200).json({ message: "2FA Verified. Login complete." });
  } catch (error) {
    console.error("verify 2fA code  Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
