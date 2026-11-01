
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setSubmitting(true);

      await login({
        email: form.email.trim(),
        password: form.password,
      });

      const destination = location.state?.from;

      if (
        destination?.pathname &&
        !["/login", "/register"].includes(destination.pathname)
      ) {
        navigate(
          {
            pathname: destination.pathname,
            search: destination.search || "",
            hash: destination.hash || "",
          },
          { replace: true }
        );
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to log in. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

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
        <div className="auth-icon">↗</div>

        <p className="auth-eyebrow">WELCOME BACK</p>

        <h1>Log in to SkillSwap</h1>

        <p className="auth-subtitle">
          Your next skill exchange is waiting for you.
        </p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="login-email">
            Email address
          </label>

          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="login-password">
            Password
          </label>

          <div className="auth-password-field">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
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

          <div className="auth-forgot-password">
            <Link to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <button
            className="auth-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="auth-button-spinner" />
                Logging in...
              </>
            ) : (
              <>
                Log in
                <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          New to SkillSwap?{" "}
          <Link to="/register">Create an account</Link>
        </p>
      </section>

      <p className="auth-footer">
        Made for curious minds <span>♥</span>
      </p>
    </main>
  );
}
