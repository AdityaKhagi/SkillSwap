
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Sessions.css";

const initialSessions = [
  {
    id: 1,
    partner: "Priya Sharma",
    username: "priya_dev",
    avatar: "PS",
    skill: "React.js",
    exchangeSkill: "Python",
    date: "2026-10-30",
    time: "5:00 PM",
    duration: "60 minutes",
    format: "Online",
    status: "Scheduled",
  },
  {
    id: 2,
    partner: "Rahul Verma",
    username: "rahul_codes",
    avatar: "RV",
    skill: "Data Structures",
    exchangeSkill: "UI/UX Design",
    date: "2026-11-01",
    time: "11:00 AM",
    duration: "45 minutes",
    format: "Online",
    status: "Scheduled",
  },
  {
    id: 3,
    partner: "Ananya Gupta",
    username: "ananya_designs",
    avatar: "AG",
    skill: "Figma",
    exchangeSkill: "JavaScript",
    date: "2026-10-20",
    time: "4:00 PM",
    duration: "60 minutes",
    format: "In person",
    status: "Completed",
  },
  {
    id: 4,
    partner: "Arjun Mehta",
    username: "arjun_ml",
    avatar: "AM",
    skill: "Machine Learning",
    exchangeSkill: "Node.js",
    date: "2026-10-18",
    time: "2:00 PM",
    duration: "45 minutes",
    format: "Online",
    status: "Completed",
  },
];

function formatDate(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SessionCard({ session, onComplete, onCancel, onChat }) {
  return (
    <article className="session-card">
      <div className="session-card-header">
        <div className="session-partner">
          <div className="session-avatar">{session.avatar}</div>
          <div>
            <h3>{session.partner}</h3>
            <p>@{session.username}</p>
          </div>
        </div>

        <span
          className={`session-status session-status-${session.status.toLowerCase()}`}
        >
          {session.status}
        </span>
      </div>

      <div className="session-date-panel">
        <div className="session-date-icon">📅</div>
        <div>
          <strong>{formatDate(session.date)}</strong>
          <p>{session.time}</p>
        </div>
      </div>

      <div className="session-details">
        <div className="session-detail">
          <span>Skill session</span>
          <strong>{session.skill}</strong>
        </div>

        <div className="session-detail">
          <span>Exchange skill</span>
          <strong>{session.exchangeSkill}</strong>
        </div>

        <div className="session-detail">
          <span>Duration</span>
          <strong>{session.duration}</strong>
        </div>

        <div className="session-detail">
          <span>Format</span>
          <strong>{session.format}</strong>
        </div>
      </div>

      <div className="session-actions">
        {session.status === "Scheduled" && (
          <>
            <button
              className="session-btn session-complete-btn"
              onClick={() => onComplete(session.id)}
            >
              Mark Completed
            </button>

            <button
              className="session-btn session-cancel-btn"
              onClick={() => onCancel(session.id)}
            >
              Cancel
            </button>

            <button
              className="session-btn session-message-btn"
              onClick={() => onChat(session)}
            >
              Message
            </button>
          </>
        )}

        {session.status === "Completed" && (
          <span className="session-finished">
            ✓ Session completed
          </span>
        )}

        {session.status === "Cancelled" && (
          <span className="session-cancelled-note">
            This session was cancelled.
          </span>
        )}
      </div>
    </article>
  );
}

export default function Sessions() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState(initialSessions);
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [search, setSearch] = useState("");

  const upcomingCount = sessions.filter(
    (session) => session.status === "Scheduled"
  ).length;

  const completedCount = sessions.filter(
    (session) => session.status === "Completed"
  ).length;

  const visibleSessions = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return sessions.filter((session) => {
      const matchesTab =
        activeTab === "All"
          ? true
          : activeTab === "Upcoming"
            ? session.status === "Scheduled"
            : activeTab === "Completed"
              ? session.status === "Completed"
              : session.status === "Cancelled";

      const matchesSearch =
        session.partner.toLowerCase().includes(searchText) ||
        session.skill.toLowerCase().includes(searchText) ||
        session.exchangeSkill.toLowerCase().includes(searchText);

      return matchesTab && matchesSearch;
    });
  }, [sessions, activeTab, search]);

  function updateSessionStatus(id, status) {
    setSessions((previous) =>
      previous.map((session) =>
        session.id === id ? { ...session, status } : session
      )
    );
  }

  function openChat(session) {
    const conversationId = `skillswap-session-${session.id}`;

    navigate(
      `/chat?conversationId=${encodeURIComponent(conversationId)}`
    );
  }

  return (
    <main className="sessions-page">
      <header className="sessions-header">
        <div>
          <p className="sessions-eyebrow">YOUR LEARNING JOURNEY</p>
          <h1>My Sessions</h1>
          <p className="sessions-subtitle">
            Plan your skill exchanges, learn together, and track your progress.
          </p>
        </div>

        <button
          className="sessions-explore-btn"
          onClick={() => navigate("/explore")}
        >
          Find Skills <span>↗</span>
        </button>
      </header>

      <section className="sessions-stats">
        <div className="sessions-stat-card">
          <div className="sessions-stat-icon">📅</div>
          <div>
            <p>Upcoming Sessions</p>
            <h2>{upcomingCount}</h2>
          </div>
        </div>

        <div className="sessions-stat-card">
          <div className="sessions-stat-icon">🎯</div>
          <div>
            <p>Completed Sessions</p>
            <h2>{completedCount}</h2>
          </div>
        </div>

        <div className="sessions-stat-card">
          <div className="sessions-stat-icon">🤝</div>
          <div>
            <p>Total Sessions</p>
            <h2>{sessions.length}</h2>
          </div>
        </div>
      </section>

      <section className="sessions-content">
        <div className="sessions-toolbar">
          <div>
            <h2>Your Schedule</h2>
            <p>Manage your learning sessions in one place.</p>
          </div>

          <input
            type="search"
            className="sessions-search"
            placeholder="Search sessions..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search sessions"
          />
        </div>

        <div className="sessions-tabs">
          {["Upcoming", "Completed", "Cancelled", "All"].map((tab) => (
            <button
              key={tab}
              className={`sessions-tab ${
                activeTab === tab ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab === "Upcoming" && (
                <span className="sessions-tab-count">{upcomingCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="sessions-list">
          {visibleSessions.length > 0 ? (
            visibleSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onComplete={(id) =>
                  updateSessionStatus(id, "Completed")
                }
                onCancel={(id) => {
                  const confirmed = window.confirm(
                    "Are you sure you want to cancel this session?"
                  );

                  if (confirmed) {
                    updateSessionStatus(id, "Cancelled");
                  }
                }}
                onChat={openChat}
              />
            ))
          ) : (
            <div className="sessions-empty">
              <div className="sessions-empty-icon">📚</div>
              <h3>No sessions found</h3>
              <p>
                There are no sessions in this category matching your search.
              </p>

              <button
                className="session-btn session-complete-btn"
                onClick={() => {
                  setSearch("");
                  setActiveTab("All");
                }}
              >
                View All Sessions
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
