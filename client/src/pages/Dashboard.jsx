
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const stats = [
  { icon: "🎯", value: "12", label: "Skill Matches", note: "People to learn from", tone: "purple" },
  { icon: "📚", value: "04", label: "Skills Learning", note: "Your learning journey", tone: "blue" },
  { icon: "🤝", value: "08", label: "Exchanges", note: "Knowledge shared", tone: "peach" },
  { icon: "⭐", value: "240", label: "Community Points", note: "Keep growing", tone: "green" },
];

const matches = [
  {
    initials: "AS",
    name: "Aarav Sharma",
    skill: "React Development",
    offers: "React",
    wants: "UI/UX Design",
    color: "lavender",
  },
  {
    initials: "PS",
    name: "Priya Singh",
    skill: "UI/UX Design",
    offers: "Figma",
    wants: "Python",
    color: "peach",
  },
  {
    initials: "RK",
    name: "Rahul Kumar",
    skill: "Python Programming",
    offers: "Python",
    wants: "Web Development",
    color: "mint",
  },
];

const sessions = [
  {
    day: "29",
    month: "OCT",
    title: "React Fundamentals",
    person: "with Aarav Sharma",
    time: "5:00 PM",
    type: "Learning session",
  },
  {
    day: "31",
    month: "OCT",
    title: "Design Principles",
    person: "with Priya Singh",
    time: "11:00 AM",
    type: "Skill exchange",
  },
];

const navigation = [
  { label: "Overview", icon: "▦", to: "/dashboard", active: true },
  { label: "Explore skills", icon: "⌕", to: "/explore" },
  { label: "My sessions", icon: "▣", to: "/sessions" },
  { label: "Requests", icon: "↗", to: "/requests" },
  { label: "Messages", icon: "▤", to: "/chat" },
  { label: "My profile", icon: "◎", to: "/profile" },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName =
    user?.name || user?.email?.split("@")[0] || "Student";

  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "S";

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="dashboard-page">
      {mobileMenuOpen && (
        <button
          type="button"
          className="dashboard-mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`dashboard-sidebar ${
          mobileMenuOpen ? "sidebar-open" : ""
        }`}
      >
        <Link
          to="/dashboard"
          className="dashboard-brand"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="brand-mark">S</span>
          <span>
            Skill<span className="brand-accent">Swap</span>
          </span>
        </Link>

        <div className="sidebar-profile">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-profile-info">
            <strong>{displayName}</strong>
            <span>SkillSwap member</span>
          </div>
          <span className="online-indicator" title="Signed in" />
        </div>

        <p className="sidebar-label">YOUR WORKSPACE</p>

        <nav className="dashboard-nav">
          {navigation.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`dashboard-nav-link ${
                item.active ? "active" : ""
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.label === "Requests" && (
                <span className="nav-soon-dot" title="Requests" />
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon">✦</div>
            <h4>Growth looks good on you!</h4>
            <p>Every skill you share makes someone stronger.</p>
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
            >
              Discover skills <span>→</span>
            </Link>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <span>↪</span>
            {loggingOut ? "Logging out..." : "Log out"}
          </button>

          <Link
            to="/"
            className="back-home-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            ← Back to website
          </Link>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-title">
            <button
              className="mobile-menu-btn"
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileMenuOpen(true)}
            >
              ☰
            </button>

            <div>
              <p className="dashboard-date">
                YOUR PERSONAL LEARNING SPACE
              </p>
              <h1>Dashboard<span className="title-period">.</span></h1>
            </div>
          </div>

          <div className="dashboard-user">
            <div className="topbar-greeting">
              <span>Welcome back,</span>
              <strong>{displayName}</strong>
            </div>
            <Link
              to="/profile"
              className="user-avatar topbar-avatar"
              aria-label="Open your profile"
            >
              {initials}
            </Link>
          </div>
        </header>

        <section className="welcome-banner">
          <div className="welcome-content">
            <span className="welcome-tag">
              <span className="welcome-tag-dot" />
              YOUR JOURNEY STARTS HERE
            </span>

            <h2>
              Learn something new.
              <br />
              <span>Teach what you know.</span>
            </h2>

            <p>
              Your next big skill starts with a small step. Discover
              students, exchange knowledge, and grow together.
            </p>

            <div className="welcome-actions">
              <Link to="/explore" className="welcome-btn">
                Explore skills <span>→</span>
              </Link>
              <Link to="/add-skill" className="welcome-secondary-btn">
                + Share a skill
              </Link>
            </div>

            <div className="welcome-trust">
              <span className="trust-check">✓</span>
              Learn at your pace. Grow together.
            </div>
          </div>

          <div className="welcome-art" aria-hidden="true">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-sparkle sparkle-one">✦</div>
            <div className="art-sparkle sparkle-two">✧</div>

            <div className="art-floating-card floating-top">
              <span>⚡</span>
              <div>
                <strong>Keep growing</strong>
                <small>One skill at a time</small>
              </div>
            </div>

            <div className="art-main-card">
              <div className="art-card-top">
                <span className="art-card-label">THE POWER OF SHARING</span>
                <span className="art-card-star">✦</span>
              </div>

              <div className="art-people">
                <span className="art-person person-one">👨‍💻</span>
                <span className="art-link-symbol">↔</span>
                <span className="art-person person-two">👩‍🎨</span>
              </div>

              <strong>Skills grow better together.</strong>
              <small>Learn · Share · Repeat</small>

              <div className="art-card-bottom">
                <span>KNOWLEDGE IS BETTER SHARED</span>
                <span>♡</span>
              </div>
            </div>

            <div className="art-floating-card floating-bottom">
              <span>🌱</span>
              <div>
                <strong>Learn. Teach. Repeat.</strong>
                <small>Your growth journey</small>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="panel-eyebrow">YOUR PROGRESS</p>
              <h2>A little progress goes a long way.</h2>
            </div>
            <span className="section-caption">Your learning overview</span>
          </div>

          <div className="dashboard-stats">
            {stats.map((stat) => (
              <article className="stat-card" key={stat.label}>
                <div className="stat-top">
                  <span className={`stat-icon ${stat.tone}`}>
                    {stat.icon}
                  </span>
                  <span className="stat-arrow">↗</span>
                </div>
                <h3>{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
                <p className="stat-change">{stat.note}</p>
              </article>
            ))}
          </div>

          <p className="demo-data-note">
            <span>ⓘ</span> Statistics, matches, and sessions currently
            use demo data. They'll become personalized when we connect
            these features to your database.
          </p>
        </section>

        <div className="dashboard-content-grid">
          <section className="dashboard-panel" id="matches">
            <div className="panel-heading">
              <div>
                <p className="panel-eyebrow">YOUR NEXT CONNECTION</p>
                <h2>People you may like</h2>
                <p className="panel-subtitle">
                  Meet someone who can teach you something new.
                </p>
              </div>
              <Link to="/explore" className="panel-link">
                View all <span>→</span>
              </Link>
            </div>

            <div className="matches-list">
              {matches.map((match) => (
                <article className="match-card" key={match.name}>
                  <div className={`match-avatar ${match.color}`}>
                    {match.initials}
                  </div>

                  <div className="match-info">
                    <h3>{match.name}</h3>
                    <p className="match-primary-skill">
                      {match.skill}
                    </p>

                    <div className="match-tags">
                      <span>
                        <b>Offers</b> {match.offers}
                      </span>
                      <span>
                        <b>Wants</b> {match.wants}
                      </span>
                    </div>
                  </div>

                  <Link to="/explore" className="connect-btn">
                    Connect <span>↗</span>
                  </Link>
                </article>
              ))}
            </div>

            <Link to="/explore" className="matches-footer-link">
              Find more people to learn with <span>→</span>
            </Link>
          </section>

          <section className="dashboard-panel" id="sessions">
            <div className="panel-heading">
              <div>
                <p className="panel-eyebrow">MAKE TIME TO GROW</p>
                <h2>Upcoming sessions</h2>
                <p className="panel-subtitle">
                  A little time can make a big difference.
                </p>
              </div>
              <Link to="/sessions" className="panel-link">
                All <span>→</span>
              </Link>
            </div>

            <div className="sessions-list">
              {sessions.map((session) => (
                <article className="session-card" key={session.title}>
                  <div className="session-date">
                    <strong>{session.day}</strong>
                    <span>{session.month}</span>
                  </div>

                  <div className="session-info">
                    <span className="session-type">{session.type}</span>
                    <h3>{session.title}</h3>
                    <p>{session.person}</p>
                    <span className="session-time">
                      <span>◷</span> {session.time}
                    </span>
                  </div>

                  <span className="session-arrow">↗</span>
                </article>
              ))}
            </div>

            <Link to="/sessions" className="all-sessions-btn">
              View your sessions <span>→</span>
            </Link>
          </section>
        </div>

        <section className="dashboard-bottom">
          <div className="bottom-content">
            <div className="bottom-icon">💡</div>
            <div>
              <span className="bottom-eyebrow">YOUR KNOWLEDGE MATTERS</span>
              <h3>Have a skill worth sharing?</h3>
              <p>
                Your experience could be exactly what another student
                needs to take the next step.
              </p>
            </div>
          </div>

          <Link to="/add-skill" className="add-skill-btn">
            + Add your skills <span>→</span>
          </Link>
        </section>

        <footer className="dashboard-footer">
          <p>© 2026 SkillSwap. Learn. Teach. Grow together.</p>
          <span>Made for students, by students <b>♥</b></span>
        </footer>
      </main>
    </div>
  );
}
