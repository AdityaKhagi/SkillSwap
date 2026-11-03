
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const { sendEmail } = require("../utils/emailService");

// ============================================
// CONFIGURATION
// ============================================

const isProduction = process.env.NODE_ENV === "production";

const VERIFICATION_TOKEN_EXPIRY = 30 * 60 * 1000;
const RESET_TOKEN_EXPIRY = 15 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

function getClientUrl() {
  const clientUrl = process.env.CLIENT_URL?.trim().replace(/\/$/, "");

  if (!clientUrl || !/^https?:\/\//i.test(clientUrl)) {
    throw new Error("CLIENT_URL is missing or invalid.");
  }

  return clientUrl;
}

// ============================================
// JWT TOKEN
// ============================================

function createToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ============================================
// AUTH COOKIE
// ============================================

function setAuthCookie(res, token) {
  res.cookie("skillswap_token", token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// ============================================
// PUBLIC USER DATA
// ============================================

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    college: user.college,
    teachingSkills: user.teachingSkills,
    learningSkills: user.learningSkills,
    isEmailVerified: user.isEmailVerified,
    authProvider: user.authProvider,
  };
}

// ============================================
// SECURE TOKEN GENERATION
// ============================================

function generateSecureToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return {
    rawToken,
    hashedToken,
  };
}

// ============================================
// HTML ESCAPING
// ============================================

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

// ============================================
// CREATE VERIFICATION EMAIL
// ============================================

async function createVerificationEmail(user) {
  const clientUrl = getClientUrl();

  const { rawToken, hashedToken } = generateSecureToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpires = new Date(
    Date.now() + VERIFICATION_TOKEN_EXPIRY
  );

  await user.save();

  const verificationUrl =
    `${clientUrl}/verify-email?token=${encodeURIComponent(rawToken)}`;

  await sendEmail({
    to: user.email,
    subject: "Verify your SkillSwap email address",

    text: `Hello ${user.name},

Welcome to SkillSwap!

Please verify your email address using this link:

${verificationUrl}

This link expires in 30 minutes.

If you did not create this account, you can ignore this email.`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 30px; color: #222;">
        <h1 style="color: #6d4aff;">Welcome to SkillSwap!</h1>

        <p>Hello ${escapeHtml(user.name)},</p>

        <p>
          Thanks for joining SkillSwap.
          Verify your email address to activate your account.
        </p>

        <a href="${verificationUrl}"
          style="display: inline-block; padding: 14px 24px; background: #6d4aff; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Verify my email
        </a>

        <p style="margin-top: 24px;">
          This link expires in <strong>30 minutes</strong>.
        </p>

        <p>
          If the button does not work, copy this link into your browser:
        </p>

        <p style="word-break: break-all;">
          ${verificationUrl}
        </p>

        <p>
          If you did not create this account, you can ignore this email.
        </p>

        <p>— Team SkillSwap</p>
      </div>
    `,
  });
}

// ============================================
// REGISTER
// ============================================

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 60) {
      return res.status(400).json({
        message: "Name must be between 2 and 60 characters.",
      });
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      cleanEmail.length > 254
    ) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        message: "Password must be between 8 and 72 characters.",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      if (!existingUser.isEmailVerified) {
        return res.status(409).json({
          message:
            "An account with this email already exists but is not verified. Please request a new verification email.",
          requiresVerification: true,
          email: existingUser.email,
        });
      }

      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      authProvider: "local",
      isEmailVerified: false,
    });

    try {
      await createVerificationEmail(user);
    } catch (emailError) {
      console.error(
        "Verification email error:",
        emailError.message
      );

      return res.status(503).json({
        message:
          "Your account was created, but we could not send the verification email. Please try resending it.",
        requiresVerification: true,
        emailSent: false,
        email: user.email,
      });
    }

    return res.status(201).json({
      message:
        "Account created! Please check your email to verify your account before logging in.",
      requiresVerification: true,
      emailSent: true,
      email: user.email,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Unable to create your account right now.",
    });
  }
};

// ============================================
// VERIFY EMAIL
// ============================================

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body || {};

    if (typeof token !== "string" || !token) {
      return res.status(400).json({
        message: "Verification token is required.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    }).select(
      "+emailVerificationToken +emailVerificationExpires"
    );

    if (!user) {
      return res.status(400).json({
        message:
          "This verification link is invalid or has expired. Please request a new one.",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Your email has been verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Email verification error:", error.message);

    return res.status(500).json({
      message: "Unable to verify your email right now.",
    });
  }
};

// ============================================
// RESEND VERIFICATION EMAIL
// ============================================

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        message: "Please provide your email address.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail,
    });

    const genericMessage =
      "If an unverified account exists for this email, a verification link will be sent.";

    if (!user || user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    try {
      await createVerificationEmail(user);
    } catch (emailError) {
      console.error(
        "Resend verification error:",
        emailError.message
      );

      return res.status(503).json({
        message:
          "Unable to send the verification email. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    console.error("Resend verification error:", error.message);

    return res.status(500).json({
      message: "Unable to process your request right now.",
    });
  }
};

// ============================================
// FORGOT PASSWORD
// ============================================

const forgotPassword = async (req, res) => {
  const genericMessage =
    "If an account exists with this email, a password reset link will be sent.";

  try {
    const { email } = req.body || {};

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail,
    }).select("+password");

    if (!user || !user.password) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    const { rawToken, hashedToken } = generateSecureToken();

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(
      Date.now() + RESET_TOKEN_EXPIRY
    );

    await user.save();

    try {
      const clientUrl = getClientUrl();

      const resetUrl =
        `${clientUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

      await sendEmail({
        to: user.email,
        subject: "Reset your SkillSwap password",

        text: `Hello ${user.name},

We received a request to reset your SkillSwap password.

Use this link to create a new password:

${resetUrl}

This link expires in 15 minutes.

If you did not request this, you can ignore this email.

Team SkillSwap`,

        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 30px; color: #222;">
            <h1 style="color: #6d4aff;">Reset your password</h1>

            <p>Hello ${escapeHtml(user.name)},</p>

            <p>
              We received a request to reset your SkillSwap password.
            </p>

            <a href="${resetUrl}"
              style="display: inline-block; padding: 14px 24px; background: #6d4aff; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Reset my password
            </a>

            <p style="margin-top: 24px;">
              This link expires in <strong>15 minutes</strong>.
            </p>

            <p>
              If the button does not work, copy this link into your browser:
            </p>

            <p style="word-break: break-all;">
              ${resetUrl}
            </p>

            <p>
              If you did not request this, you can ignore this email.
            </p>

            <p>— Team SkillSwap</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error(
        "Password reset email error:",
        emailError.message
      );

      // Invalidate reset token if email delivery fails.
      user.passwordResetToken = null;
      user.passwordResetExpires = null;

      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);

    return res.status(500).json({
      message: "Unable to process your request right now.",
    });
  }
};

// ============================================
// RESET PASSWORD
// ============================================

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body || {};

    if (
      typeof token !== "string" ||
      !token ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Reset token and new password are required.",
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        message: "Password must be between 8 and 72 characters.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select(
      "+password +passwordResetToken +passwordResetExpires"
    );

    if (!user) {
      return res.status(400).json({
        message:
          "This password reset link is invalid or has expired. Please request a new one.",
      });
    }

    user.password = await bcrypt.hash(password, 12);

    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Your password has been reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);

    return res.status(500).json({
      message: "Unable to reset your password right now.",
    });
  }
};

// ============================================
// LOGIN
// ============================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        message:
          "This account uses Google sign-in. Please continue with Google.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = createToken(user._id.toString());

    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Unable to log in right now.",
    });
  }
};

// ============================================
// GET CURRENT USER
// ============================================

const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: publicUser(req.user),
  });
};

// ============================================
// LOGOUT
// ============================================

const logout = (req, res) => {
  res.clearCookie("skillswap_token", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};


// ============================================
// CREATE SOCKET AUTHENTICATION TICKET
// ============================================

const createSocketTicket = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const ticket = jwt.sign(
      {
        userId: req.user._id.toString(),
        purpose: "socket_auth",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "60s",
      }
    );

    return res.status(200).json({
      success: true,
      ticket,
      expiresIn: 60,
    });
  } catch (error) {
    console.error("Socket ticket error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to authenticate chat connection.",
    });
  }
};


// ============================================
// EXPORT CONTROLLERS
// ============================================

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  login,
  getMe,
  logout,
  createSocketTicket,
};
