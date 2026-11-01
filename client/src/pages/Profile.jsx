import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Profile.css";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

const EMPTY_PROFILE = {
  name: "",
  email: "",
  college: "",
  bio: "",
  teachingSkills: [],
  learningSkills: [],
};

function normalizeProfile(user = {}) {
  return {
    name: user.name || "",
    email: user.email || "",
    college: user.college || "",
    bio: user.bio || "",
    teachingSkills: Array.isArray(user.teachingSkills) ? user.teachingSkills : [],
    learningSkills: Array.isArray(user.learningSkills) ? user.learningSkills : [],
  };
}

function SkillEditor({ title, description, skills, value, onChange, onAdd, onRemove }) {
  return (
    <section className="profile-editor-group">
      <div className="profile-editor-heading">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span>{skills.length} added</span>
      </div>
      <div className="profile-skill-input-row">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd();
            }
          }}
          placeholder="Type a skill and press Enter"
          maxLength={60}
          aria-label={title}
        />
        <button type="button" className="profile-add-btn" onClick={onAdd}>+ Add</button>
      </div>
      <div className="profile-edit-skill-list">
        {skills.map((skill) => (
          <span className="profile-edit-skill" key={skill}>
            {skill}
            <button type="button" onClick={() => onRemove(skill)} aria-label={`Remove ${skill}`}>×</button>
          </span>
        ))}
        {skills.length === 0 && <p className="profile-empty-inline">Nothing here yet. Add your first skill.</p>}
      </div>
    </section>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [form, setForm] = useState(EMPTY_PROFILE);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [newTeachingSkill, setNewTeachingSkill] = useState("");
  const [newLearningSkill, setNewLearningSkill] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");
        const response = await API.get("/profile");
        if (!active) return;
        const loaded = normalizeProfile(response.data.user);
        setProfile(loaded);
        setForm(loaded);
      } catch (err) {
        if (!active) return;
        setError(
          err.response?.status === 401
            ? "Your session has expired. Please log in again."
            : err.response?.data?.message || "Unable to load your profile. Please try again."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => { active = false; };
  }, []);

  const initials = useMemo(
    () => profile.name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
      .map((part) => part[0].toUpperCase()).join("") || "S",
    [profile.name]
  );

  const skillCount = profile.teachingSkills.length + profile.learningSkills.length;
  const completionItems = [
    Boolean(profile.name.trim()),
    Boolean(profile.college.trim()),
    Boolean(profile.bio.trim()),
    profile.teachingSkills.length > 0,
    profile.learningSkills.length > 0,
  ];
  const completion = Math.round(
    (completionItems.filter(Boolean).length / completionItems.length) * 100
  );

  function startEditing() {
    setForm({
      ...profile,
      teachingSkills: [...profile.teachingSkills],
      learningSkills: [...profile.learningSkills],
    });
    setError("");
    setSavedMessage("");
    setEditing(true);
  }

  function cancelEditing() {
    setForm({
      ...profile,
      teachingSkills: [...profile.teachingSkills],
      learningSkills: [...profile.learningSkills],
    });
    setEditing(false);
    setError("");
    setNewTeachingSkill("");
    setNewLearningSkill("");
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function addSkill(type) {
    const isTeaching = type === "teachingSkills";
    const value = (isTeaching ? newTeachingSkill : newLearningSkill).trim();
    if (!value) return;

    if (value.length > 60) {
      setError("Skill names cannot exceed 60 characters.");
      return;
    }

    if (form[type].some((skill) => skill.toLowerCase() === value.toLowerCase())) {
      setError("This skill has already been added.");
      return;
    }

    if (form[type].length >= 50) {
      setError("You can add up to 50 skills in each category.");
      return;
    }

    setForm((current) => ({ ...current, [type]: [...current[type], value] }));
    if (isTeaching) setNewTeachingSkill("");
    else setNewLearningSkill("");
    setError("");
  }

  function removeSkill(type, skillToRemove) {
    setForm((current) => ({
      ...current,
      [type]: current[type].filter((skill) => skill !== skillToRemove),
    }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    const updatedName = form.name.trim();
    const updatedCollege = form.college.trim();
    const updatedBio = form.bio.trim();

    if (updatedName.length < 2 || updatedName.length > 60) {
      setError("Name must be between 2 and 60 characters.");
      return;
    }
    if (updatedCollege.length > 120) {
      setError("College name cannot exceed 120 characters.");
      return;
    }
    if (updatedBio.length > 500) {
      setError("Bio cannot exceed 500 characters.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSavedMessage("");
      const response = await API.put("/profile", {
        name: updatedName,
        college: updatedCollege,
        bio: updatedBio,
        teachingSkills: form.teachingSkills,
        learningSkills: form.learningSkills,
      });

      const updated = normalizeProfile(response.data.user);
      setProfile(updated);
      setForm(updated);
      setEditing(false);
      setSavedMessage("Your profile has been saved successfully.");
      setNewTeachingSkill("");
      setNewLearningSkill("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">
          <div className="profile-loader" />
          <h2>Getting your profile ready</h2>
          <p>Your SkillSwap space is loading.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-background-glow profile-glow-one" />
      <div className="profile-background-glow profile-glow-two" />

      <nav className="profile-nav">
        <Link to="/" className="profile-brand" aria-label="SkillSwap home">
          <span className="profile-brand-mark">S</span>
          <span>Skill<span>Swap</span></span>
        </Link>
        <div className="profile-nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/explore">Explore skills</Link>
          <Link to="/requests">Requests</Link>
        </div>
        <Link to="/dashboard" className="profile-nav-action">← Back to dashboard</Link>
      </nav>

      <div className="profile-container">
        <div className="profile-breadcrumb">
          <Link to="/dashboard">Dashboard</Link><span>/</span><span>My profile</span>
        </div>

        <header className="profile-page-heading">
          <div>
            <span className="profile-kicker">YOUR PERSONAL SPACE</span>
            <h1>Your profile<span>.</span></h1>
            <p>Show the community what you know and discover what you can learn.</p>
          </div>
          <span className="profile-member-badge"><i /> SkillSwap member</span>
        </header>

        {error && (
          <div className="profile-alert profile-alert-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} aria-label="Dismiss error">×</button>
          </div>
        )}
        {savedMessage && (
          <div className="profile-alert profile-alert-success" role="status">
            <span>✓ {savedMessage}</span>
            <button type="button" onClick={() => setSavedMessage("")} aria-label="Dismiss message">×</button>
          </div>
        )}

        <section className="profile-hero">
          <div className="profile-hero-cover">
            <div className="cover-orbit cover-orbit-one" />
            <div className="cover-orbit cover-orbit-two" />
            <span>LEARN · SHARE · GROW</span>
          </div>
          <div className="profile-hero-body">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">{initials}</div>
            </div>
            <div className="profile-hero-info">
              <span className="profile-kicker">SKILLSWAP COMMUNITY</span>
              <h2>{profile.name || "Your name"}</h2>
              <p>{profile.college || "Add your college or university"}</p>
              <p className="profile-email">{profile.email}</p>
            </div>
            <button type="button" className="profile-edit-btn" onClick={editing ? cancelEditing : startEditing}>
              {editing ? "Cancel editing" : "✎ Edit profile"}
            </button>
          </div>
          <div className="profile-hero-bio">
            <span className="profile-bio-label">A LITTLE ABOUT ME</span>
            <p>{profile.bio || "Add a short introduction so other learners can get to know you."}</p>
          </div>
        </section>

        <section className="profile-completion-card">
          <div className="completion-copy">
            <div>
              <span className="profile-kicker">MAKE A GREAT FIRST IMPRESSION</span>
              <h2>Profile strength</h2>
              <p>{completion === 100 ? "Your profile is looking great!" : "Complete a few details to help others connect with you."}</p>
            </div>
            <strong>{completion}%</strong>
          </div>
          <div className="completion-track" role="progressbar" aria-valuenow={completion} aria-valuemin="0" aria-valuemax="100">
            <span style={{ width: `${completion}%` }} />
          </div>
          <div className="completion-checks">
            {["Name", "College", "About you", "Teaching skills", "Learning skills"].map((item, index) => (
              <span className={completionItems[index] ? "is-complete" : ""} key={item}>
                <i>{completionItems[index] ? "✓" : "○"}</i>{item}
              </span>
            ))}
          </div>
        </section>

        {editing && (
          <section className="profile-edit-card">
            <div className="profile-card-heading">
              <div>
                <span className="profile-kicker">MAKE IT YOURS</span>
                <h2>Edit your details</h2>
                <p>Keep your information clear and up to date.</p>
              </div>
              <span className="profile-edit-symbol">✎</span>
            </div>
            <form className="profile-edit-form" onSubmit={saveProfile}>
              <div className="profile-form-grid">
                <label>
                  Full name
                  <input name="name" value={form.name} onChange={updateField} placeholder="Your full name" maxLength={60} autoComplete="name" required />
                </label>
                <label>
                  College or university
                  <input name="college" value={form.college} onChange={updateField} placeholder="Your college or university" maxLength={120} />
                </label>
                <label className="profile-bio-field">
                  About you
                  <textarea name="bio" value={form.bio} onChange={updateField} placeholder="What do you enjoy learning or teaching?" rows={4} maxLength={500} />
                  <span className="profile-character-count">{form.bio.length}/500</span>
                </label>
              </div>

              <SkillEditor
                title="Skills I can teach"
                description="Share the skills you can help someone learn."
                skills={form.teachingSkills}
                value={newTeachingSkill}
                onChange={setNewTeachingSkill}
                onAdd={() => addSkill("teachingSkills")}
                onRemove={(skill) => removeSkill("teachingSkills", skill)}
              />
              <SkillEditor
                title="Skills I want to learn"
                description="Tell the community what you would like to explore."
                skills={form.learningSkills}
                value={newLearningSkill}
                onChange={setNewLearningSkill}
                onAdd={() => addSkill("learningSkills")}
                onRemove={(skill) => removeSkill("learningSkills", skill)}
              />

              <div className="profile-form-actions">
                <button type="button" className="profile-cancel-btn" onClick={cancelEditing} disabled={saving}>Cancel</button>
                <button type="submit" className="profile-save-btn" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"} <span>→</span>
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="profile-stats">
          <article className="profile-stat-card">
            <span className="profile-stat-icon stat-lavender">↗</span>
            <div><strong>{String(profile.teachingSkills.length).padStart(2, "0")}</strong><p>Skills to teach</p><small>Knowledge to share</small></div>
          </article>
          <article className="profile-stat-card">
            <span className="profile-stat-icon stat-peach">✦</span>
            <div><strong>{String(profile.learningSkills.length).padStart(2, "0")}</strong><p>Skills to learn</p><small>Room to grow</small></div>
          </article>
          <article className="profile-stat-card">
            <span className="profile-stat-icon stat-mint">◎</span>
            <div><strong>{skillCount.toString().padStart(2, "0")}</strong><p>Total skills</p><small>Your skill interests</small></div>
          </article>
          <article className="profile-stat-card">
            <span className="profile-stat-icon stat-blue">✧</span>
            <div><strong>{completion}%</strong><p>Profile strength</p><small>Keep it up to date</small></div>
          </article>
        </section>

        <div className="profile-content-grid">
          <section className="profile-panel">
            <div className="profile-panel-heading">
              <div><span className="profile-panel-icon teach-icon">↗</span><div><span className="profile-kicker">SHARE YOUR KNOWLEDGE</span><h2>Skills I can teach</h2></div></div>
              <span className="panel-count">{profile.teachingSkills.length}</span>
            </div>
            <p className="profile-panel-description">Skills and knowledge you can share with fellow learners.</p>
            <div className="profile-skill-list">
              {profile.teachingSkills.map((skill, index) => (
                <div className="profile-skill" key={`${skill}-${index}`}>
                  <span className="skill-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="skill-name">{skill}</span>
                  <span className="skill-level">Can teach</span>
                </div>
              ))}
              {profile.teachingSkills.length === 0 && <p className="profile-empty-inline">No teaching skills added yet.</p>}
            </div>
            <button type="button" className="profile-panel-link" onClick={startEditing}>Add or manage skills <span>→</span></button>
          </section>

          <section className="profile-panel">
            <div className="profile-panel-heading">
              <div><span className="profile-panel-icon learn-icon">✦</span><div><span className="profile-kicker">YOUR NEXT CHAPTER</span><h2>Skills I want to learn</h2></div></div>
              <span className="panel-count learning-count">{profile.learningSkills.length}</span>
            </div>
            <p className="profile-panel-description">Things you want to explore with help from the community.</p>
            <div className="profile-learning-list">
              {profile.learningSkills.map((skill, index) => (
                <div className="learning-skill" key={`${skill}-${index}`}>
                  <span className="learning-skill-icon">{String(index + 1).padStart(2, "0")}</span>
                  <span>{skill}</span><span className="learning-arrow">↗</span>
                </div>
              ))}
              {profile.learningSkills.length === 0 && <p className="profile-empty-inline">No learning skills added yet.</p>}
            </div>
            <button type="button" className="profile-panel-link" onClick={startEditing}>Add learning skills <span>→</span></button>
          </section>
        </div>

        <footer className="profile-footer">
          <Link to="/" className="profile-footer-brand">Skill<span>Swap</span></Link>
          <p>Learn something new. Teach what you know.</p>
          <Link to="/dashboard">Back to dashboard ↑</Link>
        </footer>
      </div>
    </main>
  );
}
