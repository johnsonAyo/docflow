import { MotionSection, SectionHeading } from "@/components/LandingSections/shared";
import { landingLabels } from "@/pages/LandingPage/labels";

export function UseCasesSection() {
  return (
    <MotionSection className="section usecase-section" ariaLabelledby="usecase-title">
      <SectionHeading compact eyebrow={landingLabels.useCases.eyebrow} title={landingLabels.useCases.title} titleId="usecase-title" />
      <div className="usecase-strip" aria-label="Example document workflows">
        {landingLabels.useCases.items.map((useCase) => (
          <span key={useCase}>{useCase}</span>
        ))}
      </div>
    </MotionSection>
  );
}
