import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await forgotPassword(email.trim());

      setMessage(response.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />
      <div className="auth-decoration auth-decoration-three" />

      <div className="auth-card">
        <Link to="/" className="auth-brand">
          Skill<span>Swap</span>
        </Link>

        <div className="auth-icon">
          <span>🔐</span>
        </div>

        <div className="auth-header">
          <h1>Forgot password?</h1>
          <p>
            Don't worry! Enter your registered email address
            and we'll send you a password reset link.
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {message ? (
          <div className="auth-success-card">
            <div className="auth-success-icon">✉️</div>

            <h2>Check your inbox</h2>

            <p className="auth-success-message">
              {message}
            </p>

            <p className="auth-success-hint">
              If an account exists with this email, you should
              receive a reset link shortly. Check your Spam folder
              too.
            </p>

            <Link to="/login" className="auth-submit">
              Back to login
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-button-spinner" />
                  Sending reset link...
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Remember your password?{" "}
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}