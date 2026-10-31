
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Hero.css";

export default function Hero() {
  const navigate = useNavigate();
  const location = useLocation();

  const goToSection = (sectionId) => {
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
    <section className="hero" id="home">
      <div className="hero-background-glow hero-glow-left" />
      <div className="hero-background-glow hero-glow-right" />

      <div className="container hero-grid">
        <div className="hero-content">
          <div className="announcement">
            <span className="announcement-dot" />
            A better way to learn together
            <span className="announcement-sparkle">✦</span>
          </div>

          <h1>
            Exchange skills.
            <br />
            <span className="gradient-text">Unlock potential.</span>
          </h1>

          <p className="hero-description">
            You have something valuable to teach, and something exciting
            to learn. Connect with students, exchange skills, and grow
            together — without breaking the bank.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-large">
              Start swapping <span>→</span>
            </Link>

            <button
              type="button"
              className="btn btn-outline btn-large"
              onClick={() => goToSection("how-it-works")}
            >
              Discover how <span className="discover-arrow">↘</span>
            </button>
          </div>

          <div className="hero-proof">
            <div className="avatar-stack" aria-hidden="true">
              <span className="mini-avatar mini-one">A</span>
              <span className="mini-avatar mini-two">R</span>
              <span className="mini-avatar mini-three">S</span>
              <span className="mini-avatar mini-four">+</span>
            </div>

            <div className="hero-proof-copy">
              <strong>Built for curious minds</strong>
              <span>Learn a skill. Share your knowledge.</span>
            </div>
          </div>

          <div className="hero-mini-features">
            <span><span className="feature-check">✓</span> Learn for free</span>
            <span><span className="feature-check">✓</span> Teach what you love</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-glow" />
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />

          <div className="exchange-card">
            <div className="exchange-card-header">
              <div>
                <span className="eyebrow">
                  <span className="eyebrow-dot" />
                  SKILL EXCHANGE
                </span>
                <h3>Everyone has something to share.</h3>
              </div>

              <span className="sparkle">✦</span>
            </div>

            <div className="exchange-person">
              <div className="avatar avatar-purple">A</div>

              <div className="exchange-person-info">
                <strong>Alex Morgan</strong>
                <span>Computer Science Student</span>
              </div>

              <span className="skill-pill">React JS</span>
            </div>

            <div className="exchange-line">
              <span className="exchange-line-icon">↕</span>
              <span>Shares knowledge with</span>
            </div>

            <div className="exchange-person">
              <div className="avatar avatar-peach">J</div>

              <div className="exchange-person-info">
                <strong>Jamie Lee</strong>
                <span>Creative Design Student</span>
              </div>

              <span className="skill-pill skill-pill-green">UI/UX</span>
            </div>

            <div className="credit-banner">
              <span className="credit-icon">✦</span>

              <div>
                <strong>A win-win exchange</strong>
                <span>Both students learn something new.</span>
              </div>

              <span className="credit-sparkle">✧</span>
            </div>

            <div className="exchange-card-footer">
              <span className="footer-status-dot" />
              <span>Knowledge goes both ways</span>
              <span className="footer-heart">♥</span>
            </div>
          </div>

          <div className="floating-label label-top">
            <span className="label-icon label-icon-purple">⌘</span>

            <div>
              <strong>Tech skills</strong>
              <span>Learn by doing</span>
            </div>

            <span className="floating-check">✓</span>
          </div>

          <div className="floating-label label-bottom">
            <span className="label-icon label-icon-green">✿</span>

            <div>
              <strong>Creative skills</strong>
              <span>Share your talent</span>
            </div>

            <span className="floating-check">✓</span>
          </div>

          <span className="decor decor-one">✦</span>
          <span className="decor decor-two">✧</span>
          <span className="decor decor-three">·</span>
        </div>
      </div>

      <div className="hero-bottom">
        <div className="hero-bottom-inner">
          <span>YOUR KNOWLEDGE HAS VALUE</span>
          <span className="bottom-divider">✳</span>
          <span>YOUR NEXT SKILL STARTS HERE</span>
          <span className="bottom-divider">✳</span>
          <span>GROW TOGETHER</span>
        </div>
      </div>
    </section>
  );
}
