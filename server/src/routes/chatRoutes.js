const express = require("express");

const { getConversations } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All chat routes require authentication.
router.use(protect);

// GET /api/chat/conversations
router.get("/conversations", getConversations);

module.exports = router;