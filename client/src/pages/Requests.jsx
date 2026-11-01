
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  return new Date(date).toLocaleDateString("en-IN", {
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
  return type === "incoming"
    ? request.requester
    : request.recipient;
}

function StatusBadge({ status }) {
  const formattedStatus =
    status?.charAt(0).toUpperCase() + status?.slice(1);

  return (
    <span className={`request-status status-${status?.toLowerCase()}`}>
      {formattedStatus || "Unknown"}
    </span>
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

  const requestId = request._id || request.id;

  return (
    <article className="request-card">
      <div className="request-card-top">
        <div className="request-user">
          <div className="request-avatar">
            {getInitials(personName)}
          </div>

          <div>
            <h3>{personName}</h3>
            <p className="request-username">
              {person?.college || "SkillSwap Member"}
            </p>
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="skill-exchange">
        <div className="exchange-skill offered-skill">
          <span className="exchange-label">
            {skillDescription}
          </span>
          <strong>{skillTitle}</strong>
        </div>

        <span className="exchange-arrow" aria-label="skill listing">
          ⇄
        </span>

        <div className="exchange-skill wanted-skill">
          <span className="exchange-label">
            {isIncoming ? "Request received" : "Request sent"}
          </span>
          <strong>
            {skillType === "teach"
              ? "Learning opportunity"
              : skillType === "learn"
                ? "Teaching opportunity"
                : "Skill exchange"}
          </strong>
        </div>
      </div>

      <p className="request-message">
        {request.message || "No message was added."}
      </p>

      <p className="request-date">
        Requested on {formatDate(request.createdAt)}
      </p>

      <div className="request-actions">
        {isIncoming && status === "pending" && (
          <>
            <button
              className="request-btn accept-btn"
              onClick={() => onAccept(requestId)}
              disabled={actionLoading === requestId}
            >
              {actionLoading === requestId ? "Please wait..." : "Accept"}
            </button>

            <button
              className="request-btn reject-btn"
              onClick={() => onReject(requestId)}
              disabled={actionLoading === requestId}
            >
              Reject
            </button>
          </>
        )}

        {!isIncoming && status === "pending" && (
          <button
            className="request-btn reject-btn"
            onClick={() => onCancel(requestId)}
            disabled={actionLoading === requestId}
          >
            {actionLoading === requestId
              ? "Please wait..."
              : "Cancel Request"}
          </button>
        )}

        {status === "accepted" && (
          <span className="request-closed">
            Request accepted
          </span>
        )}

        {(status === "rejected" || status === "cancelled") && (
          <span className="request-closed">
            Request {status}
          </span>
        )}
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
      const [incomingResponse, outgoingResponse] =
        await Promise.all([
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
    (request) => request.status === "pending"
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

  return (
    <main className="requests-page">
      <header className="requests-header">
        <div>
          <p className="requests-eyebrow">YOUR LEARNING NETWORK</p>
          <h1>Exchange Requests</h1>
          <p className="requests-subtitle">
            Connect with learners, exchange knowledge, and grow together.
          </p>
        </div>

        <button
          className="browse-skills-btn"
          onClick={() => navigate("/explore")}
        >
          Explore Skills <span>↗</span>
        </button>
      </header>

      <section className="request-stats">
        <div className="request-stat">
          <span className="stat-icon">📥</span>
          <div>
            <p>Incoming</p>
            <h2>{incomingRequests.length}</h2>
          </div>
        </div>

        <div className="request-stat">
          <span className="stat-icon">⏳</span>
          <div>
            <p>Awaiting Response</p>
            <h2>{pendingIncoming}</h2>
          </div>
        </div>

        <div className="request-stat">
          <span className="stat-icon">📤</span>
          <div>
            <p>Sent Requests</p>
            <h2>{sentRequests.length}</h2>
          </div>
        </div>
      </section>

      <section className="requests-content">
        <div className="requests-toolbar">
          <div className="request-tabs">
            <button
              className={`request-tab ${
                activeTab === "incoming" ? "active" : ""
              }`}
              onClick={() => setActiveTab("incoming")}
            >
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
              Sent by me
            </button>
          </div>

          <div className="request-filters">
            <input
              type="search"
              placeholder="Search people or skills..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search requests"
            />

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
          <div className="request-error">
            {error}
            <button onClick={loadRequests}>Retry</button>
          </div>
        )}

        <div className="requests-list">
          {loading ? (
            <div className="requests-empty">
              <h3>Loading requests...</h3>
              <p>Please wait while we fetch your exchange requests.</p>
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
              <div className="empty-icon">🔎</div>
              <h3>No requests found</h3>
              <p>
                {search || statusFilter !== "All"
                  ? "Try changing your search or status filter."
                  : activeTab === "incoming"
                    ? "You haven't received any exchange requests yet."
                    : "You haven't sent any exchange requests yet."}
              </p>

              <button
                className="request-btn chat-btn"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
