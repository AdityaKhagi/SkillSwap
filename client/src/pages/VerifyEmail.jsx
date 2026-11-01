import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const { verifyEmail, resendVerification } = useAuth();

  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [resending, setResending] = useState(false);

  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;

    started.current = true;
    let active = true;

    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const response = await verifyEmail(token);

        if (active) {
          setStatus("success");
          setMessage(response.message);
        }
      } catch (error) {
        if (active) {
          setStatus("error");
          setMessage(
            error.response?.data?.message ||
              "Verification failed. Please request a new link."
          );
        }
      }
    };

    verify();

    return () => {
      active = false;
    };
  }, [token, verifyEmail]);

  const handleResend = async (event) => {
    event.preventDefault();
    setResendMessage("");

    try {
      setResending(true);

      const response = await resendVerification(email.trim());

      setResendMessage(response.message);
    } catch (error) {
      setResendMessage(
        error.response?.data?.message ||
          "Unable to resend verification email."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="auth-page">
      <Link to="/" className="auth-brand">
        <span className="auth-brand-mark">S</span>
        <span>
          Skill<span>Swap</span>
        </span>
      </Link>

      <section className="auth-card">
        <div className="auth-icon">
          {status === "loading"
            ? "..."
            : status === "success"
              ? "✓"
              : "✉"}
        </div>

        <p className="auth-eyebrow">EMAIL VERIFICATION</p>

        <h1>
          {status === "loading"
            ? "Verifying your email"
            : status === "success"
              ? "Email verified!"
              : "Verification unsuccessful"}
        </h1>

        <p className="auth-subtitle">
          {status === "loading"
            ? "Please wait while we verify your email address."
            : message}
        </p>

        {status === "success" && (
          <Link to="/login" className="auth-submit">
            Continue to login →
          </Link>
        )}

        {status === "error" && (
          <form onSubmit={handleResend} className="auth-form">
            <label htmlFor="resend-email">Email address</label>

            <input
              id="resend-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />

            <button
              className="auth-submit"
              type="submit"
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend verification email"}
            </button>

            {resendMessage && (
              <p className="auth-hint" role="status">
                {resendMessage}
              </p>
            )}
          </form>
        )}

        <p className="auth-switch">
          <Link to="/login">Back to login</Link>
        </p>
      </section>
    </main>
  );
}