
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
  const [registered, setRegistered] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (name.length < 2 || name.length > 60) {
      setError("Your name must contain between 2 and 60 characters.");
      return;
    }

    if (form.password.length < 8 || form.password.length > 72) {
      setError("Password must be between 8 and 72 characters.");
      return;
    }

    try {
      setSubmitting(true);

      await register({
        name,
        email,
        password: form.password,
      });

      setForm((previous) => ({
        ...previous,
        email,
        password: "",
      }));

      setRegistered(true);
    } catch (err) {
      const data = err.response?.data;

      if (data?.requiresVerification) {
        setForm((previous) => ({
          ...previous,
          email,
          password: "",
        }));

        setRegistered(true);
        setResendMessage(
          "An account already exists with this email. You can request a new verification link."
        );
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
    try {
      setResending(true);
      setResendMessage("");

      const response = await resendVerification(form.email);

      setResendMessage(response.message);
    } catch (err) {
      setResendMessage(
        err.response?.data?.message ||
          "Unable to resend the email. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  // Verification email confirmation screen
  if (registered) {
    return (
      <main className="auth-page">
        <div className="auth-decoration auth-decoration-one" />
        <div className="auth-decoration auth-decoration-two" />
        <div className="auth-decoration auth-decoration-three" />

        <Link to="/" className="auth-brand">
          <span className="auth-brand-mark">S</span>
          <span>
            Skill<span>Swap</span>
          </span>
        </Link>

        <section className="auth-card auth-success-card">
          <div className="auth-success-icon">
            <span>✉</span>
            <div className="auth-success-pulse" />
          </div>

          <p className="auth-eyebrow">ONE LAST STEP</p>

          <h1>Check your inbox!</h1>

          <p className="auth-subtitle">
            We've sent a verification link to:
          </p>

          <div className="auth-email-display">
            {form.email}
          </div>

          <p className="auth-hint auth-success-hint">
            Open the email and click the verification button to activate
            your SkillSwap account. Don't forget to check your Spam folder.
          </p>

          {resendMessage && (
            <div className="auth-success-message" role="status">
              {resendMessage}
            </div>
          )}

          <button
            type="button"
            className="auth-submit auth-resend-btn"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? "Sending email..." : "Resend verification email"}
          </button>

          <p className="auth-switch">
            Already verified?{" "}
            <Link to="/login">Continue to login</Link>
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
      <div className="auth-decoration auth-decoration-three" />

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
              onClick={() => setShowPassword((previous) => !previous)}
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
            {submitting ? (
              <>
                <span className="auth-button-spinner" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <span aria-hidden="true">→</span>
              </>
            )}
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
