
import { Link, useNavigate } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const navigate = useNavigate();

  const goToSection = (sectionId) => {
    navigate("/", { state: { scrollTo: sectionId } });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link className="footer-logo brand" to="/">
              <span className="brand-mark">S</span>
              <span>
                Skill<span className="brand-accent">Swap</span>
              </span>
            </Link>

            <p className="footer-description">
              Everyone has something worth sharing. Learn new skills,
              meet curious minds, and grow together through meaningful
              skill exchanges.
            </p>

            <div className="footer-tagline">
              <span className="footer-heart">♥</span>
              Built for curious minds
            </div>
          </div>

          <div className="footer-column">
            <h4>Discover</h4>
            <button onClick={() => navigate("/explore")}>
              Explore skills
            </button>
            <button onClick={() => goToSection("how-it-works")}>
              How it works
            </button>
            <button onClick={() => goToSection("community")}>
              Our community
            </button>
          </div>

          <div className="footer-column">
            <h4>Your journey</h4>
            <Link to="/register">Create an account</Link>
            <Link to="/login">Log in</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>

          <div className="footer-cta">
            <div className="footer-cta-icon">✦</div>
            <h4>Have a skill to share?</h4>
            <p>
              Your next learning partner might be one click away.
            </p>
            <Link to="/register" className="footer-cta-link">
              Start swapping <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Skill?. All rights reserved.
          </span>

          <span className="footer-made">
            Made with <span aria-label="love">♥</span> for lifelong learners
          </span>

          <button
            className="footer-back-top"
            onClick={() => goToSection("home")}
          >
            Back to top <span aria-hidden="true">↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
