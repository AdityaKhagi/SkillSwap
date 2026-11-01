import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function ResetPassword() {
  const { resetPassword } = useAuth();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!token) {
      setError(
        "Your reset link is invalid. Please request a new password reset link."
      );
      return;
    }

    if (password.length < 8 || password.length > 72) {
      setError("Password must be between 8 and 72 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(token, password);

      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset your password. Please request a new link."
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
          <span>🔑</span>
        </div>

        <div className="auth-header">
          <h1>Reset your password</h1>
          <p>
            Create a new password for your SkillSwap account.
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {success ? (
          <div className="auth-success-card">
            <div className="auth-success-icon">✓</div>

            <h2>Password updated!</h2>

            <p className="auth-success-message">
              Your password has been changed successfully.
              You can now log in using your new password.
            </p>

            <button
              type="button"
              className="auth-submit"
              onClick={() => navigate("/login", { replace: true })}
            >
              Continue to login
            </button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="password">New password</label>

              <div className="auth-password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={72}
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">
                Confirm new password
              </label>

              <div className="auth-password-wrapper">
                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword ? "text" : "password"
                  }
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={72}
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <p className="auth-hint">
              Use a password between 8 and 72 characters.
            </p>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading || !token}
            >
              {loading ? (
                <>
                  <span className="auth-button-spinner" />
                  Updating password...
                </>
              ) : (
                "Update password"
              )}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}