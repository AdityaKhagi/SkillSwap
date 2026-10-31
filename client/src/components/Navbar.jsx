
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const goToSection = (sectionId) => {
    closeMenu();

    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link className="brand" to="/" onClick={closeMenu}>
          <span className="brand-mark">S</span>
          <span>
            Skill<span className="brand-accent">Swap</span>
          </span>
        </Link>

        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav
          id="main-navigation"
          className={`nav-links ${menuOpen ? "nav-open" : ""}`}
        >
          <Link to="/" onClick={closeMenu}>
            Home
          </Link>

          <Link to="/explore" onClick={closeMenu}>
            Explore Skills
          </Link>

          <Link to="/dashboard" onClick={closeMenu}>
            Dashboard
          </Link>

          <Link to="/requests" onClick={closeMenu}>
            Requests
          </Link>

          <Link to="/sessions" onClick={closeMenu}>
            My Sessions
          </Link>

          <Link to="/profile" onClick={closeMenu}>
            Profile
          </Link>

          <button
            type="button"
            className="nav-section-link"
            onClick={() => goToSection("how-it-works")}
          >
            How it works
          </button>

          <button
            type="button"
            className="nav-section-link"
            onClick={() => goToSection("community")}
          >
            Community
          </button>

          <div className="nav-actions">
            <Link
              className="login-link"
              to="/login"
              onClick={closeMenu}
            >
              Log in
            </Link>

            <Link
              className="btn btn-primary btn-small"
              to="/register"
              onClick={closeMenu}
            >
              Get started <span>→</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
