
import { useCallback } from "react";
import "./Hero.css";

export default function Hero() {
 const handleScroll = useCallback(() => {
  const scroller = document.querySelector(".section-scroller");
  const nextSection = document.getElementById("next-section");

  if (!scroller || !nextSection) return;

  const targetTop =
    nextSection.getBoundingClientRect().top -
    scroller.getBoundingClientRect().top +
    scroller.scrollTop;

  scroller.scrollTo({
    top: targetTop,
    behavior: "smooth",
  });
}, []);

  return (
    <section className="hero-new" id="home">
      <div className="hero-noise" aria-hidden="true" />
      <div className="hero-glow hero-glow-one" aria-hidden="true" />
      <div className="hero-glow hero-glow-two" aria-hidden="true" />

      <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
      <div className="hero-orbit hero-orbit-two" aria-hidden="true" />

      <header className="hero-header">
        <a href="/" className="hero-brand" aria-label="Skill? home">
          Skill<span>?</span>
        </a>

        <div className="hero-header-mark">
          <span className="hero-status-dot" />
          PEER LEARNING, REIMAGINED
        </div>
      </header>

      <div className="hero-center">
        <div className="hero-symbol" aria-hidden="true">
          <span className="symbol-ring symbol-ring-one" />
          <span className="symbol-ring symbol-ring-two" />

          <span className="symbol-question">?</span>

          <span className="symbol-spark symbol-spark-one">✳</span>
          <span className="symbol-spark symbol-spark-two">✦</span>
        </div>

        <div className="hero-title-wrap">
          <h1 className="hero-new-title">
            Skill<span>?</span>
          </h1>

          <div className="hero-title-line" />
        </div>

        <p className="hero-new-subtitle">
          Learn something. Teach something.
        </p>

        <div className="hero-floating hero-floating-one">
          <span className="floating-dot dot-purple" />
          DESIGN
        </div>

        <div className="hero-floating hero-floating-two">
          <span className="floating-dot dot-orange" />
          DEVELOPMENT
        </div>

        <div className="hero-floating hero-floating-three">
          <span className="floating-dot dot-green" />
          CREATIVITY
        </div>
      </div>

      <button
        type="button"
        className="hero-scroll"
        onClick={handleScroll}
        aria-label="Scroll to discover Skill?"
        aria-controls="next-section"
      >
        <span className="hero-scroll-text">
          SCROLL TO EXPLORE
        </span>

        <span className="hero-scroll-icon">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 4V19M5.5 12.5L12 19L18.5 12.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <div className="hero-corner-text" aria-hidden="true">
        <span>01</span>
        <span className="hero-corner-line" />
        <span>INTRODUCTION</span>
      </div>
    </section>
  );
}
