import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Register() {
  const { register, resendVerification } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [verificationRequired, setVerificationRequired] =
    useState(false);

  const [registeredEmail, setRegisteredEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resending, setResending] = useState(false);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (name.length < 2) {
      setError("Your name must contain at least 2 characters.");
      return;
    }

    if (form.password.length < 8 || form.password.length > 72) {
      setError("Password must be between 8 and 72 characters.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await register({
        name,
        email,
        password: form.password,
      });

      setRegisteredEmail(response.email || email);
      setSuccessMessage(
        response.message ||
          "Your account has been created. Please check your email."
      );
      setVerificationRequired(true);
    } catch (err) {
      const data = err.response?.data;

      if (data?.requiresVerification) {
        setRegisteredEmail(data.email || email);
        setSuccessMessage(data.message);
        setVerificationRequired(true);
      } else {
        setError(
          data?.message ||
            "Unable to create your account. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;

    try {
      setResending(true);
      setError("");

      const response = await resendVerification(registeredEmail);

      setSuccessMessage(
        response.message || "Verification email request processed."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to resend verification email. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  if (verificationRequired) {
    return (
      <main className="auth-page">
        <div className="auth-decoration auth-decoration-one" />
        <div className="auth-decoration auth-decoration-two" />

        <Link to="/" className="auth-brand">
          <span className="auth-brand-mark">S</span>
          <span>
            Skill<span>Swap</span>
          </span>
        </Link>

        <section className="auth-card">
          <div className="auth-icon">✉</div>

          <p className="auth-eyebrow">ONE LAST STEP</p>

          <h1>Check your email</h1>

          <p className="auth-subtitle">
            We've processed your registration for:
          </p>

          <p className="auth-email-display">
            <strong>{registeredEmail}</strong>
          </p>

          <p className="auth-subtitle">
            {successMessage}
          </p>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button
            className="auth-submit"
            type="button"
            onClick={handleResend}
            disabled={resending}
          >
            {resending
              ? "Sending..."
              : "Resend verification email"}
          </button>

          <p className="auth-hint">
            Check your inbox and spam folder. The verification link
            expires after 30 minutes.
          </p>

          <p className="auth-switch">
            Already verified? <Link to="/login">Log in</Link>
          </p>
        </section>

        <p className="auth-footer">
          Made for curious minds <span>♥</span>
        </p>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />

      <Link to="/" className="auth-brand">
        <span className="auth-brand-mark">S</span>
        <span>
          Skill<span>Swap</span>
        </span>
      </Link>

      <section className="auth-card">
        <div className="auth-icon">✦</div>

        <p className="auth-eyebrow">YOUR JOURNEY STARTS HERE</p>

        <h1>Create your account</h1>

        <p className="auth-subtitle">
          Share what you know. Discover what you can learn.
        </p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="register-name">Full name</label>

          <input
            id="register-name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            minLength={2}
            maxLength={60}
            required
          />

          <label htmlFor="register-email">Email address</label>

          <input
            id="register-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            maxLength={254}
            required
          />

          <label htmlFor="register-password">Password</label>

          <div className="auth-password-field">
            <input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              maxLength={72}
              required
            />

            <button
              type="button"
              className="auth-show-password"
              onClick={() =>
                setShowPassword((previous) => !previous)
              }
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <p className="auth-hint">
            Use a password you haven't used on another website.
          </p>

          <button
            className="auth-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Creating account..." : "Create account"}
            {!submitting && <span aria-hidden="true">→</span>}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Log in</Link>
        </p>
      </section>

      <p className="auth-footer">
        Made for curious minds <span>♥</span>
      </p>
    </main>
  );
}