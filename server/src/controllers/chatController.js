const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name college")
      .populate({
        path: "exchangeRequest",
        select: "status listing",
        populate: {
          path: "listing",
          select: "title",
        },
      })
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    const acceptedConversations = conversations.filter(
      (conversation) =>
        conversation.exchangeRequest?.status === "accepted"
    );

    const formattedConversations = await Promise.all(
      acceptedConversations.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          sender: { $ne: userId },
          readBy: { $ne: userId },
        });

        return {
          id: conversation._id.toString(),
          conversationId: conversation._id.toString(),
          participants: conversation.participants,
          exchangeRequest: conversation.exchangeRequest,
          lastMessage: conversation.lastMessage,
          lastMessageAt: conversation.lastMessageAt,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          unreadCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: formattedConversations.length,
      conversations: formattedConversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations.",
    });
  }
};

module.exports = {
  getConversations,
};