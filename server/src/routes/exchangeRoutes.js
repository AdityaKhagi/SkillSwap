const express = require("express");

const {
  sendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
} = require("../controllers/exchangeController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All exchange request routes require authentication
router.use(protect);

// Send a new exchange request
router.post("/", sendRequest);

// Get incoming requests
router.get("/incoming", getIncomingRequests);

// Get outgoing requests
router.get("/outgoing", getOutgoingRequests);

// Accept a request
router.patch("/:requestId/accept", acceptRequest);

// Reject a request
router.patch("/:requestId/reject", rejectRequest);

// Cancel a request
router.patch("/:requestId/cancel", cancelRequest);

module.exports = router;