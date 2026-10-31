
const mongoose = require("mongoose");

const ExchangeRequest = require("../models/ExchangeRequest");
const SkillListing = require("../models/SkillListing");
const Conversation = require("../models/Conversation");

// ============================================
// HELPER: CREATE OR GET PRIVATE CONVERSATION
// ============================================

const getOrCreateConversation = async (request) => {
  const conversation = await Conversation.findOneAndUpdate(
    {
      exchangeRequest: request._id,
    },
    {
      $setOnInsert: {
        exchangeRequest: request._id,
        participants: [
          request.requester,
          request.recipient,
        ],
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return conversation;
};

// ============================================
// 1. SEND EXCHANGE REQUEST
// ============================================

const sendRequest = async (req, res) => {
  try {
    const { listingId, message } = req.body;

    if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({
        success: false,
        message: "A valid skill listing ID is required.",
      });
    }

    if (
      message !== undefined &&
      (typeof message !== "string" || message.trim().length > 500)
    ) {
      return res.status(400).json({
        success: false,
        message: "Message must be a string of at most 500 characters.",
      });
    }

    const listing = await SkillListing.findById(listingId);

    if (!listing || !listing.isActive) {
      return res.status(404).json({
        success: false,
        message: "Skill listing not found or inactive.",
      });
    }

    if (listing.user.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a request to your own listing.",
      });
    }

    const existingRequest = await ExchangeRequest.findOne({
      requester: req.user._id,
      listing: listing._id,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending request for this skill.",
      });
    }

    const exchangeRequest = await ExchangeRequest.create({
      requester: req.user._id,
      recipient: listing.user,
      listing: listing._id,
      message: message ? message.trim() : "",
    });

    const populatedRequest = await ExchangeRequest.findById(
      exchangeRequest._id
    )
      .populate("requester", "name email college")
      .populate("recipient", "name email college")
      .populate("listing");

    return res.status(201).json({
      success: true,
      message: "Exchange request sent successfully!",
      request: populatedRequest,
    });
  } catch (error) {
    console.error("Send request error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send exchange request.",
    });
  }
};

// ============================================
// 2. GET INCOMING REQUESTS
// ============================================

const getIncomingRequests = async (req, res) => {
  try {
    const requests = await ExchangeRequest.find({
      recipient: req.user._id,
    })
      .populate("requester", "name email college")
      .populate("recipient", "name email college")
      .populate("listing")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Incoming requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch incoming requests.",
    });
  }
};

// ============================================
// 3. GET OUTGOING REQUESTS
// ============================================

const getOutgoingRequests = async (req, res) => {
  try {
    const requests = await ExchangeRequest.find({
      requester: req.user._id,
    })
      .populate("requester", "name email college")
      .populate("recipient", "name email college")
      .populate("listing")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Outgoing requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch outgoing requests.",
    });
  }
};

// ============================================
// 4. ACCEPT EXCHANGE REQUEST + CREATE CHAT
// ============================================

const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    const request = await ExchangeRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Exchange request not found.",
      });
    }

    // Only the recipient can accept.
    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to accept this request.",
      });
    }

    // If already accepted, return the existing conversation.
    // This also allows recovery if conversation creation previously failed.
    if (request.status === "accepted") {
      const conversation = await getOrCreateConversation(request);

      return res.status(200).json({
        success: true,
        message: "This exchange has already been accepted.",
        request,
        conversation: {
          id: conversation._id.toString(),
          conversationId: conversation._id.toString(),
        },
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be accepted.",
      });
    }

    request.status = "accepted";
    request.respondedAt = new Date();

    await request.save();

    // Automatically create a private conversation.
    const conversation = await getOrCreateConversation(request);

    const populatedRequest = await ExchangeRequest.findById(request._id)
      .populate("requester", "name email college")
      .populate("recipient", "name email college")
      .populate("listing");

    return res.status(200).json({
      success: true,
      message: "Exchange request accepted! Private chat created.",
      request: populatedRequest,
      conversation: {
        id: conversation._id.toString(),
        conversationId: conversation._id.toString(),
      },
    });
  } catch (error) {
    console.error("Accept request error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to accept exchange request or create conversation.",
    });
  }
};

// ============================================
// 5. REJECT EXCHANGE REQUEST
// ============================================

const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    const request = await ExchangeRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Exchange request not found.",
      });
    }

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reject this request.",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be rejected.",
      });
    }

    request.status = "rejected";
    request.respondedAt = new Date();

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Exchange request rejected.",
      request,
    });
  } catch (error) {
    console.error("Reject request error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject exchange request.",
    });
  }
};

// ============================================
// 6. CANCEL OUTGOING REQUEST
// ============================================

const cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    const request = await ExchangeRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Exchange request not found.",
      });
    }

    if (request.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this request.",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be cancelled.",
      });
    }

    request.status = "cancelled";
    request.respondedAt = new Date();

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Exchange request cancelled.",
      request,
    });
  } catch (error) {
    console.error("Cancel request error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel exchange request.",
    });
  }
};

// ============================================
// EXPORT CONTROLLERS
// ============================================

module.exports = {
  sendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
};
