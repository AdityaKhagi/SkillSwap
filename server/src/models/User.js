
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic user information
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    // Password authentication
    // Google users do not require a password.
    password: {
      type: String,
      default: null,
      select: false,
    },

    // Authentication provider
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: {
      type: String,
      default: null,
      sparse: true,
    },

    // Email verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      default: null,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
      select: false,
    },

    // Forgot password
    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
      select: false,
    },

    // User profile
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },

    college: {
      type: String,
      default: "",
      maxlength: 120,
    },

    teachingSkills: {
      type: [String],
      default: [],
    },

    learningSkills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
