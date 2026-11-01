
import { Link } from "react-router-dom";
import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    title: "Discover",
    description: "Find someone who knows what you want to learn.",
    label: "Explore skills",
    icon: "⌕",
  },
  {
    number: "02",
    title: "Request",
    description: "Send an exchange request and introduce yourself.",
    label: "Make a connection",
    icon: "↗",
  },
  {
    number: "03",
    title: "Connect",
    description: "Agree on a time and how you'll learn together.",
    label: "Plan your session",
    icon: "◎",
  },
  {
    number: "04",
    title: "Exchange",
    description: "Teach what you know. Learn something new.",
    label: "Grow together",
    icon: "✳",
  },
];

export default function HowItWorks() {
  return (
    <section className="exchange-section" id="how-it-works">
      <div className="exchange-bg">
        <div className="exchange-glow exchange-glow-one" />
        <div className="exchange-glow exchange-glow-two" />
        <div className="exchange-grid-pattern" />
      </div>

      <div className="exchange-container">

        {/* Section heading */}
        <div className="exchange-header">
          <div>
            <span className="exchange-eyebrow">
              <span />
              04 / THE PROCESS
            </span>

            <h2>
              Learning is
              <br />
              <span>better together.</span>
            </h2>
          </div>

          <div className="exchange-header-note">
            <span className="exchange-note-mark">↗</span>
            <p>
              Not another course.
              <br />
              A real exchange of knowledge.
            </p>
          </div>
        </div>

        {/* Main exchange illustration */}
        <div className="exchange-visual">

          <div className="exchange-person exchange-person-left">
            <div className="exchange-person-orbit">
              <div className="exchange-avatar exchange-avatar-left">
                <span>A</span>
              </div>
              <span className="exchange-orbit-dot" />
            </div>

            <span className="exchange-person-label">PERSON A</span>
            <h3>Can teach</h3>
            <span className="exchange-person-skill">WEB DEVELOPMENT</span>
          </div>

          <div className="exchange-middle">
            <div className="exchange-line exchange-line-left" />
            <div className="exchange-middle-symbol">
              <span>↔</span>
            </div>
            <div className="exchange-line exchange-line-right" />

            <div className="exchange-middle-caption">
              <span className="exchange-caption-dot" />
              KNOWLEDGE EXCHANGE
            </div>
          </div>

          <div className="exchange-person exchange-person-right">
            <div className="exchange-person-orbit">
              <div className="exchange-avatar exchange-avatar-right">
                <span>B</span>
              </div>
              <span className="exchange-orbit-dot" />
            </div>

            <span className="exchange-person-label">PERSON B</span>
            <h3>Wants to learn</h3>
            <span className="exchange-person-skill">WEB DEVELOPMENT</span>
          </div>

          <div className="exchange-floating exchange-floating-left">
            <span>✳</span> SHARE
          </div>

          <div className="exchange-floating exchange-floating-right">
            LEARN <span>✦</span>
          </div>

          <div className="exchange-visual-bottom">
            <span>YOUR KNOWLEDGE HAS VALUE</span>
            <span>EVERYONE HAS SOMETHING TO TEACH</span>
          </div>
        </div>

        {/* Process steps */}
        <div className="exchange-steps-heading">
          <span>THE JOURNEY</span>
          <span>FOUR SIMPLE STEPS <span>↓</span></span>
        </div>

        <div className="exchange-steps">
          {steps.map((step) => (
            <article className="exchange-step" key={step.number}>
              <div className="exchange-step-top">
                <span className="exchange-step-number">
                  {step.number}
                </span>
                <span className="exchange-step-icon">
                  {step.icon}
                </span>
              </div>

              <div className="exchange-step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>

              <div className="exchange-step-bottom">
                <span>{step.label}</span>
                <span>↗</span>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="exchange-cta">
          <div className="exchange-cta-copy">
            <span>YOUR FIRST EXCHANGE STARTS HERE</span>
            <h3>What will you learn today?</h3>
            <p>One skill shared can open up a whole new world.</p>
          </div>

          <Link to="/register" className="exchange-cta-button">
            Start your journey <span>↗</span>
          </Link>
        </div>

        <div className="exchange-footer-line">
          <span>SHARE WHAT YOU KNOW.</span>
          <span className="exchange-footer-brand">Skill<span>?</span></span>
          <span>DISCOVER WHAT YOU DON'T.</span>
        </div>
      </div>
    </section>
  );
}
