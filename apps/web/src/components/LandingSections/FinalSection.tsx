import { ArrowRight } from "lucide-react";
import { MotionSection } from "@/components/LandingSections/shared";
import { landingLabels } from "@/pages/LandingPage/labels";

export function FinalSection() {
  return (
    <MotionSection className="final-section" ariaLabelledby="final-title">
      <div>
        <p className="eyebrow">{landingLabels.final.eyebrow}</p>
        <h2 id="final-title">{landingLabels.final.title}</h2>
      </div>
      <a className="primary-button" href="#workflow">
        {landingLabels.final.action}
        <ArrowRight size={18} aria-hidden="true" />
      </a>
    </MotionSection>
  );
}
