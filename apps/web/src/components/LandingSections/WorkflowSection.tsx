import { MotionSection, SectionHeading } from "@/components/LandingSections/shared";
import { landingLabels, workflowSteps } from "@/pages/LandingPage/labels";

export function WorkflowSection() {
  return (
    <MotionSection className="section workflow-section" id="workflow" ariaLabelledby="workflow-title">
      <SectionHeading
        copy={landingLabels.workflow.copy}
        eyebrow={landingLabels.workflow.eyebrow}
        title={landingLabels.workflow.title}
        titleId="workflow-title"
      />
      <div className="builder-layout">
        <div className="builder-steps" aria-label="Builder steps">
          {workflowSteps.map((step) => (
            <article className="builder-step" key={step.title}>
              <span>{step.eyebrow}</span>
              <div><h3>{step.title}</h3><p>{step.copy}</p></div>
            </article>
          ))}
        </div>
        <div className="builder-preview" aria-label="Workflow builder preview">
          <div className="panel-toolbar">
            <span>{landingLabels.workflow.preview.toolbarTitle}</span>
            <strong>{landingLabels.workflow.preview.toolbarStatus}</strong>
          </div>
          <div className="builder-form">
            {landingLabels.workflow.preview.fields.map((field) => (
              <label key={field.label}>{field.label}<span>{field.value}</span></label>
            ))}
          </div>
          <div className="config-strip">
            <code>{landingLabels.workflow.preview.configCode}</code>
            <span>{landingLabels.workflow.preview.configFormat}</span>
          </div>
        </div>
      </div>
    </MotionSection>
  );
}
