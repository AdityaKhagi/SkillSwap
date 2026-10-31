
const mongoose = require("mongoose");

const skillListingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["teach", "learn"],
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "all"],
      default: "all",
    },

    mode: {
      type: String,
      enum: ["online", "offline", "both"],
      default: "online",
    },

    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags) =>
          tags.length <= 10 &&
          tags.every(
            (tag) =>
              typeof tag === "string" &&
              tag.trim().length > 0 &&
              tag.trim().length <= 30
          ),
        message: "You can add up to 10 valid tags.",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Useful for marketplace filtering and sorting.
skillListingSchema.index({
  type: 1,
  isActive: 1,
  createdAt: -1,
});

skillListingSchema.index({
  category: 1,
  type: 1,
  isActive: 1,
});

module.exports = mongoose.model("SkillListing", skillListingSchema);
