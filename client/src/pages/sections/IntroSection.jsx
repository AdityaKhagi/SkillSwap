
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./IntroSection.css";

export default function IntroSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const elements = section.querySelectorAll(
      ".intro-heading, .intro-panel, .intro-exchange-center, .intro-bottom"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("intro-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="intro-section"
      id="next-section"
      ref={sectionRef}
    >
      <div className="intro-background">
        <div className="intro-glow intro-glow-left" />
        <div className="intro-glow intro-glow-right" />
        <div className="intro-grid-pattern" />
      </div>

      <div className="intro-topline">
        <span>02 / THE IDEA</span>
        <span className="intro-topline-right">
          TWO PEOPLE. TWO SKILLS. ONE EXCHANGE.
        </span>
      </div>

      <div className="intro-main">
        <div className="intro-heading">
          <span className="intro-eyebrow">
            A DIFFERENT WAY TO LEARN
          </span>

          <h2>
            You know
            <span className="intro-heading-accent"> something.</span>
          </h2>

          <p>Someone else wants to know it.</p>
        </div>

        <div className="intro-exchange">
          <Link to="/register" className="intro-panel intro-panel-teach">
            <span className="intro-panel-number">01</span>
            <div className="intro-panel-symbol">↗</div>

            <div className="intro-panel-content">
              <span className="intro-panel-label">YOUR KNOWLEDGE</span>
              <h3>I CAN<br />TEACH<span>.</span></h3>
              <span className="intro-panel-link">
                Share what you know <span>↗</span>
              </span>
            </div>

            <div className="intro-panel-decoration">
              <span>+</span><span>+</span><span>+</span>
            </div>
          </Link>

          <div className="intro-exchange-center">
            <div className="intro-exchange-orbit">
              <span>↔</span>
            </div>
            <span className="intro-exchange-caption">EXCHANGE</span>
          </div>

          <Link to="/explore" className="intro-panel intro-panel-learn">
            <span className="intro-panel-number">02</span>
            <div className="intro-panel-symbol">↘</div>

            <div className="intro-panel-content">
              <span className="intro-panel-label">YOUR NEXT SKILL</span>
              <h3>I WANT<br />TO LEARN<span>.</span></h3>
              <span className="intro-panel-link">
                Find something new <span>↗</span>
              </span>
            </div>

            <div className="intro-panel-decoration">
              <span>✳</span><span>✳</span><span>✳</span>
            </div>
          </Link>
        </div>

        <div className="intro-bottom">
          <span>NO CLASSROOM REQUIRED.</span>
          <div className="intro-bottom-mark">
            Skill<span>?</span>
          </div>
          <span>JUST PEOPLE SHARING KNOWLEDGE.</span>
        </div>
      </div>
    </section>
  );
}
