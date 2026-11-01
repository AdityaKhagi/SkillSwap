
import { Link } from "react-router-dom";
import "./Community.css";

const profiles = [
  {
    number: "01",
    initials: "01",
    title: "The Builder",
    description: "Turning ideas into working products.",
    teaches: ["React", "Node.js"],
    learns: ["UI / UX Design"],
    theme: "builder",
    symbol: "⌘",
  },
  {
    number: "02",
    initials: "02",
    title: "The Creator",
    description: "Making digital experiences beautiful.",
    teaches: ["Figma", "Graphic Design"],
    learns: ["Python"],
    theme: "creator",
    symbol: "✳",
  },
  {
    number: "03",
    initials: "03",
    title: "The Explorer",
    description: "Finding patterns and solving problems.",
    teaches: ["Python", "SQL"],
    learns: ["Web Development"],
    theme: "explorer",
    symbol: "↗",
  },
];

export default function Community() {
  return (
    <section className="community-section" id="community">
      <div className="community-container">

        {/* Heading */}
        <div className="community-header">
          <div>
            <span className="community-eyebrow">
              <span />
              05 / THE PEOPLE
            </span>

            <h2>
              Different people.
              <br />
              <span>Shared curiosity.</span>
            </h2>
          </div>

          <div className="community-header-side">
            <span className="community-question">?</span>
            <p>
              Your next learning partner
              <br />
              might be one connection away.
            </p>
            <Link to="/explore">
              DISCOVER PEOPLE <span>↗</span>
            </Link>
          </div>
        </div>

        {/* Profile showcase */}
        <div className="community-showcase">
          {profiles.map((profile) => (
            <article
              className={`community-profile community-${profile.theme}`}
              key={profile.number}
            >
              <div className="community-profile-top">
                <span>EXAMPLE PROFILE / {profile.number}</span>
                <span className="community-profile-arrow">↗</span>
              </div>

              <div className="community-profile-art">
                <div className="community-profile-orbit">
                  <div className="community-profile-symbol">
                    {profile.symbol}
                  </div>
                </div>

                <span className="community-profile-initial">
                  {profile.initials}
                </span>

                <span className="community-profile-decoration">
                  ✳
                </span>
              </div>

              <div className="community-profile-info">
                <span className="community-profile-type">
                  A CURIOUS MIND
                </span>

                <h3>{profile.title}</h3>
                <p>{profile.description}</p>
              </div>

              <div className="community-profile-skills">
                <div className="community-skill-block">
                  <span className="community-skill-label">
                    <span className="community-teach-dot" />
                    CAN TEACH
                  </span>

                  <div className="community-tags">
                    {profile.teaches.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="community-skill-block">
                  <span className="community-skill-label">
                    <span className="community-learn-dot" />
                    WANTS TO LEARN
                  </span>

                  <div className="community-tags">
                    {profile.learns.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                to="/explore"
                className="community-profile-link"
                aria-label={`Explore learners like ${profile.title}`}
              >
                <span>FIND YOUR MATCH</span>
                <span>↗</span>
              </Link>
            </article>
          ))}
        </div>

        {/* Bottom banner */}
        <div className="community-banner">
          <div className="community-banner-art">
            <span>?</span>
            <span>✳</span>
            <span>↗</span>
          </div>

          <div className="community-banner-copy">
            <span>YOUR SKILL. SOMEONE'S NEXT BIG THING.</span>
            <h3>
              You belong in
              <br />
              this exchange.
            </h3>
            <p>
              Bring your knowledge. Find your people.
              Make learning a two-way street.
            </p>
          </div>

          <Link to="/register" className="community-banner-button">
            Join Skill? <span>↗</span>
          </Link>
        </div>

        <div className="community-endline">
          <span>NO ONE KNOWS EVERYTHING.</span>
          <span className="community-endline-brand">
            Skill<span>?</span>
          </span>
          <span>EVERYONE KNOWS SOMETHING.</span>
        </div>

        <p className="community-disclaimer">
          The profiles above are illustrative examples of possible
          skill exchanges, not actual registered members.
        </p>
      </div>
    </section>
  );
}
