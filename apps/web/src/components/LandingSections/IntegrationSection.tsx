import { PlugZap } from "lucide-react";
import { MotionSection, SectionHeading } from "@/components/LandingSections/shared";
import { integrations, landingLabels } from "@/pages/LandingPage/labels";

export function IntegrationSection() {
  return (
    <MotionSection className="section integration-section" id="integrations" ariaLabelledby="integrations-title">
      <SectionHeading
        copy={landingLabels.integrations.copy}
        eyebrow={landingLabels.integrations.eyebrow}
        title={landingLabels.integrations.title}
        titleId="integrations-title"
      />
      <div className="integration-grid">
        {integrations.map((integration, index) => (
          <article className={`integration-item ${integrationClass(index)}`} key={integration.name}>
            <div><PlugZap size={19} aria-hidden="true" /><h3>{integration.name}</h3></div>
            <p>{integration.detail}</p>
            <span data-variant={integration.badgeVariant}>{integration.status}</span>
          </article>
        ))}
      </div>
    </MotionSection>
  );
}

function integrationClass(index: number) {
  const classNames = new Map([
    [0, "bento-span-2-col bento-dark"],
    [1, "bento-blue"],
    [2, "bento-span-2-row bento-yellow"],
    [5, "bento-green"],
    [6, "bento-span-2-col bento-blue"],
  ]);

  return classNames.get(index) || "";
}
