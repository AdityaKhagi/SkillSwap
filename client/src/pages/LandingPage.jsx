
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import Hero from "./sections/Hero";
import TrustStrip from "./sections/TrustStrip";
import Skills from "./sections/Skills";
import HowItWorks from "./sections/HowItWorks";
import Community from "./sections/Community";
import FinalCTA from "./sections/FinalCTA";

export default function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    const sectionId = location.state?.scrollTo;

    if (!sectionId) return;

    const frame = requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [location]);

  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <TrustStrip />
        <Skills />
        <HowItWorks />
        <Community />
        <FinalCTA />
      </main>

      <Footer />
    </>
  );
}
