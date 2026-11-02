
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import "./Chat.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const EMOJIS = [
  "😊", "😂", "❤️", "🔥", "👏", "🙌",
  "✨", "🎉", "🤝", "👍", "💯", "🚀",
  "😎", "🥳", "🙏", "💜", "☕", "🌟",
];

function getId(value) {
  if (!value) return "";
  return typeof value === "string" ? value : value._id || value.id || "";
}

function getInitials(name = "SkillSwap Member") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatTime(date) {
  if (!date) return "";

  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatConversationDate(date) {
  if (!date) return "";

  const messageDate = new Date(date);
  const today = new Date();

  if (messageDate.toDateString() === today.toDateString()) {
    return formatTime(date);
  }

  return messageDate.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
}

function getOtherParticipant(conversation, currentUserId) {
  const participants = conversation.participants || [];

  return (
    participants.find(
      (participant) => getId(participant) !== currentUserId
    ) || {}
  );
}

function getConversationTitle(conversation, currentUserId) {
  const person = getOtherParticipant(conversation, currentUserId);

  return person.name || "SkillSwap Member";
}

export default function Chat() {
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedConversationRef = useRef(null);
  const currentUserRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(false);

  const currentUserId = getId(currentUser);

  const isUserOnline = useCallback(
    (userId) => onlineUsers.includes(getId(userId)),
    [onlineUsers]
  );

  const markMessagesAsRead = useCallback((conversationId) => {
    const socket = socketRef.current;

    if (!socket?.connected || !conversationId) return;

    socket.emit("markMessagesRead", { conversationId }, (result) => {
      if (result?.success) {
        setConversations((previous) =>
          previous.map((conversation) =>
            getId(conversation) === conversationId
              ? { ...conversation, unreadCount: 0 }
              : conversation
          )
        );
      }
    });
  }, []);

  const stopTyping = useCallback(() => {
    const socket = socketRef.current;
    const conversationId = getId(selectedConversationRef.current);

    if (socket?.connected && conversationId && isTypingRef.current) {
      socket.emit("stopTyping", { conversationId });
    }

    isTypingRef.current = false;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  const handleDraftChange = (event) => {
    const value = event.target.value;
    setDraft(value);

    const socket = socketRef.current;
    const conversationId = getId(selectedConversationRef.current);

    if (!socket?.connected || !conversationId) return;

    if (value.trim()) {
      if (!isTypingRef.current) {
        socket.emit("typing", { conversationId });
        isTypingRef.current = true;
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(stopTyping, 1200);
    } else {
      stopTyping();
    }
  };

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return conversations;

    return conversations.filter((conversation) => {
      const name = getConversationTitle(
        conversation,
        currentUserId
      ).toLowerCase();

      const listing = conversation.exchangeRequest?.listing?.title || "";
      const lastMessage = conversation.lastMessage || "";

      return (
        name.includes(query) ||
        listing.toLowerCase().includes(query) ||
        lastMessage.toLowerCase().includes(query)
      );
    });
  }, [conversations, search, currentUserId]);

  const loadConversations = useCallback(async () => {
    try {
      setError("");

      const [userResponse, conversationResponse] = await Promise.all([
        api.get("/auth/me"),
        api.get("/chat/conversations"),
      ]);

      const user =
        userResponse.data?.user ||
        userResponse.data?.data?.user ||
        userResponse.data?.data ||
        userResponse.data;

      const conversationData =
        conversationResponse.data?.conversations ||
        conversationResponse.data?.data?.conversations ||
        conversationResponse.data?.data ||
        [];

      const validConversations = Array.isArray(conversationData)
        ? conversationData
        : [];

      setCurrentUser(user);
      currentUserRef.current = user;

      setConversations(validConversations);

      // Keep the selected conversation after refreshing the list.
      setSelectedConversation((current) => {
        if (!current) return null;

        return (
          validConversations.find(
            (item) => getId(item) === getId(current)
          ) || null
        );
      });
    } catch (err) {
      console.error("Conversation loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load conversations. Please log in again or try refreshing."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Load current user and private conversations.
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Keep selected conversation available to Socket.IO callbacks.
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Establish authenticated Socket.IO connection.
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setError("");
      // The selected-conversation effect joins the active room
      // after React updates the connected state.
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setOnlineUsers([]);
      setTypingUser(false);
    });

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(Array.isArray(users) ? users : []);
    });

    socket.on("userOnline", (userId) => {
      setOnlineUsers((previous) =>
        previous.includes(userId) ? previous : [...previous, userId]
      );
    });

    socket.on("userOffline", (userId) => {
      setOnlineUsers((previous) =>
        previous.filter((id) => id !== userId)
      );
    });

    socket.on("userTyping", ({ conversationId, userId }) => {
      const activeId = getId(selectedConversationRef.current);
      const activeUserId = getId(currentUserRef.current);

      if (conversationId === activeId && userId !== activeUserId) {
        setTypingUser(true);
      }
    });

    socket.on("userStoppedTyping", ({ conversationId, userId }) => {
      const activeId = getId(selectedConversationRef.current);
      const activeUserId = getId(currentUserRef.current);

      if (conversationId === activeId && userId !== activeUserId) {
        setTypingUser(false);
      }
    });

    socket.on("messagesRead", ({ conversationId, userId, messageIds }) => {
      const activeId = getId(selectedConversationRef.current);

      if (conversationId !== activeId || !Array.isArray(messageIds)) return;

      setMessages((previous) =>
        previous.map((message) =>
          messageIds.includes(message.id)
            ? {
                ...message,
                readBy: [...new Set([...(message.readBy || []), userId])],
              }
            : message
        )
      );
    });

    socket.on("connect_error", (err) => {
      setConnected(false);
      setError(
        err.message || "Unable to connect to the messaging server."
      );
    });

    socket.on("messageHistory", (history) => {
      setMessages(Array.isArray(history) ? history : []);
      setMessagesLoading(false);

      const activeId = getId(selectedConversationRef.current);
      if (activeId) markMessagesAsRead(activeId);
    });

    socket.on("newMessage", (message) => {
      const activeId = getId(selectedConversationRef.current);
      const isActive = message.conversationId === activeId;
      const isIncoming =
        message.senderId !== getId(currentUserRef.current);

      setConversations((previous) =>
        previous.map((conversation) => {
          if (getId(conversation) !== message.conversationId) {
            return conversation;
          }

          return {
            ...conversation,
            lastMessage: message.text,
            lastMessageAt: message.createdAt,
            unreadCount:
              isActive || !isIncoming
                ? 0
                : (conversation.unreadCount || 0) + 1,
          };
        })
      );

      if (!isActive) return;

      setMessages((previous) => {
        if (previous.some((item) => item.id === message.id)) {
          return previous;
        }

        return [...previous, message];
      });

      if (isIncoming) {
        markMessagesAsRead(message.conversationId);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [markMessagesAsRead]);

  // Join the selected private conversation.
  useEffect(() => {
    const socket = socketRef.current;

    if (!selectedConversation || !socket?.connected) return;

    const conversationId = getId(selectedConversation);

    stopTyping();
    setMessages([]);
    setTypingUser(false);
    setMessagesLoading(true);
    setError("");

    socket.emit(
      "joinConversation",
      { conversationId },
      (result) => {
        if (!result?.success) {
          setMessagesLoading(false);
          setError(result?.error || "Unable to open this conversation.");
        }
      }
    );
  }, [selectedConversation, connected, stopTyping]);

  // Clear typing timer when the chat page unmounts.
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Scroll to the latest message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  function openConversation(conversation) {
    stopTyping();
    setMessages([]);
    setTypingUser(false);
    setSelectedConversation(conversation);
    setShowEmojiPicker(false);
    setError("");

    const conversationId = getId(conversation);

    setConversations((previous) =>
      previous.map((item) =>
        getId(item) === conversationId
          ? { ...item, unreadCount: 0 }
          : item
      )
    );
  }

  function insertEmoji(emoji) {
    setDraft((previous) => previous + emoji);
  }

  function sendMessage(event) {
    event.preventDefault();

    const messageText = draft.trim();
    const socket = socketRef.current;
    const conversationId = getId(selectedConversation);

    if (!messageText || !conversationId || sending) return;

    if (!socket?.connected) {
      setError("You're disconnected. Please wait for reconnection.");
      return;
    }

    setSending(true);
    setError("");

    socket.emit(
      "sendMessage",
      {
        conversationId,
        text: messageText,
      },
      (result) => {
        setSending(false);

        if (!result?.success) {
          setError(result?.error || "Message could not be sent.");
          return;
        }

        stopTyping();
        setDraft("");
        setShowEmojiPicker(false);
      }
    );
  }

  function handleComposerKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(event);
    }
  }

  const activePerson = selectedConversation
    ? getOtherParticipant(selectedConversation, currentUserId)
    : null;

  return (
    <main className="chat-page">
      <header className="chat-topbar">
        <Link to="/" className="chat-brand">
          Skill<span>Swap</span>
          <span className="chat-brand-dot">.</span>
        </Link>

        <nav className="chat-navigation">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/requests">Requests</Link>
          <Link to="/profile">Profile</Link>
        </nav>

        <div className="chat-user-menu">
          <div className="chat-user-avatar">
            {getInitials(currentUser?.name)}
          </div>
          <span>{currentUser?.name || "My Account"}</span>
        </div>
      </header>

      <section className="chat-workspace">
        <aside className="chat-sidebar">
          <div className="chat-sidebar-heading">
            <div>
              <span className="chat-eyebrow">YOUR COMMUNITY</span>
              <h1>Messages<span>.</span></h1>
              <p>Ideas grow when shared. 💜</p>
            </div>

            <button
              className="chat-refresh-button"
              type="button"
              onClick={loadConversations}
              title="Refresh conversations"
            >
              ↻
            </button>
          </div>

          <div className="chat-search">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search conversations..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <kbd>⌘ K</kbd>
          </div>

          <div className="chat-list-heading">
            <span>ALL CONVERSATIONS</span>
            <span className="chat-count">{conversations.length}</span>
          </div>

          <div className="chat-conversation-list">
            {loading ? (
              <div className="chat-list-state">
                <span className="chat-spinner" />
                <p>Loading your conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="chat-list-state">
                <div className="chat-empty-icon">💬</div>
                <h3>No conversations yet</h3>
                <p>
                  Accept an exchange request or get one accepted to start
                  chatting.
                </p>
                <Link to="/requests">View requests ↗</Link>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const id = getId(conversation);
                const person = getOtherParticipant(
                  conversation,
                  currentUserId
                );

                const isActive =
                  getId(selectedConversation) === id;

                return (
                  <button
                    type="button"
                    key={id}
                    className={`chat-conversation-item ${
                      isActive ? "active" : ""
                    }`}
                    onClick={() => openConversation(conversation)}
                  >
                    <div className="chat-person-avatar">
                      {getInitials(person.name)}
                      <span
                        className={`chat-avatar-status ${
                          isUserOnline(getId(person)) ? "online" : "offline"
                        }`}
                      />
                    </div>

                    <div className="chat-conversation-details">
                      <div className="chat-conversation-topline">
                        <strong>{person.name || "SkillSwap Member"}</strong>
                        <time>
                          {formatConversationDate(
                            conversation.lastMessageAt
                          )}
                        </time>
                      </div>

                      <p className="chat-conversation-preview">
                        {conversation.lastMessage || "Start a conversation 👋"}
                      </p>

                      <div className="chat-conversation-bottom">
                        <span className="chat-skill-label">
                          🎯{" "}
                          {conversation.exchangeRequest?.listing?.title ||
                            "Skill exchange"}
                        </span>

                        {conversation.unreadCount > 0 && (
                          <span className="chat-unread-badge">
                            {conversation.unreadCount > 99
                              ? "99+"
                              : conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="chat-sidebar-footer">
            <div className="chat-footer-icon">✨</div>
            <div>
              <strong>Keep learning together</strong>
              <p>Every conversation is an opportunity.</p>
            </div>
          </div>
        </aside>

        <section className="chat-main">
          {!selectedConversation ? (
            <div className="chat-welcome">
              <div className="chat-welcome-illustration">
                <div className="chat-welcome-orbit orbit-one" />
                <div className="chat-welcome-orbit orbit-two" />
                <div className="chat-welcome-bubble">💬</div>
                <span className="welcome-spark spark-one">✦</span>
                <span className="welcome-spark spark-two">✧</span>
                <span className="welcome-spark spark-three">💜</span>
              </div>

              <span className="chat-eyebrow">YOUR LEARNING SPACE</span>
              <h2>Good things start<br />with a <span>conversation.</span></h2>
              <p>
                Choose someone from your conversations and start sharing
                ideas, knowledge and opportunities.
              </p>

              <div className="chat-welcome-tip">
                <span>💡</span>
                <span>Tip: Be curious, be kind, and keep learning.</span>
              </div>
            </div>
          ) : (
            <>
              <div className="chat-main-header">
                <div className="chat-main-person">
                  <div className="chat-person-avatar large">
                    {getInitials(activePerson?.name)}
                    <span
                      className={`chat-avatar-status ${
                        isUserOnline(getId(activePerson)) ? "online" : "offline"
                      }`}
                    />
                  </div>

                  <div>
                    <h2>{activePerson?.name || "SkillSwap Member"}</h2>
                    <p>
                      {typingUser
                        ? "typing..."
                        : isUserOnline(getId(activePerson))
                          ? "Online"
                          : activePerson?.college || "Offline"}
                    </p>
                  </div>
                </div>

                <div className="chat-header-actions">
                  <div
                    className={`chat-connection ${
                      connected ? "online" : "offline"
                    }`}
                  >
                    <span />
                    {connected ? "Connected" : "Reconnecting"}
                  </div>

                  <button
                    type="button"
                    className="chat-icon-button"
                    onClick={loadConversations}
                    title="Refresh"
                  >
                    ↻
                  </button>
                </div>
              </div>

              <div className="chat-context-banner">
                <span>🤝</span>
                <p>
                  You're connected through{" "}
                  <strong>
                    {selectedConversation.exchangeRequest?.listing?.title ||
                      "a SkillSwap exchange"}
                  </strong>
                  . Happy learning!
                </p>
                <span className="chat-context-spark">✦</span>
              </div>

              <div className="chat-message-area">
                {messagesLoading ? (
                  <div className="chat-loading-messages">
                    <span className="chat-spinner" />
                    <p>Loading your messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="chat-first-message">
                    <div>👋</div>
                    <h3>Say hello!</h3>
                    <p>
                      Your learning journey starts with one message.
                      Introduce yourself!
                    </p>
                  </div>
                ) : (
                  <div className="chat-message-stack">
                    <div className="chat-history-note">
                      <span>🔒</span>
                      This is a private conversation between exchange
                      participants.
                    </div>

                    {messages.map((message, index) => {
                      const isMine =
                        getId(message.senderId) === currentUserId;

                      const previous = messages[index - 1];

                      const showSender =
                        !previous ||
                        previous.senderId !== message.senderId;

                      return (
                        <article
                          key={message.id}
                          className={`chat-message-row ${
                            isMine ? "mine" : "theirs"
                          }`}
                        >
                          {!isMine && showSender && (
                            <div className="chat-message-avatar">
                              {getInitials(message.sender)}
                            </div>
                          )}

                          {!isMine && !showSender && (
                            <div className="chat-message-avatar spacer" />
                          )}

                          <div className="chat-message-content">
                            {showSender && (
                              <div className="chat-message-sender">
                                {isMine ? "You" : message.sender}
                              </div>
                            )}

                            <div className="chat-message-bubble">
                              {message.text}
                            </div>

                            <time className="chat-message-time">
                              {formatTime(message.createdAt)}
                            </time>
                          </div>

                          {isMine && (
                            <span
                              className={`chat-message-check ${
                                (message.readBy || []).some(
                                  (id) => id !== currentUserId
                                )
                                  ? "read"
                                  : ""
                              }`}
                              title={
                                (message.readBy || []).some(
                                  (id) => id !== currentUserId
                                )
                                  ? "Read"
                                  : "Sent"
                              }
                            >
                              ✓✓
                            </span>
                          )}
                        </article>
                      );
                    })}

                    {typingUser && (
                      <div className="chat-typing-indicator">
                        <span className="chat-typing-dots">
                          <i />
                          <i />
                          <i />
                        </span>
                        {activePerson?.name || "Someone"} is typing...
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {error && <div className="chat-inline-error">{error}</div>}

              <form className="chat-composer" onSubmit={sendMessage}>
                {showEmojiPicker && (
                  <div className="chat-emoji-picker">
                    <div className="chat-emoji-heading">
                      <strong>Pick an emoji</strong>
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(false)}
                      >
                        ✕
                      </button>
                    </div>

                    <div className="chat-emoji-grid">
                      {EMOJIS.map((emoji) => (
                        <button
                          type="button"
                          key={emoji}
                          onClick={() => insertEmoji(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className={`chat-emoji-toggle ${
                    showEmojiPicker ? "selected" : ""
                  }`}
                  onClick={() => setShowEmojiPicker((value) => !value)}
                  title="Add emoji"
                >
                  😊
                </button>

                <textarea
                  value={draft}
                  onChange={handleDraftChange}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Write something thoughtful..."
                  rows={1}
                  maxLength={2000}
                  aria-label="Write a message"
                  disabled={!connected}
                />

                <span className="chat-composer-hint">Enter ↵</span>

                <button
                  type="submit"
                  className="chat-send-button"
                  disabled={!connected || !draft.trim() || sending}
                >
                  {sending ? "Sending..." : "Send"}
                  <span>↗</span>
                </button>
              </form>

              <div className="chat-composer-caption">
                <span>🔒 Private conversation</span>
                <span>{draft.length}/2000</span>
              </div>
            </>
          )}
        </section>
      </section>

      <footer className="chat-page-footer">
        <span>Skill? © {new Date().getFullYear()}</span>
        <span>Learn something. Teach something. Grow together. 💜</span>
      </footer>
    </main>
  );
}
