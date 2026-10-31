
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddSkill.css";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

const categories = [
  "Programming",
  "Data Science",
  "Design",
  "Business",
  "Creative",
  "Languages",
  "Other",
];

const initialForm = {
  type: "teach",
  title: "",
  category: "Programming",
  level: "intermediate",
  description: "",
  mode: "online",
  tags: "",
};

export default function AddSkill() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSubmitted(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      form.title.trim().length < 2 ||
      form.description.trim().length < 10
    ) {
      setError("Enter a valid skill name and a description of at least 10 characters.");
      return;
    }

    const tags = [
      ...new Set(
        form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      ),
    ];

    if (tags.length > 10) {
      setError("You can add a maximum of 10 tags.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await API.post("/skills", {
        type: form.type,
        title: form.title.trim(),
        category: form.category,
        level: form.level,
        description: form.description.trim(),
        mode: form.mode,
        tags,
      });

      setSubmitted(true);
      setForm(initialForm);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please log in again before publishing a skill.");
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to publish your skill. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="add-skill-page">
      <header className="add-skill-nav">
        <Link to="/" className="add-skill-brand">
          Skill<span>Swap</span>
        </Link>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/explore">Explore skills</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </header>

      <div className="add-skill-container">
        <div className="add-skill-breadcrumb">
          <Link to="/dashboard">Dashboard</Link>
          <span>/</span>
          <span>Publish a skill</span>
        </div>

        <div className="add-skill-heading">
          <span className="add-skill-eyebrow">
            SHARE WHAT YOU KNOW
          </span>

          <h1>
            Teach a skill. <span>Learn something new.</span>
          </h1>

          <p>
            Publish what you can teach or what you want to learn.
            Find students and learning partners in the SkillSwap community.
          </p>
        </div>

        {submitted && (
          <div className="add-skill-success" role="status">
            <span>✓</span>
            <div>
              <strong>Skill published successfully!</strong>
              <p>Your listing is now saved in the SkillSwap marketplace.</p>
              <button
                type="button"
                onClick={() => navigate("/explore")}
              >
                View marketplace →
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="add-skill-error" role="alert">
            <span>!</span>
            {error}
          </div>
        )}

        <div className="add-skill-layout">
          <form className="add-skill-form" onSubmit={handleSubmit}>
            <section className="add-skill-section">
              <div className="add-skill-section-title">
                <span className="add-skill-step">01</span>
                <div>
                  <h2>What would you like to do?</h2>
                  <p>Choose the type of listing you want to publish.</p>
                </div>
              </div>

              <div className="marketplace-type-options">
                <button
                  type="button"
                  className={form.type === "teach" ? "selected" : ""}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      type: "teach",
                    }))
                  }
                >
                  <span>↗</span>
                  <strong>I can teach</strong>
                  <small>Share a skill with others</small>
                </button>

                <button
                  type="button"
                  className={form.type === "learn" ? "selected" : ""}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      type: "learn",
                    }))
                  }
                >
                  <span>✦</span>
                  <strong>I want to learn</strong>
                  <small>Find someone to guide you</small>
                </button>
              </div>
            </section>

            <section className="add-skill-section">
              <div className="add-skill-section-title">
                <span className="add-skill-step">02</span>
                <div>
                  <h2>Skill details</h2>
                  <p>
                    {form.type === "teach"
                      ? "Tell the community what you can teach."
                      : "Tell the community what you want to learn."}
                  </p>
                </div>
              </div>

              <label className="add-skill-label">
                Skill name <span>*</span>
                <input
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  placeholder="e.g. React.js, Python, UI/UX Design"
                  maxLength={80}
                  required
                />
              </label>

              <div className="add-skill-fields">
                <label className="add-skill-label">
                  Category <span>*</span>
                  <select
                    name="category"
                    value={form.category}
                    onChange={updateField}
                    required
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="add-skill-label">
                  {form.type === "teach"
                    ? "Your proficiency"
                    : "Your current level"}
                  <span>*</span>

                  <select
                    name="level"
                    value={form.level}
                    onChange={updateField}
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="all">All levels</option>
                  </select>
                </label>
              </div>

              <label className="add-skill-label">
                Description <span>*</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  placeholder={
                    form.type === "teach"
                      ? "What topics can you teach? What projects can you help someone build?"
                      : "What do you want to understand? What are your learning goals?"
                  }
                  rows={5}
                  maxLength={1000}
                  required
                />
                <small>
                  {form.description.length}/1000 characters
                </small>
              </label>

              <label className="add-skill-label">
                Tags
                <input
                  name="tags"
                  value={form.tags}
                  onChange={updateField}
                  placeholder="react, javascript, frontend (comma separated)"
                />
                <small>Maximum 10 tags, separated by commas.</small>
              </label>
            </section>

            <section className="add-skill-section">
              <div className="add-skill-section-title">
                <span className="add-skill-step">03</span>
                <div>
                  <h2>Learning preferences</h2>
                  <p>Choose how you prefer to exchange knowledge.</p>
                </div>
              </div>

              <label className="add-skill-label">
                Preferred session format
                <div className="add-skill-format-options">
                  {[
                    { value: "online", label: "Online", icon: "🌐" },
                    { value: "offline", label: "In person", icon: "📍" },
                    { value: "both", label: "Either", icon: "🤝" },
                  ].map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      className={
                        form.mode === option.value ? "selected" : ""
                      }
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          mode: option.value,
                        }))
                      }
                    >
                      {option.icon} {option.label}
                    </button>
                  ))}
                </div>
              </label>
            </section>

            <div className="add-skill-form-actions">
              <Link to="/explore" className="add-skill-cancel">
                Cancel
              </Link>

              <button
                type="submit"
                className="add-skill-submit"
                disabled={saving}
              >
                {saving ? "Publishing..." : "Publish listing"}
                <span>→</span>
              </button>
            </div>
          </form>

          <aside className="add-skill-preview">
            <div className="add-skill-preview-top">
              <span className="add-skill-preview-label">
                LIVE PREVIEW
              </span>
              <span className="add-skill-preview-dot" />
            </div>

            <div className="add-skill-preview-icon">✦</div>

            <span className="add-skill-preview-category">
              {form.category}
            </span>

            <span className="marketplace-preview-type">
              {form.type === "teach" ? "TEACHING LISTING" : "LEARNING LISTING"}
            </span>

            <h2>{form.title.trim() || "Your skill title"}</h2>

            <p className="add-skill-preview-description">
              {form.description.trim() ||
                "Your skill description will appear here as you type."}
            </p>

            <div className="add-skill-preview-level">
              <span>Level</span>
              <strong>
                {form.level.charAt(0).toUpperCase() + form.level.slice(1)}
              </strong>
            </div>

            <div className="add-skill-preview-divider" />

            <span className="add-skill-preview-label">
              SESSION FORMAT
            </span>

            <p className="add-skill-preview-exchange">
              {form.mode === "online"
                ? "🌐 Online"
                : form.mode === "offline"
                  ? "📍 In person"
                  : "🤝 Online or in person"}
            </p>

            <div className="add-skill-preview-footer">
              <div className="add-skill-mini-avatar">S</div>
              <div>
                <strong>Your profile</strong>
                <p>SkillSwap member</p>
              </div>
              <span>Preview</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
