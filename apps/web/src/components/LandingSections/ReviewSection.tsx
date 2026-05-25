import { MotionSection } from "@/components/LandingSections/shared";
import { statusClass } from "@/components/LandingSections/statusClass";
import { extractedFields, landingLabels } from "@/pages/LandingPage/labels";

export function ReviewSection() {
  return (
    <MotionSection className="section review-section" id="review" ariaLabelledby="review-title">
      <div className="review-copy">
        <p className="eyebrow">{landingLabels.review.eyebrow}</p>
        <h2 id="review-title">{landingLabels.review.title}</h2>
        <p>{landingLabels.review.copy}</p>
        <div className="review-stats" aria-label="Review statistics">
          {landingLabels.review.stats.map((stat) => (
            <span key={stat.label}><strong>{stat.value}</strong>{stat.label}</span>
          ))}
        </div>
      </div>
      <div className="review-panel" aria-label="Review queue preview">
        <div className="panel-toolbar">
          <span>{landingLabels.review.panel.toolbarTitle}</span>
          <strong>{landingLabels.review.panel.toolbarBatch}</strong>
        </div>
        <div className="document-evidence">
          <DocumentSheet />
          <div className="field-list">
            {extractedFields.map((field) => (
              <div className="field-row" key={field.label}>
                <div><span>{field.label}</span><strong>{field.value}</strong></div>
                <div className="field-meta"><small>{field.confidence}</small><b className={statusClass(field.status)}>{field.status}</b></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MotionSection>
  );
}

function DocumentSheet() {
  return (
    <div className="document-sheet">
      <span>{landingLabels.review.panel.document.type}</span>
      <b>{landingLabels.review.panel.document.company}</b>
      <i /><i /><i className="short" />
      <em>{landingLabels.review.panel.document.terms}</em>
    </div>
  );
}
