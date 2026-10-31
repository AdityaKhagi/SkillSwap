
import { Link } from "react-router-dom";
import "./Community.css";

const members = [
  {
    initials: "AK",
    name: "Alex Kumar",
    role: "Computer Science Student",
    color: "community-purple",
    skills: ["React", "Node.js"],
    learning: "UI/UX Design",
    status: "Ready to exchange",
  },
  {
    initials: "PS",
    name: "Priya Sharma",
    role: "Creative Designer",
    color: "community-peach",
    skills: ["Figma", "Graphic Design"],
    learning: "Python",
    status: "Open to learning",
  },
  {
    initials: "RV",
    name: "Rahul Verma",
    role: "Aspiring Data Scientist",
    color: "community-green",
    skills: ["Python", "SQL"],
    learning: "Web Development",
    status: "Ready to exchange",
  },
];

export default function Community() {
  return (
    <section className="section community-section" id="community">
      <div className="container">
        <div className="community-heading">
          <div className="community-heading-copy">
            <span className="eyebrow">MORE THAN A PLATFORM</span>

            <h2>
              Find your people.
              <br />
              <span className="gradient-text">Grow together.</span>
            </h2>

            <p>
              Meet curious minds, share what you know, and discover
              opportunities to learn from each other.
            </p>
          </div>

          <Link to="/explore" className="community-explore-btn">
            Meet your next learning partner <span>↗</span>
          </Link>
        </div>

        <div className="community-grid">
          {members.map((member, index) => (
            <article className="community-card" key={member.initials}>
              <div className="community-card-top">
                <div className={`community-avatar ${member.color}`}>
                  {member.initials}
                </div>

                <span className="community-member-number">
                  MEMBER 0{index + 1}
                </span>
              </div>

              <h3>{member.name}</h3>
              <p className="community-role">{member.role}</p>

              <div className="community-divider" />

              <div className="community-skill-group">
                <span className="community-label">CAN TEACH</span>

                <div className="community-tags">
                  {member.skills.map((skill) => (
                    <span className="community-tag" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="community-skill-group">
                <span className="community-label">WANTS TO LEARN</span>

                <span className="community-learning-tag">
                  <span>✦</span> {member.learning}
                </span>
              </div>

              <div className="community-card-footer">
                <span className="community-online-dot" />
                <span>{member.status}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="community-banner">
          <div className="community-banner-symbol">✳</div>

          <div className="community-banner-copy">
            <h3>Your knowledge could be someone's breakthrough.</h3>
            <p>
              Start with one skill. Meet one person. Make a difference.
            </p>
          </div>

          <Link to="/register" className="community-banner-btn">
            Join the community <span>→</span>
          </Link>
        </div>

        <p className="community-disclaimer">
          Meet the kinds of learners you could connect with on SkillSwap.
          Profiles shown here are illustrative examples.
        </p>
      </div>
    </section>
  );
}
