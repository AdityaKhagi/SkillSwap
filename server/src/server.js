
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Conversation = require("./models/Conversation");
const Message = require("./models/Message");
const User = require("./models/User");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const skillRoutes = require("./routes/skillRoutes");
const exchangeRoutes = require("./routes/exchangeRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/exchange", exchangeRoutes);
app.use("/api/chat", chatRoutes);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Track connected users.
// One user can have multiple browser tabs or devices.
const onlineUsers = new Map();

const getOnlineUserIds = () => Array.from(onlineUsers.keys());

// Read authentication cookie.
function getCookieValue(cookieHeader, cookieName) {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split("=");

    if (name === cookieName) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

// Authenticate every Socket.IO connection.
io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    const token = getCookieValue(cookieHeader, "skillswap_token");

    if (!token) {
      return next(
        new Error("Authentication required. Please log in.")
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId) {
      return next(new Error("Invalid authentication token."));
    }

    const user = await User.findById(userId).select("_id name email");

    if (!user) {
      return next(new Error("User account not found."));
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    next(new Error("Authentication failed. Please log in again."));
  }
});

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SkillSwap API is running!",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// Format messages consistently for the frontend.
function formatMessage(message) {
  const senderId = message.sender?._id
    ? message.sender._id.toString()
    : message.sender.toString();

  return {
    id: message._id.toString(),
    conversationId: message.conversation.toString(),
    senderId,
    sender: message.sender?.name || "SkillSwap member",
    text: message.text,
    createdAt: message.createdAt.toISOString(),
    readBy: (message.readBy || []).map((id) => id.toString()),
  };
}

// ============================================
// SOCKET.IO CONNECTION
// ============================================

io.on("connection", (socket) => {
  const userId = socket.user._id.toString();

  console.log(`Authenticated socket connected: ${socket.user.name}`);

  // ============================================
  // ONLINE / OFFLINE PRESENCE
  // ============================================

  const isFirstConnection = !onlineUsers.has(userId);

  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  onlineUsers.get(userId).add(socket.id);

  // Send the current online users to this user.
  socket.emit("onlineUsers", getOnlineUserIds());

  // Notify others only on the user's first connection.
  if (isFirstConnection) {
    socket.broadcast.emit("userOnline", userId);
  }

  // ============================================
  // JOIN PRIVATE CONVERSATION
  // ============================================

  socket.on("joinConversation", async (payload, callback) => {
    const respond =
      typeof callback === "function" ? callback : () => {};

    try {
      const conversationId = payload?.conversationId;

      if (
        typeof conversationId !== "string" ||
        !mongoose.Types.ObjectId.isValid(conversationId)
      ) {
        return respond({
          success: false,
          error: "A valid conversation ID is required.",
        });
      }

      const conversation = await Conversation.findById(conversationId)
        .populate("exchangeRequest", "status")
        .lean();

      if (!conversation) {
        return respond({
          success: false,
          error: "Conversation not found.",
        });
      }

      if (conversation.exchangeRequest?.status !== "accepted") {
        return respond({
          success: false,
          error: "This exchange has not been accepted.",
        });
      }

      const isParticipant = conversation.participants.some(
        (participantId) =>
          participantId.toString() === userId
      );

      if (!isParticipant) {
        return respond({
          success: false,
          error: "You are not authorized to access this conversation.",
        });
      }

      // Leave previous conversation rooms.
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          socket.leave(room);
        }
      }

      // Room name is the conversation ID.
      socket.join(conversationId);

      const history = await Message.find({
        conversation: conversation._id,
      })
        .populate("sender", "name")
        .sort({ createdAt: -1, _id: -1 })
        .limit(100)
        .lean();

      const messages = history.reverse().map(formatMessage);

      socket.emit("messageHistory", messages);

      console.log(
        `${socket.user.name} joined private conversation ${conversationId}`
      );

      respond({
        success: true,
        conversationId,
      });
    } catch (error) {
      console.error("Join conversation error:", error.message);

      respond({
        success: false,
        error: "Could not join the conversation.",
      });
    }
  });

  // ============================================
  // SEND MESSAGE
  // ============================================

  socket.on("sendMessage", async (payload, callback) => {
    const respond =
      typeof callback === "function" ? callback : () => {};

    try {
      const conversationId = payload?.conversationId;
      const text =
        typeof payload?.text === "string"
          ? payload.text.trim()
          : "";

      if (
        typeof conversationId !== "string" ||
        !mongoose.Types.ObjectId.isValid(conversationId) ||
        !text ||
        text.length > 2000
      ) {
        return respond({
          success: false,
          error: "Invalid message details.",
        });
      }

      // Verify this socket has joined the conversation.
      const room = io.sockets.adapter.rooms.get(conversationId);

      if (!room || !room.has(socket.id)) {
        return respond({
          success: false,
          error: "Join this conversation before sending a message.",
        });
      }

      const conversation = await Conversation.findById(conversationId)
        .populate("exchangeRequest", "status");

      if (!conversation) {
        return respond({
          success: false,
          error: "Conversation not found.",
        });
      }

      if (conversation.exchangeRequest?.status !== "accepted") {
        return respond({
          success: false,
          error: "This exchange is no longer active.",
        });
      }

      const isParticipant = conversation.participants.some(
        (participantId) =>
          participantId.toString() === userId
      );

      if (!isParticipant) {
        return respond({
          success: false,
          error: "You are not authorized to send messages here.",
        });
      }

      const savedMessage = await Message.create({
        conversation: conversation._id,
        sender: socket.user._id,
        text,
        readBy: [],
      });

      await Conversation.updateOne(
        { _id: conversation._id },
        {
          $set: {
            lastMessage: text,
            lastMessageAt: savedMessage.createdAt,
          },
        }
      );

      const populatedMessage = await Message.findById(savedMessage._id)
        .populate("sender", "name")
        .lean();

      const formatted = formatMessage(populatedMessage);

      // Send only to sockets in this private conversation.
      io.to(conversationId).emit("newMessage", formatted);

      respond({
        success: true,
        messageId: formatted.id,
      });
    } catch (error) {
      console.error("Send message error:", error.message);

      respond({
        success: false,
        error: "Could not save or send the message.",
      });
    }
  });

  // ============================================
  // TYPING INDICATORS
  // ============================================

  socket.on("typing", (payload) => {
    const conversationId = payload?.conversationId;

    if (
      typeof conversationId !== "string" ||
      !socket.rooms.has(conversationId)
    ) {
      return;
    }

    socket.to(conversationId).emit("userTyping", {
      conversationId,
      userId,
    });
  });

  socket.on("stopTyping", (payload) => {
    const conversationId = payload?.conversationId;

    if (
      typeof conversationId !== "string" ||
      !socket.rooms.has(conversationId)
    ) {
      return;
    }

    socket.to(conversationId).emit("userStoppedTyping", {
      conversationId,
      userId,
    });
  });

  // ============================================
  // MARK MESSAGES AS READ
  // ============================================

  socket.on("markMessagesRead", async (payload, callback) => {
    const respond =
      typeof callback === "function" ? callback : () => {};

    try {
      const conversationId = payload?.conversationId;

      if (
        typeof conversationId !== "string" ||
        !mongoose.Types.ObjectId.isValid(conversationId) ||
        !socket.rooms.has(conversationId)
      ) {
        return respond({
          success: false,
          message: "You are not in this conversation.",
        });
      }

      const conversation = await Conversation.findById(conversationId);

      if (
        !conversation ||
        !conversation.participants.some(
          (participant) => participant.toString() === userId
        )
      ) {
        return respond({
          success: false,
          message: "Conversation not found or access denied.",
        });
      }

      const unreadMessages = await Message.find({
        conversation: conversationId,
        sender: { $ne: socket.user._id },
        readBy: { $ne: socket.user._id },
      }).select("_id");

      if (unreadMessages.length === 0) {
        return respond({
          success: true,
          count: 0,
        });
      }

      const messageIds = unreadMessages.map(
        (message) => message._id
      );

      await Message.updateMany(
        { _id: { $in: messageIds } },
        {
          $addToSet: {
            readBy: socket.user._id,
          },
        }
      );

      // Notify the other participant(s).
      socket.to(conversationId).emit("messagesRead", {
        conversationId,
        userId,
        messageIds: messageIds.map((id) => id.toString()),
      });

      respond({
        success: true,
        count: messageIds.length,
      });
    } catch (error) {
      console.error("Mark messages read error:", error.message);

      respond({
        success: false,
        message: "Failed to mark messages as read.",
      });
    }
  });

  // ============================================
  // DISCONNECT / OFFLINE PRESENCE
  // ============================================

  socket.on("disconnect", () => {
    const userSockets = onlineUsers.get(userId);

    if (userSockets) {
      userSockets.delete(socket.id);

      // Mark offline only when the last tab/device disconnects.
      if (userSockets.size === 0) {
        onlineUsers.delete(userId);

        io.emit("userOffline", userId);
      }
    }

    console.log(`Socket disconnected: ${socket.user.name}`);
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in server/.env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in server/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully!");

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error.message);
    process.exit(1);
  }
}

startServer();
