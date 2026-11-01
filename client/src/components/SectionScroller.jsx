
import { useEffect, useRef } from "react";

export default function SectionScroller({ children }) {
  const scrollerRef = useRef(null);
  const currentIndexRef = useRef(0);
  const wheelDeltaRef = useRef(0);
  const wheelTimerRef = useRef(null);
  const animationTimerRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const touchStartRef = useRef(null);

  const getSections = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return [];

    return Array.from(scroller.children).filter(
      (child) => child.tagName.toLowerCase() === "section"
    );
  };

  const getCurrentIndex = () => {
    const scroller = scrollerRef.current;
    const sections = getSections();

    if (!scroller || !sections.length) return 0;

    let closestIndex = 0;
    let smallestDistance = Infinity;

    sections.forEach((section, index) => {
      const distance = Math.abs(
        section.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top
      );

      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestIndex = index;
      }
    });

    currentIndexRef.current = closestIndex;
    return closestIndex;
  };

  const scrollToSection = (index) => {
    const scroller = scrollerRef.current;
    const sections = getSections();

    if (!scroller || !sections.length || isAnimatingRef.current) return;

    const nextIndex = Math.max(
      0,
      Math.min(index, sections.length - 1)
    );

    if (nextIndex === currentIndexRef.current) return;

    const target = sections[nextIndex];

    const targetTop =
      target.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop;

    isAnimatingRef.current = true;
    currentIndexRef.current = nextIndex;
    wheelDeltaRef.current = 0;

    scroller.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });

    window.clearTimeout(animationTimerRef.current);

    animationTimerRef.current = window.setTimeout(() => {
      isAnimatingRef.current = false;
    }, 1100);
  };

  // Only allow internal scrolling when CSS actually permits it.
  const canScrollInside = (section, direction) => {
    if (!section) return false;

    const overflowY = window.getComputedStyle(section).overflowY;

    if (overflowY !== "auto" && overflowY !== "scroll") {
      return false;
    }

    const hasOverflow =
      section.scrollHeight > section.clientHeight + 2;

    if (!hasOverflow) return false;

    const atTop = section.scrollTop <= 2;

    const atBottom =
      section.scrollTop + section.clientHeight >=
      section.scrollHeight - 2;

    return direction > 0 ? !atBottom : !atTop;
  };

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const handleWheel = (event) => {
      if (isAnimatingRef.current) {
        event.preventDefault();
        return;
      }

      if (event.ctrlKey) return;

      const delta = event.deltaY;
      if (Math.abs(delta) < 1) return;

      const sections = getSections();
      const currentIndex = getCurrentIndex();
      const currentSection = sections[currentIndex];

      if (!currentSection) return;

      // Scroll inside the current section if it has remaining content.
      if (canScrollInside(currentSection, delta)) {
        wheelDeltaRef.current = 0;
        return;
      }

      // At the section boundary, intercept the wheel gesture.
      event.preventDefault();

      if (
        wheelDeltaRef.current !== 0 &&
        Math.sign(wheelDeltaRef.current) !== Math.sign(delta)
      ) {
        wheelDeltaRef.current = 0;
      }

      wheelDeltaRef.current += delta;

      window.clearTimeout(wheelTimerRef.current);

      wheelTimerRef.current = window.setTimeout(() => {
        wheelDeltaRef.current = 0;
      }, 650);

      const threshold = 350;

      if (wheelDeltaRef.current >= threshold) {
        scrollToSection(currentIndex + 1);
      } else if (wheelDeltaRef.current <= -threshold) {
        scrollToSection(currentIndex - 1);
      }
    };

    const handleKeyDown = (event) => {
      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (
          target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
        )
      ) {
        return;
      }

      if (isAnimatingRef.current) return;

      const sections = getSections();
      const currentIndex = getCurrentIndex();
      const currentSection = sections[currentIndex];

      if (!currentSection) return;

      if (event.key === "ArrowDown" || event.key === "PageDown") {
        if (canScrollInside(currentSection, 1)) return;

        event.preventDefault();
        scrollToSection(currentIndex + 1);
      }

      if (event.key === "ArrowUp" || event.key === "PageUp") {
        if (canScrollInside(currentSection, -1)) return;

        event.preventDefault();
        scrollToSection(currentIndex - 1);
      }

      if (event.key === "Home") {
        event.preventDefault();
        scrollToSection(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        scrollToSection(sections.length - 1);
      }
    };

    const handleTouchStart = (event) => {
      touchStartRef.current = event.touches[0].clientY;
    };

    const handleTouchEnd = (event) => {
      if (
        touchStartRef.current === null ||
        isAnimatingRef.current
      ) {
        return;
      }

      const distance =
        touchStartRef.current - event.changedTouches[0].clientY;

      touchStartRef.current = null;

      if (Math.abs(distance) < 80) return;

      const sections = getSections();
      const currentIndex = getCurrentIndex();
      const currentSection = sections[currentIndex];

      if (!currentSection) return;

      if (canScrollInside(currentSection, distance)) return;

      scrollToSection(
        distance > 0 ? currentIndex + 1 : currentIndex - 1
      );
    };

    const handleResize = () => {
      const sections = getSections();
      const currentSection = sections[currentIndexRef.current];

      if (!currentSection) return;

      const targetTop =
        currentSection.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop;

      scroller.scrollTo({
        top: targetTop,
        behavior: "auto",
      });
    };

    scroller.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    scroller.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    scroller.addEventListener("touchend", handleTouchEnd, {
      passive: true,
    });

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      scroller.removeEventListener("wheel", handleWheel);
      scroller.removeEventListener("touchstart", handleTouchStart);
      scroller.removeEventListener("touchend", handleTouchEnd);

      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);

      window.clearTimeout(wheelTimerRef.current);
      window.clearTimeout(animationTimerRef.current);
    };
  }, []);

  return (
    <main className="section-scroller" ref={scrollerRef}>
      {children}
    </main>
  );
}
