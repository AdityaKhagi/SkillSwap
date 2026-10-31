
import { Link } from "react-router-dom";
import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    icon: "👋",
    theme: "lavender",
    title: "Create your profile",
    description:
      "Tell the community what you know, what you love, and which skills you'd like to learn.",
    label: "Show your strengths",
  },
  {
    number: "02",
    icon: "🔎",
    theme: "peach",
    title: "Discover your match",
    description:
      "Explore skills and connect with learners who have the knowledge you're looking for.",
    label: "Find your people",
  },
  {
    number: "03",
    icon: "🤝",
    theme: "mint",
    title: "Make an exchange",
    description:
      "Send a request, agree on a session, and share your knowledge with each other.",
    label: "Learn both ways",
  },
  {
    number: "04",
    icon: "🚀",
    theme: "blue",
    title: "Grow together",
    description:
      "Practice new skills, exchange feedback, and keep building your confidence.",
    label: "Keep progressing",
  },
];

export default function HowItWorks() {
  return (
    <section className="section how-section" id="how-it-works">
      <div className="container">
        <div className="section-heading how-heading">
          <span className="eyebrow">SIMPLE BY DESIGN</span>

          <h2>
            From curious to{" "}
            <span className="gradient-text">capable.</span>
          </h2>

          <p>
            Learning something new doesn't have to be complicated.
            Find your people and turn shared knowledge into real progress.
          </p>
        </div>

        <div className="how-steps">
          {steps.map((step, index) => (
            <article className="how-step" key={step.number}>
              <div className="how-step-top">
                <div className={`how-step-icon ${step.theme}`}>
                  {step.icon}
                </div>

                <span className="how-step-number">{step.number}</span>
              </div>

              <h3>{step.title}</h3>

              <p className="how-step-description">{step.description}</p>

              <div className="how-step-bottom">
                <span className="how-step-dot" />
                <span>{step.label}</span>
              </div>

              {index < steps.length - 1 && (
                <span className="how-step-connector" aria-hidden="true">
                  →
                </span>
              )}
            </article>
          ))}
        </div>

        <div className="how-cta">
          <div className="how-cta-decoration">✳</div>

          <div className="how-cta-copy">
            <span className="how-cta-eyebrow">YOUR JOURNEY STARTS HERE</span>
            <h3>Ready to exchange your first skill?</h3>
            <p>
              Bring what you know. Discover what you don't. Grow with others.
            </p>
          </div>

          <Link to="/register" className="how-cta-button">
            Join SkillSwap <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
