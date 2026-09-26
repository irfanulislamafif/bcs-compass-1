import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";
import { sendPasswordResetEmail } from "../utils/email.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req, res, next) {
  try {
    const { name, email, password, targetExam } = req.body || {};

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required." });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Invalid email address." });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      targetExam: targetExam || "BCS",
    });

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    res.status(201).json({
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    res.json({
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required." });
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ message: "Invalid refresh token." });
    }
    if (payload.type !== "refresh") {
      return res.status(401).json({ message: "Invalid token type." });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    const accessToken = signAccessToken(user._id.toString());
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

import crypto from "crypto";
import { sendPasswordResetEmail } from "../utils/email.js";

/* ------------------------------------------------------------------ */
/*  POST /api/auth/change-password                                    */
/*  Body: { currentPassword, newPassword }                            */
/*  Requires: logged-in user                                          */
/* ------------------------------------------------------------------ */

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password are required." });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters." });
    }
    if (currentPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "New password must be different from current." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ ok: true, message: "Password changed successfully." });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/auth/forgot-password                                    */
/*  Body: { email }                                                   */
/*  Always returns 200 (does not reveal whether email exists)         */
/* ------------------------------------------------------------------ */

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    /* Always respond the same way — do not reveal if the email exists */
    const genericResponse = {
      ok: true,
      message:
        "If that email is registered, you will receive a password reset link shortly.",
    };

    if (!user) {
      return res.json(genericResponse);
    }

    /* Generate token */
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetTokenHash = tokenHash;
    user.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    await user.save();

    /* Build reset URL — use the first allowed origin */
    const origins = (process.env.CLIENT_URL || "http://localhost:5173")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const base = origins[0] || "http://localhost:5173";
    const resetUrl = `${base}/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        userName: user.name,
      });
    } catch (emailErr) {
      /* Log but don't fail the request — the user gets the generic response anyway */
      console.error("Failed to send reset email:", emailErr.message);
    }

    res.json(genericResponse);
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/auth/reset-password                                     */
/*  Body: { token, newPassword }                                      */
/* ------------------------------------------------------------------ */

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body || {};

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Reset token is required." });
    }
    if (!newPassword || newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetTokenHash: tokenHash,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "This reset link is invalid or has expired." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetTokenHash = null;
    user.resetTokenExpires = null;
    await user.save();

    res.json({ ok: true, message: "Password reset successfully." });
  } catch (err) {
    next(err);
  }
}
