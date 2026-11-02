
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Requests.css";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

function getRequestArray(response) {
  const data = response.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.requests)) return data.requests;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.data?.requests)) return data.data.requests;

  return [];
}

function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name = "User") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getPerson(request, type) {
  return type === "incoming" ? request.requester : request.recipient;
}

function StatusBadge({ status }) {
  const normalized = status?.toLowerCase() || "unknown";

  const icons = {
    pending: "◷",
    accepted: "✓",
    rejected: "×",
    cancelled: "—",
  };

  return (
    <span className={`request-status status-${normalized}`}>
      <span className="status-symbol">
        {icons[normalized] || "•"}
      </span>
      {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
    </span>
  );
}

function StatCard({ icon, label, value, detail, variant }) {
  return (
    <article className={`request-stat stat-${variant}`}>
      <div className="stat-top">
        <span className="stat-icon">{icon}</span>
        <span className="stat-decoration">↗</span>
      </div>

      <div className="stat-bottom">
        <div>
          <p>{label}</p>
          <h2>{value}</h2>
        </div>
        <span className="stat-detail">{detail}</span>
      </div>
    </article>
  );
}

function RequestCard({
  request,
  type,
  onAccept,
  onReject,
  onCancel,
  actionLoading,
}) {
  const isIncoming = type === "incoming";
  const person = getPerson(request, type);
  const listing = request.listing || {};
  const status = request.status?.toLowerCase();
  const requestId = request._id || request.id;

  const personName = person?.name || "SkillSwap Member";
  const skillTitle = listing.title || "Skill listing unavailable";
  const skillType = listing.type?.toLowerCase();

  const skillDescription =
    skillType === "teach"
      ? isIncoming
        ? "Wants to learn"
        : "You want to learn"
      : skillType === "learn"
        ? isIncoming
          ? "Wants to teach"
          : "You want to teach"
        : "Skill listing";

  const opportunity =
    skillType === "teach"
      ? "Learning opportunity"
      : skillType === "learn"
        ? "Teaching opportunity"
        : "Skill exchange";

  const busy = actionLoading === requestId;

  return (
    <article className="request-card">
      <div className="request-card-top">
        <div className="request-user">
          <div className="request-avatar">
            {getInitials(personName)}
            <span className="avatar-online-dot" />
          </div>

          <div className="request-person-details">
            <h3>{personName}</h3>
            <p className="request-username">
              <span>⌖</span>
              {person?.college || "SkillSwap Member"}
            </p>
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="request-card-divider" />

      <div className="exchange-heading">
        <span className="exchange-heading-icon">✦</span>
        SKILL EXCHANGE DETAILS
      </div>

      <div className="skill-exchange">
        <div className="exchange-skill offered-skill">
          <span className="exchange-label">
            {skillDescription}
          </span>
          <strong>{skillTitle}</strong>
          <span className="skill-card-indicator">01 / SKILL</span>
        </div>

        <div className="exchange-connector">
          <span>⇄</span>
        </div>

        <div className="exchange-skill wanted-skill">
          <span className="exchange-label">
            {isIncoming ? "Request received" : "Request sent"}
          </span>
          <strong>{opportunity}</strong>
          <span className="skill-card-indicator">02 / CONNECT</span>
        </div>
      </div>

      <div className="request-message-box">
        <span className="message-quote">“</span>
        <div>
          <span className="message-label">PERSONAL MESSAGE</span>
          <p className="request-message">
            {request.message || "No message was added to this request."}
          </p>
        </div>
      </div>

      <div className="request-card-footer">
        <div className="request-date">
          <span>◷</span>
          Requested {formatDate(request.createdAt)}
        </div>

        <div className="request-actions">
          {isIncoming && status === "pending" && (
            <>
              <button
                className="request-btn accept-btn"
                onClick={() => onAccept(requestId)}
                disabled={busy}
              >
                {busy ? "Please wait..." : "✓ Accept request"}
              </button>

              <button
                className="request-btn reject-btn"
                onClick={() => onReject(requestId)}
                disabled={busy}
              >
                Reject
              </button>
            </>
          )}

          {!isIncoming && status === "pending" && (
            <button
              className="request-btn reject-btn cancel-btn"
              onClick={() => onCancel(requestId)}
              disabled={busy}
            >
              {busy ? "Please wait..." : "Cancel request"}
            </button>
          )}

          {status === "accepted" && (
            <span className="request-closed closed-accepted">
              ✓ Request accepted
            </span>
          )}

          {(status === "rejected" || status === "cancelled") && (
            <span className="request-closed">
              Request {status}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Requests() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("incoming");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [incomingResponse, outgoingResponse] = await Promise.all([
        API.get("/exchange/incoming"),
        API.get("/exchange/outgoing"),
      ]);

      setIncomingRequests(getRequestArray(incomingResponse));
      setSentRequests(getRequestArray(outgoingResponse));
    } catch (err) {
      console.error("Error loading exchange requests:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const currentRequests =
    activeTab === "incoming" ? incomingRequests : sentRequests;

  const filteredRequests = useMemo(() => {
    return currentRequests.filter((request) => {
      const person = getPerson(request, activeTab);
      const listing = request.listing || {};
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        (person?.name || "").toLowerCase().includes(searchText) ||
        (person?.college || "").toLowerCase().includes(searchText) ||
        (listing.title || "").toLowerCase().includes(searchText) ||
        (request.message || "").toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        request.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [currentRequests, search, statusFilter, activeTab]);

  const pendingIncoming = incomingRequests.filter(
    (request) => request.status?.toLowerCase() === "pending"
  ).length;

  const acceptedCount = incomingRequests.filter(
    (request) => request.status?.toLowerCase() === "accepted"
  ).length;

  async function handleAction(requestId, action) {
    setActionLoading(requestId);
    setError("");

    try {
      await API.patch(`/exchange/${requestId}/${action}`);
      await loadRequests();
    } catch (err) {
      console.error(`Error performing ${action}:`, err);

      setError(
        err.response?.data?.message ||
          `Unable to ${action} this request. Please try again.`
      );
    } finally {
      setActionLoading(null);
    }
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
  }

  return (
    <main className="requests-page">
      <div className="requests-page-glow requests-glow-one" />
      <div className="requests-page-glow requests-glow-two" />

      {/* TOP NAVIGATION */}
      <nav className="requests-topbar">
        <Link to="/" className="requests-brand" aria-label="SkillSwap home">
          <span className="requests-brand-mark">S</span>
          <span>
            Skill<span>Swap</span>
          </span>
        </Link>

        <div className="requests-nav-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/explore">Explore skills</Link>
          <Link to="/requests" className="active">
            Requests
          </Link>
        </div>

        <Link to="/profile" className="requests-profile-link">
          <span className="requests-profile-avatar">S</span>
          <span>My profile</span>
          <span className="profile-link-arrow">↗</span>
        </Link>
      </nav>

      <div className="requests-inner">
        <header className="requests-header">
          <div className="requests-header-copy">
            <div className="requests-breadcrumb">
              <Link to="/dashboard">Dashboard</Link>
              <span>/</span>
              <strong>Requests</strong>
            </div>

            <p className="requests-eyebrow">
              YOUR LEARNING NETWORK
            </p>

            <h1>
              Exchange <span>Requests.</span>
            </h1>

            <p className="requests-subtitle">
              Great things happen when knowledge is shared.
              Manage your connections and keep learning together.
            </p>
          </div>

          <button
            className="browse-skills-btn"
            onClick={() => navigate("/explore")}
          >
            <span className="browse-icon">✦</span>
            Explore skills
            <span className="browse-arrow">↗</span>
          </button>
        </header>

        <section className="request-stats">
          <StatCard
            icon="↓"
            label="Incoming requests"
            value={incomingRequests.length}
            detail="People reaching out"
            variant="purple"
          />

          <StatCard
            icon="◷"
            label="Awaiting response"
            value={pendingIncoming}
            detail="Needs your attention"
            variant="orange"
          />

          <StatCard
            icon="↗"
            label="Sent requests"
            value={sentRequests.length}
            detail="Your learning connections"
            variant="blue"
          />
        </section>

        <section className="requests-content">
          <div className="requests-section-heading">
            <div>
              <p className="section-overline">CONNECTION MANAGER</p>
              <h2>Your exchanges</h2>
              <p>Track and manage all your skill exchange activity.</p>
            </div>

            <div className="requests-total">
              <span className="total-dot" />
              {incomingRequests.length + sentRequests.length} total requests
            </div>
          </div>

          <div className="requests-toolbar">
            <div className="request-tabs">
              <button
                className={`request-tab ${
                  activeTab === "incoming" ? "active" : ""
                }`}
                onClick={() => setActiveTab("incoming")}
              >
                <span className="tab-icon">↓</span>
                Incoming
                {pendingIncoming > 0 && (
                  <span className="tab-count">{pendingIncoming}</span>
                )}
              </button>

              <button
                className={`request-tab ${
                  activeTab === "sent" ? "active" : ""
                }`}
                onClick={() => setActiveTab("sent")}
              >
                <span className="tab-icon">↗</span>
                Sent by me
                <span className="tab-total">{sentRequests.length}</span>
              </button>
            </div>

            <div className="request-filters">
              <div className="request-search">
                <span>⌕</span>
                <input
                  type="search"
                  placeholder="Search people, skills..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search requests"
                />

                {search && (
                  <button
                    type="button"
                    className="search-clear"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter requests by status"
              >
                <option value="All">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="request-error" role="alert">
              <span>{error}</span>
              <button onClick={loadRequests}>Try again ↗</button>
            </div>
          )}

          <div className="requests-results-heading">
            <span>
              {activeTab === "incoming"
                ? "RECEIVED REQUESTS"
                : "YOUR OUTGOING REQUESTS"}
            </span>
            <span>
              {loading ? "Loading..." : `${filteredRequests.length} found`}
            </span>
          </div>

          <div className="requests-list">
            {loading ? (
              <div className="requests-empty loading-state">
                <div className="loading-spinner" />
                <h3>Gathering your connections</h3>
                <p>We're fetching your latest exchange requests.</p>
              </div>
            ) : filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <RequestCard
                  key={request._id || request.id}
                  request={request}
                  type={activeTab}
                  actionLoading={actionLoading}
                  onAccept={(id) => handleAction(id, "accept")}
                  onReject={(id) => handleAction(id, "reject")}
                  onCancel={(id) => handleAction(id, "cancel")}
                />
              ))
            ) : (
              <div className="requests-empty">
                <div className="empty-illustration">
                  <span>⇄</span>
                </div>

                <p className="empty-overline">NOTHING HERE YET</p>

                <h3>
                  {search || statusFilter !== "All"
                    ? "No matching requests"
                    : "Your next connection starts here"}
                </h3>

                <p>
                  {search || statusFilter !== "All"
                    ? "Try adjusting your search or status filter to find what you're looking for."
                    : activeTab === "incoming"
                      ? "When someone wants to exchange skills with you, their request will appear here."
                      : "Explore the community and send a request to someone whose skills you'd like to learn."}
                </p>

                {search || statusFilter !== "All" ? (
                  <button className="empty-action" onClick={clearFilters}>
                    Clear filters ↗
                  </button>
                ) : (
                  <button
                    className="empty-action"
                    onClick={() => navigate("/explore")}
                  >
                    Explore skills ↗
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        <footer className="requests-page-footer">
          <span>SKILL?</span>
          <span>Learn something. Teach something. Grow together.</span>
          <span>{acceptedCount} accepted connections</span>
        </footer>
      </div>
    </main>
  );
}
