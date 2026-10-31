
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Skills.css";

const skillCategories = [
  {
    icon: "💻",
    theme: "lavender",
    number: "01",
    title: "Technology",
    description:
      "Build practical technical skills with fellow learners and turn ideas into real projects.",
    tags: ["Web Development", "Python", "AI/ML"],
    people: "Coding & tech",
    search: "Technology",
  },
  {
    icon: "🎨",
    theme: "peach",
    number: "02",
    title: "Design & Creativity",
    description:
      "Explore design, creativity, and visual storytelling with people who share your passion.",
    tags: ["UI/UX", "Graphic Design", "Video"],
    people: "Creative skills",
    search: "Design",
  },
  {
    icon: "📈",
    theme: "mint",
    number: "03",
    title: "Business",
    description:
      "Learn how to communicate, market ideas, and turn your next big idea into action.",
    tags: ["Marketing", "Finance", "Startups"],
    people: "Business skills",
    search: "Business",
  },
  {
    icon: "🗣️",
    theme: "blue",
    number: "04",
    title: "Personal Growth",
    description:
      "Build confidence, improve communication, and develop skills that last a lifetime.",
    tags: ["Public Speaking", "English", "Productivity"],
    people: "Life skills",
    search: "Personal Growth",
  },
];

export default function Skills() {
  const navigate = useNavigate();
  const location = useLocation();

  const goToCommunity = () => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: "community" } });
      return;
    }

    document.getElementById("community")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section className="section skills-section" id="skills">
      <div className="container">
        <div className="section-heading skills-heading">
          <span className="eyebrow">EXPLORE POSSIBILITIES</span>

          <h2>
            What do you want to{" "}
            <span className="gradient-text">learn?</span>
          </h2>

          <p>
            Discover skills you want to learn and people who can help
            you master them. Share your own expertise in return.
          </p>
        </div>

        <div className="skills-grid">
          {skillCategories.map((skill) => (
            <article
              className={`skill-card skill-card-${skill.theme}`}
              key={skill.title}
            >
              <div className="skill-card-top">
                <div className={`skill-icon ${skill.theme}`}>
                  {skill.icon}
                </div>

                <span className="skill-number">{skill.number}</span>
              </div>

              <h3>{skill.title}</h3>

              <p className="skill-description">{skill.description}</p>

              <div className="tag-list">
                {skill.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className="skill-card-bottom">
                <span className="people-count">
                  <span className="people-count-icon">✦</span>
                  {skill.people}
                </span>

                <Link
                  className="arrow-link"
                  to={`/explore?category=${encodeURIComponent(skill.search)}`}
                  aria-label={`Explore ${skill.title}`}
                >
                  <span>↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="skills-bottom">
          <div className="skills-bottom-copy">
            <span className="skills-bottom-icon">✳</span>
            <p>
              <strong>Your next skill is out there.</strong>
              <span>Find your people. Exchange knowledge. Grow together.</span>
            </p>
          </div>

          <button
            type="button"
            className="skills-community-link"
            onClick={goToCommunity}
          >
            Explore the community <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
