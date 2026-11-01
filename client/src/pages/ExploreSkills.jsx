
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./ExploreSkills.css";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

const categories = [
  "All Skills",
  "Programming",
  "Data Science",
  "Design",
  "Business",
  "Creative",
  "Languages",
  "Other",
];

const initialFilters = {
  search: "",
  type: "all",
  category: "All Skills",
  level: "all",
  mode: "all",
};

function getSkillId(skill) {
  return skill._id || skill.id;
}

function initialsFromName(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "S"
  );
}

function formatLevel(level) {
  if (level === "all") return "All levels";
  if (!level) return "Not specified";

  return level.charAt(0).toUpperCase() + level.slice(1);
}

function formatMode(mode) {
  if (mode === "online") return "Online";
  if (mode === "offline") return "In person";
  return "Online or in person";
}

/* =========================================
   SKILL CARD
========================================= */

function SkillCard({
  skill,
  onSave,
  isSaved,
  showMatch = false,
  onRequest,
}) {
  const isTeaching = skill.type === "teach";
  const skillId = getSkillId(skill);

  return (
    <article className="explore-skill-card">
      <div
        className={`explore-skill-art ${
          isTeaching ? "purple" : "blue"
        }`}
      >
        <span className="explore-skill-category">
          {skill.category}
        </span>

        <button
          type="button"
          className={`explore-save-btn ${isSaved ? "saved" : ""}`}
          onClick={() => onSave(skillId)}
          aria-label={isSaved ? "Unsave listing" : "Save listing"}
          aria-pressed={isSaved}
        >
          {isSaved ? "♥" : "♡"}
        </button>

        <span className="explore-skill-illustration">
          {isTeaching ? "↗" : "✦"}
        </span>
      </div>

      <div className="explore-skill-body">
        <div className="explore-skill-title-row">
          <h3>{skill.title}</h3>

          {showMatch && (
            <span className="marketplace-match-score">
              {skill.matchScore}% match
            </span>
          )}
        </div>

        <p className="explore-skill-description">
          {skill.description}
        </p>

        <div className="marketplace-listing-type">
          <span className={isTeaching ? "teach-type" : "learn-type"}>
            {isTeaching ? "TEACHING" : "LEARNING"}
          </span>

          <span>{formatLevel(skill.level)}</span>
        </div>

        <div className="explore-teacher">
          <span className="explore-teacher-avatar">
            {initialsFromName(skill.user?.name)}
          </span>

          <div>
            <strong>
              {skill.user?.name || "SkillSwap member"}
            </strong>

            <span>
              {skill.user?.college || "Student member"}
            </span>
          </div>
        </div>

        <div className="marketplace-listing-meta">
          <span>◈ {formatMode(skill.mode)}</span>

          <span>
            ◷{" "}
            {skill.createdAt
              ? new Date(skill.createdAt).toLocaleDateString()
              : "Recently published"}
          </span>
        </div>

        {skill.tags?.length > 0 && (
          <div className="marketplace-tags">
            {skill.tags.slice(0, 4).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}

        <button
          type="button"
          className="explore-connect-btn"
          onClick={() => onRequest(skill)}
        >
          Request skill exchange <span>→</span>
        </button>
      </div>
    </article>
  );
}

/* =========================================
   MAIN EXPLORE PAGE
========================================= */

export default function ExploreSkills() {
  const [filters, setFilters] = useState(initialFilters);
  const [activeTab, setActiveTab] = useState("all");

  const [listings, setListings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [savedSkills, setSavedSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [error, setError] = useState("");
  const [matchError, setMatchError] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });

  const [showFilters, setShowFilters] = useState(false);

  // Exchange request states
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  /* =========================================
     LOAD MARKETPLACE LISTINGS
  ========================================= */

  const loadListings = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page,
          limit: 12,
        };

        if (filters.search.trim()) {
          params.search = filters.search.trim();
        }

        if (filters.type !== "all") {
          params.type = filters.type;
        }

        if (filters.category !== "All Skills") {
          params.category = filters.category;
        }

        if (filters.level !== "all") {
          params.level = filters.level;
        }

        if (filters.mode !== "all") {
          params.mode = filters.mode;
        }

        const response = await API.get("/skills", { params });

        setListings(response.data.listings || []);

        setPagination(
          response.data.pagination || {
            page: 1,
            total: 0,
            totalPages: 0,
          }
        );
      } catch (err) {
        console.error("Marketplace loading error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load marketplace listings."
        );
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  /* =========================================
     LOAD PERSONALIZED MATCHES
  ========================================= */

  const loadMatches = useCallback(async () => {
    try {
      setMatchesLoading(true);
      setMatchError("");

      const response = await API.get("/skills/matches");

      setMatches(response.data.matches || []);
    } catch (err) {
      console.error("Match loading error:", err);

      if (err.response?.status === 401) {
        setMatchError("Log in to see your personalized matches.");
      } else {
        setMatchError(
          err.response?.data?.message ||
            "Unable to load your recommendations."
        );
      }
    } finally {
      setMatchesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings(1);
  }, [loadListings]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  /* =========================================
     FILTER HANDLERS
  ========================================= */

  function updateFilter(name, value) {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetFilters() {
    setFilters(initialFilters);
  }

  function toggleSaved(id) {
    if (!id) return;

    setSavedSkills((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  /* =========================================
     EXCHANGE REQUEST MODAL
  ========================================= */

  function openRequestModal(skill) {
    setSelectedSkill(skill);
    setRequestMessage("");
    setRequestError("");
    setRequestSuccess("");
  }

  function closeRequestModal() {
    if (requestLoading) return;

    setSelectedSkill(null);
    setRequestMessage("");
    setRequestError("");
  }

  async function submitExchangeRequest(event) {
    event.preventDefault();

    if (!selectedSkill) return;

    const listingId = getSkillId(selectedSkill);

    if (!listingId) {
      setRequestError("This listing does not have a valid ID.");
      return;
    }

    if (requestMessage.trim().length > 500) {
      setRequestError(
        "Your message cannot exceed 500 characters."
      );
      return;
    }

    try {
      setRequestLoading(true);
      setRequestError("");

      await API.post("/exchange", {
        listingId,
        message: requestMessage.trim(),
      });

      setSelectedSkill(null);
      setRequestMessage("");

      setRequestSuccess(
        `Your request for "${selectedSkill.title}" was sent successfully!`
      );
    } catch (err) {
      console.error("Exchange request error:", err);

      if (err.response?.status === 401) {
        setRequestError(
          "Please log in before sending an exchange request."
        );
      } else {
        setRequestError(
          err.response?.data?.message ||
            "Unable to send your request. Please try again."
        );
      }
    } finally {
      setRequestLoading(false);
    }
  }

  /* =========================================
     PAGE VARIABLES
  ========================================= */

  const visibleListings = listings;
  const isForYou = activeTab === "matches";

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="explore-page">

      {/* TOP NAVIGATION */}

      <header className="explore-topbar">
        <Link to="/" className="explore-brand">
          <span className="explore-brand-mark">S</span>

          <span>
            Skill<span>Swap</span>
          </span>
        </Link>

        <nav className="explore-top-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <a href="#skills-grid">Explore skills</a>
        </nav>

        <Link to="/profile" className="explore-profile-link">
          <span className="explore-profile-avatar">S</span>
          <span>My profile</span>
        </Link>
      </header>

      <main className="explore-main">

        {/* HERO SECTION */}

        <section className="explore-hero">
          <div className="explore-hero-content">
            <span className="explore-eyebrow">
              YOUR NEXT SKILL STARTS HERE
            </span>

            <h1>
              Learn from others.
              <br />
              <span>Grow together.</span>
            </h1>

            <p>
              Discover what your fellow students know, share what you know,
              and exchange skills without exchanging money.
            </p>

            <div className="explore-hero-points">
              <span>✓ Student community</span>
              <span>✓ Learn by exchanging</span>
            </div>

            <div className="marketplace-hero-actions">
              <Link to="/add-skill" className="marketplace-publish-btn">
                Publish a skill →
              </Link>

              <Link to="/profile" className="marketplace-secondary-btn">
                My profile
              </Link>
            </div>
          </div>

          <div className="explore-hero-art" aria-hidden="true">
            <div className="explore-art-orbit orbit-one" />
            <div className="explore-art-orbit orbit-two" />

            <div className="explore-art-card art-card-main">
              <span className="art-card-icon">💡</span>
              <strong>Knowledge is better shared.</strong>
              <span>Learn something new today</span>
            </div>

            <div className="explore-art-card art-card-float">
              <span>🤝</span>

              <div>
                <strong>Skill exchange</strong>
                <small>Give a skill. Gain a skill.</small>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH AND FILTER SECTION */}

        <section className="explore-search-section">
          <div className="explore-section-heading">
            <div>
              <p className="explore-eyebrow">
                FIND YOUR NEXT LEARNING PARTNER
              </p>

              <h2>Explore skills</h2>

              <p>
                Find something you want to learn—or teach something you love.
              </p>
            </div>

            <div className="explore-total">
              <strong>
                {isForYou ? matches.length : pagination.total}
              </strong>

              <span>
                {isForYou ? "matches" : "listings found"}
              </span>
            </div>
          </div>

          {/* MARKETPLACE TABS */}

          <div className="marketplace-tabs">
            {[
              { value: "all", label: "All listings" },
              { value: "teach", label: "People teaching" },
              { value: "learn", label: "People learning" },
              { value: "matches", label: "✦ For you" },
            ].map((tab) => (
              <button
                type="button"
                key={tab.value}
                className={activeTab === tab.value ? "active" : ""}
                onClick={() => {
                  setActiveTab(tab.value);

                  if (
                    tab.value === "teach" ||
                    tab.value === "learn"
                  ) {
                    updateFilter("type", tab.value);
                  } else {
                    updateFilter("type", "all");
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* SEARCH BAR */}

          <div className="explore-search-box">
            <span className="explore-search-icon" aria-hidden="true">
              ⌕
            </span>

            <input
              type="search"
              aria-label="Search skills"
              placeholder="Search skills, topics, or descriptions..."
              value={filters.search}
              onChange={(event) =>
                updateFilter("search", event.target.value)
              }
            />

            {filters.search && (
              <button
                type="button"
                className="explore-clear-search"
                onClick={() => updateFilter("search", "")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}

            <button
              type="button"
              className={`explore-filter-toggle ${
                showFilters ? "selected" : ""
              }`}
              onClick={() => setShowFilters((open) => !open)}
              aria-expanded={showFilters}
            >
              <span>☷</span> Filters
            </button>
          </div>

          {/* ADVANCED FILTERS */}

          {showFilters && (
            <div className="explore-advanced-filters">
              <label>
                Skill level

                <select
                  value={filters.level}
                  onChange={(event) =>
                    updateFilter("level", event.target.value)
                  }
                >
                  <option value="all">All levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>

              <label>
                Session format

                <select
                  value={filters.mode}
                  onChange={(event) =>
                    updateFilter("mode", event.target.value)
                  }
                >
                  <option value="all">All formats</option>
                  <option value="online">Online</option>
                  <option value="offline">In person</option>
                  <option value="both">Either</option>
                </select>
              </label>

              <button
                type="button"
                className="explore-reset-btn"
                onClick={resetFilters}
              >
                Reset filters
              </button>
            </div>
          )}

          {/* CATEGORY FILTERS */}

          <div
            className="explore-category-row"
            aria-label="Skill categories"
          >
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`explore-category-chip ${
                  filters.category === category ? "active" : ""
                }`}
                onClick={() => updateFilter("category", category)}
                aria-pressed={filters.category === category}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* PERSONALIZED MATCHES */}

        {isForYou ? (
          <section className="explore-results" id="skills-grid">
            <div className="explore-results-heading">
              <div>
                <h2>Your recommended matches</h2>

                <p>
                  Listings that complement the skills on your own profile
                  and marketplace listings.
                </p>
              </div>

              <span className="explore-results-count">
                {matches.length} matches
              </span>
            </div>

            {matchError && (
              <div className="marketplace-error">
                {matchError}
              </div>
            )}

            {matchesLoading ? (
              <div className="marketplace-loading">
                Finding your skill matches...
              </div>
            ) : matches.length > 0 ? (
              <div className="explore-skills-grid">
                {matches.map((skill) => {
                  const skillId = getSkillId(skill);

                  return (
                    <SkillCard
                      key={skillId}
                      skill={skill}
                      onSave={toggleSaved}
                      isSaved={savedSkills.includes(skillId)}
                      showMatch
                      onRequest={openRequestModal}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="explore-empty-state">
                <span>✦</span>
                <h3>No matches yet</h3>

                <p>
                  Publish both teaching and learning listings, or wait for
                  another student to publish a complementary skill.
                </p>

                <Link to="/add-skill" className="explore-empty-reset">
                  Publish a skill
                </Link>
              </div>
            )}

            <button
              type="button"
              className="marketplace-refresh-btn"
              onClick={loadMatches}
              disabled={matchesLoading}
            >
              Refresh recommendations ↻
            </button>
          </section>
        ) : (
          /* NORMAL MARKETPLACE LISTINGS */

          <section className="explore-results" id="skills-grid">
            <div className="explore-results-heading">
              <div>
                <h2>
                  {activeTab === "teach"
                    ? "Skills people can teach"
                    : activeTab === "learn"
                      ? "Skills people want to learn"
                      : filters.category === "All Skills"
                        ? "Skills you can exchange"
                        : filters.category}
                </h2>

                <p>
                  Browse real listings published by SkillSwap members.
                </p>
              </div>

              <span className="explore-results-count">
                {pagination.total} results
              </span>
            </div>

            {error && (
              <div className="marketplace-error">
                {error}
              </div>
            )}

            {loading ? (
              <div className="marketplace-loading">
                Loading marketplace listings...
              </div>
            ) : visibleListings.length > 0 ? (
              <>
                <div className="explore-skills-grid">
                  {visibleListings.map((skill) => {
                    const skillId = getSkillId(skill);

                    return (
                      <SkillCard
                        key={skillId}
                        skill={skill}
                        onSave={toggleSaved}
                        isSaved={savedSkills.includes(skillId)}
                        onRequest={openRequestModal}
                      />
                    );
                  })}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="marketplace-pagination">
                    <button
                      type="button"
                      disabled={pagination.page <= 1 || loading}
                      onClick={() =>
                        loadListings(pagination.page - 1)
                      }
                    >
                      ← Previous
                    </button>

                    <span>
                      Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={
                        pagination.page >= pagination.totalPages ||
                        loading
                      }
                      onClick={() =>
                        loadListings(pagination.page + 1)
                      }
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="explore-empty-state">
                <span>🔎</span>
                <h3>No skills found</h3>

                <p>
                  Try another search or category, or be the first to publish
                  a listing in this category.
                </p>

                <button
                  type="button"
                  className="explore-empty-reset"
                  onClick={resetFilters}
                >
                  Clear filters
                </button>

                <Link
                  to="/add-skill"
                  className="marketplace-publish-btn"
                >
                  Publish a skill →
                </Link>
              </div>
            )}
          </section>
        )}

        {/* PUBLISH SKILL BANNER */}

        <section className="explore-share-banner">
          <div className="explore-share-icon">✦</div>

          <div>
            <h2>Have a skill worth sharing?</h2>

            <p>
              Everyone knows something. Your knowledge could be exactly what
              another student needs.
            </p>
          </div>

          <Link to="/add-skill" className="explore-share-btn">
            Publish your skill <span>→</span>
          </Link>
        </section>

        {/* SUCCESS MESSAGE */}

        {requestSuccess && (
          <div className="marketplace-feedback success">
            <span>✓</span>

            <p>{requestSuccess}</p>

            <button
              type="button"
              onClick={() => setRequestSuccess("")}
              aria-label="Dismiss success message"
            >
              ×
            </button>

            <Link to="/requests">
              View requests →
            </Link>
          </div>
        )}

        {/* EXCHANGE REQUEST MODAL */}

        {selectedSkill && (
          <div
            className="exchange-modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeRequestModal();
              }
            }}
          >
            <section
              className="exchange-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="exchange-modal-title"
            >
              <button
                type="button"
                className="exchange-modal-close"
                onClick={closeRequestModal}
                disabled={requestLoading}
                aria-label="Close popup"
              >
                ×
              </button>

              <span className="exchange-modal-icon">🤝</span>

              <p className="explore-eyebrow">
                START A CONNECTION
              </p>

              <h2 id="exchange-modal-title">
                Request a skill exchange
              </h2>

              <p className="exchange-modal-description">
                Introduce yourself and tell this student why you'd like
                to connect.
              </p>

              <div className="exchange-modal-skill">
                <span>
                  {selectedSkill.type === "teach"
                    ? "SKILL YOU WANT TO LEARN"
                    : "SKILL YOU WANT TO TEACH"}
                </span>

                <strong>{selectedSkill.title}</strong>

                <small>
                  Listed by{" "}
                  {selectedSkill.user?.name || "SkillSwap member"}
                </small>
              </div>

              <form onSubmit={submitExchangeRequest}>
                <label htmlFor="exchange-message">
                  Your message
                </label>

                <textarea
                  id="exchange-message"
                  value={requestMessage}
                  onChange={(event) =>
                    setRequestMessage(event.target.value)
                  }
                  placeholder="Hi! I'm interested in your skill listing. I'd love to connect and learn together..."
                  rows={5}
                  maxLength={500}
                />

                <div className="exchange-character-count">
                  {requestMessage.length}/500 characters
                </div>

                {requestError && (
                  <div className="exchange-modal-error">
                    {requestError}

                    {requestError.includes("log in") && (
                      <Link to="/login">Log in</Link>
                    )}
                  </div>
                )}

                <div className="exchange-modal-actions">
                  <button
                    type="button"
                    className="exchange-cancel-btn"
                    onClick={closeRequestModal}
                    disabled={requestLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="exchange-send-btn"
                    disabled={requestLoading}
                  >
                    {requestLoading
                      ? "Sending..."
                      : "Send request →"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* FOOTER */}

        <footer className="explore-footer">
          <Link to="/" className="explore-footer-brand">
            Skill<span>Swap</span>
          </Link>

          <p>Learn. Teach. Grow together. 💜</p>

          <span>© 2026 SkillSwap</span>
        </footer>
      </main>
    </div>
  );
}
