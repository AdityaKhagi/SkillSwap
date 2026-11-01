
import { Link } from "react-router-dom";
import "./FinalCTA.css";

export default function FinalCTA() {
  return (
    <section className="final-cta-section" id="join">
      <div className="final-cta-background">
        <div className="final-cta-glow final-cta-glow-one" />
        <div className="final-cta-glow final-cta-glow-two" />
        <div className="final-cta-grid" />
      </div>

      <div className="final-cta-container">
        <div className="final-cta-topline">
          <span>06 / YOUR NEXT CHAPTER</span>
          <span>
            THE END IS A NEW BEGINNING <span>↗</span>
          </span>
        </div>

        <div className="final-cta-main">
          {/* LEFT CONTENT */}
          <div className="final-cta-content">
            <span className="final-cta-eyebrow">
              ONE SKILL CAN CHANGE EVERYTHING.
            </span>

            <h2>
              What you
              <br />
              know
              <br />
              <span>matters.</span>
            </h2>

            <p>
              Someone out there wants to learn what you already know.
              And someone else knows exactly what you're looking for.
            </p>

            <div className="final-cta-actions">
              <Link to="/register" className="final-cta-primary">
                Become a member <span>↗</span>
              </Link>

              <Link to="/explore" className="final-cta-secondary">
                Explore skills <span>→</span>
              </Link>
            </div>

            <div className="final-cta-note">
              <span className="final-cta-note-dot" />
              COME AS A LEARNER. LEAVE AS A CONTRIBUTOR.
            </div>
          </div>

          {/* RIGHT VISUAL */}
          <div className="final-cta-visual" aria-hidden="true">
            <div className="final-cta-orbit final-cta-orbit-one" />
            <div className="final-cta-orbit final-cta-orbit-two" />
            <div className="final-cta-orbit final-cta-orbit-three" />

            <div className="final-cta-symbol">
              <span>Skill</span>
              <span>?</span>
              <div className="final-cta-symbol-spark">✳</div>
            </div>

            <div className="final-cta-floating final-cta-float-one">
              <span>⌘</span>
              <div>
                <small>SHARE</small>
                <strong>What you know</strong>
              </div>
            </div>

            <div className="final-cta-floating final-cta-float-two">
              <span>✦</span>
              <div>
                <small>DISCOVER</small>
                <strong>Something new</strong>
              </div>
            </div>

            <div className="final-cta-floating final-cta-float-three">
              ↗
            </div>

            <div className="final-cta-visual-caption">
              KNOWLEDGE HAS NO FINISH LINE.
            </div>
          </div>
        </div>

        {/* BOTTOM BRAND LINE */}
        <div className="final-cta-bottom">
          <span>SHARE KNOWLEDGE.</span>

          <span className="final-cta-bottom-brand">
            Skill<span>?</span>
          </span>

          <span>BUILD CONNECTIONS.</span>
        </div>
      </div>
    </section>
  );
}
