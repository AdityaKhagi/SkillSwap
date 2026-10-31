const mongoose = require("mongoose");

const exchangeRequestSchema = new mongoose.Schema(
  {
    // User who sends the request
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Owner of the skill listing
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Skill listing for which the request is being sent
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SkillListing",
      required: true,
    },

    // Optional message from the requester
    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // Request status
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "cancelled",
      ],
      default: "pending",
    },

    // When the request was accepted or rejected
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate pending requests for the same listing
exchangeRequestSchema.index(
  {
    requester: 1,
    listing: 1,
    status: 1,
  }
);

// Quickly find incoming requests
exchangeRequestSchema.index({
  recipient: 1,
  status: 1,
  createdAt: -1,
});

// Quickly find outgoing requests
exchangeRequestSchema.index({
  requester: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "ExchangeRequest",
  exchangeRequestSchema
);