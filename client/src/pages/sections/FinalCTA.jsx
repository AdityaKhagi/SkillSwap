
import { Link } from "react-router-dom";
import "./FinalCTA.css";

export default function FinalCTA() {
  return (
    <section className="final-cta-section" id="join">
      <div className="final-cta-glow final-cta-glow-left" />
      <div className="final-cta-glow final-cta-glow-right" />

      <div className="container">
        <div className="final-cta-card">
          <div className="final-cta-decoration final-cta-decoration-one">
            ✳
          </div>
          <div className="final-cta-decoration final-cta-decoration-two">
            ✦
          </div>

          <div className="final-cta-content">
            <span className="final-cta-eyebrow">
              YOUR NEXT CHAPTER STARTS HERE
            </span>

            <h2>
              You have a skill.
              <br />
              <span>Someone needs it.</span>
            </h2>

            <p>
              Join a community where knowledge goes both ways.
              Share what you know, discover something new, and
              make every connection count.
            </p>

            <div className="final-cta-actions">
              <Link to="/register" className="final-cta-primary">
                Start swapping <span>→</span>
              </Link>

              <Link to="/explore" className="final-cta-secondary">
                Explore skills
              </Link>
            </div>

            <div className="final-cta-note">
              <span>✦</span>
              Learn something new. Teach something valuable.
            </div>
          </div>

          <div className="final-cta-visual" aria-hidden="true">
            <div className="cta-orbit cta-orbit-one" />
            <div className="cta-orbit cta-orbit-two" />

            <div className="cta-center">
              <span className="cta-center-symbol">S</span>
              <span className="cta-center-sparkle">✦</span>
            </div>

            <div className="cta-bubble cta-bubble-one">
              <span className="cta-bubble-icon cta-icon-purple">💻</span>
              <span>Teach coding</span>
            </div>

            <div className="cta-bubble cta-bubble-two">
              <span className="cta-bubble-icon cta-icon-peach">🎨</span>
              <span>Learn design</span>
            </div>

            <div className="cta-bubble cta-bubble-three">
              <span className="cta-bubble-icon cta-icon-green">✦</span>
              <span>Grow together</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
