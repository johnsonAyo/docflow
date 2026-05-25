import { FileText, SearchCheck } from "lucide-react";
import { MotionSection, ProofCard, SectionHeading } from "@/components/LandingSections/shared";
import { landingLabels } from "@/pages/LandingPage/labels";

export function ProofSection() {
  return (
    <MotionSection className="section proof-section" id="demo" ariaLabelledby="demo-title">
      <SectionHeading compact eyebrow={landingLabels.proof.eyebrow} title={landingLabels.proof.title} titleId="demo-title" />
      <div className="proof-grid">
        <ProofCard card={landingLabels.proof.cards.invoice} className="main-feature bento-blue" Icon={FileText} />
        <ProofCard card={landingLabels.proof.cards.contract} className="featured bento-dark" Icon={SearchCheck} />
      </div>
    </MotionSection>
  );
}
