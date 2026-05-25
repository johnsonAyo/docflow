import { MotionSection } from "@/components/LandingSections/shared";
import { landingLabels } from "@/pages/LandingPage/labels";

export function IntroSection() {
  return (
    <MotionSection className="section intro-section" ariaLabelledby="intro-title">
      <div className="section-kicker">
        <span>{landingLabels.intro.kicker}</span>
      </div>
      <div className="intro-grid">
        <div>
          <h2 id="intro-title">{landingLabels.intro.title}</h2>
        </div>
        <div className="intro-copy">
          {landingLabels.intro.copyParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}
