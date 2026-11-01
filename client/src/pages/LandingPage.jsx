
import SectionScroller from "../components/SectionScroller";

import Hero from "./sections/Hero";
import IntroSection from "./sections/IntroSection";
import Skills from "./sections/Skills";
import HowItWorks from "./sections/HowItWorks";
import Community from "./sections/Community";
import FinalCTA from "./sections/FinalCTA";

export default function LandingPage() {
  return (
    <SectionScroller>
      <Hero />
      <IntroSection />
      <Skills />
      <HowItWorks />
      <Community />
      <FinalCTA />
    </SectionScroller>
  );
}
