
import { Link } from "react-router-dom";
import "./Skills.css";

const skillCategories = [
  {
    number: "01",
    title: "Technology",
    subtitle: "Build the future.",
    icon: "⌘",
    theme: "tech",
    search: "Technology",
    tags: ["Web Development", "Python", "AI / ML"],
    visual: ["CODE", "CREATE", "DEPLOY"],
  },
  {
    number: "02",
    title: "Design",
    subtitle: "Make ideas visible.",
    icon: "✳",
    theme: "design",
    search: "Design",
    tags: ["UI / UX", "Graphic Design", "Video"],
    visual: ["IMAGINE", "DESIGN", "CREATE"],
  },
  {
    number: "03",
    title: "Business",
    subtitle: "Turn ideas into action.",
    icon: "↗",
    theme: "business",
    search: "Business",
    tags: ["Marketing", "Finance", "Startups"],
    visual: ["IDEAS", "STRATEGY", "GROWTH"],
  },
  {
    number: "04",
    title: "Personal Growth",
    subtitle: "Become your next self.",
    icon: "✦",
    theme: "growth",
    search: "Personal Growth",
    tags: ["Communication", "English", "Productivity"],
    visual: ["SPEAK", "CONNECT", "GROW"],
  },
];

export default function Skills() {
  return (
    <section className="explore-section" id="skills">
      <div className="explore-container">

        {/* Section heading */}
        <div className="explore-header">
          <div className="explore-heading-left">
            <span className="explore-eyebrow">
              <span className="explore-eyebrow-dot" />
              03 / EXPLORE YOUR POTENTIAL
            </span>

            <h2>
              There's more
              <br />
              <span>to learn.</span>
            </h2>
          </div>

          <div className="explore-heading-right">
            <span className="explore-side-mark">?</span>
            <p>
              Every person knows something
              <br />
              worth sharing.
            </p>
            <span className="explore-heading-note">
              FIND YOUR NEXT SKILL <span>↘</span>
            </span>
          </div>
        </div>

        {/* Category cards */}
        <div className="explore-grid">
          {skillCategories.map((skill) => (
            <Link
              to={`/explore?category=${encodeURIComponent(skill.search)}`}
              className={`explore-card explore-card-${skill.theme}`}
              key={skill.number}
              aria-label={`Explore ${skill.title} skills`}
            >
              <div className="explore-card-top">
                <span className="explore-card-number">
                  {skill.number} / 04
                </span>

                <span className="explore-card-arrow">↗</span>
              </div>

              {/* Decorative visual */}
              <div className="explore-card-visual">
                <div className="explore-visual-orbit">
                  <span className="explore-visual-icon">
                    {skill.icon}
                  </span>
                </div>

                <div className="explore-visual-words">
                  {skill.visual.map((word, index) => (
                    <span key={word} className={`visual-word visual-word-${index}`}>
                      {word}
                    </span>
                  ))}
                </div>

                <span className="explore-visual-star">✳</span>
              </div>

              {/* Card content */}
              <div className="explore-card-content">
                <div>
                  <h3>{skill.title}</h3>
                  <p>{skill.subtitle}</p>
                </div>

                <div className="explore-tags">
                  {skill.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>

              <div className="explore-card-footer">
                <span>DISCOVER THIS WORLD</span>
                <span className="explore-footer-arrow">→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="explore-bottom">
          <div className="explore-bottom-left">
            <span className="explore-bottom-symbol">✳</span>
            <div>
              <strong>Know something different?</strong>
              <p>Your knowledge could be someone's next big skill.</p>
            </div>
          </div>

          <Link to="/add-skill" className="explore-add-link">
            Share your skill <span>↗</span>
          </Link>
        </div>

        <div className="explore-endline">
          <span>LEARN FROM PEOPLE.</span>
          <span className="explore-endline-center">Skill<span>?</span></span>
          <span>GROW WITH PEOPLE.</span>
        </div>
      </div>
    </section>
  );
}
