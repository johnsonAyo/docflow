import { CheckCircle2 } from "lucide-react";
import { ModalShell } from "@/components/WorkspaceComponents/ModalShell";
import { reviewItemModalLabels } from "./labels";
import { ReviewInspection } from "@/lib/reviewItemInspection";

type ReviewItemModalProps = {
  inspection: ReviewInspection;
  isApproving: boolean;
  onApprove: () => void;
  onClose: () => void;
};

export function ReviewItemModal({ inspection, isApproving, onApprove, onClose }: ReviewItemModalProps) {
  return (
    <ModalShell className="review-modal" closeAria={reviewItemModalLabels.closeAria} kicker={reviewItemModalLabels.kicker} title={inspection.title} onClose={onClose}>
      <div className="review-modal-meta">
        <p>{inspection.subtitle}</p>
        <p>{inspection.summary}</p>
      </div>

      <section className="review-modal-block">
        <h3>{reviewItemModalLabels.sections.expected}</h3>
        <div className="review-field-list" role="list" aria-label={reviewItemModalLabels.sections.expected}>
          <div className="review-field-grid review-field-head" role="row">
            <span>Field</span><span>Expectation</span><span>Actual</span><span>Status</span>
          </div>
          {inspection.expectedFields.length === 0 ? (
            <p className="review-empty-state">No expected fields are configured for this workflow.</p>
          ) : (
            inspection.expectedFields.map((field) => (
              <div className="review-field-grid" role="row" key={field.name}>
                <strong>{field.name}</strong>
                <span>{field.expectation}</span>
                <span>{field.actual || "Missing"}</span>
                <b data-status={field.status}>{field.statusLabel}</b>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="review-modal-columns">
        <div className="review-modal-block">
          <h3>{reviewItemModalLabels.sections.unexpected}</h3>
          {inspection.unexpectedFields.length === 0 ? (
            <p className="review-empty-state">No unexpected extracted fields were detected.</p>
          ) : (
            <ul className="review-chip-list" aria-label={reviewItemModalLabels.sections.unexpected}>
              {inspection.unexpectedFields.map((field) => (
                <li key={field.name}>
                  <strong>{field.name}</strong>
                  <span>{field.value || "No value"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="review-modal-block">
          <h3>{reviewItemModalLabels.sections.issues}</h3>
          <ul className="review-issue-list" aria-label={reviewItemModalLabels.sections.issues}>
            {inspection.issues.map((issue, index) => (
              <li key={`${issue.field}-${index}`}>
                <strong>{issue.field}</strong>
                <span>{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="modal-actions">
        <button className="app-secondary-action" type="button" onClick={onClose}>
          {reviewItemModalLabels.actions.cancel}
        </button>
        <button className="app-primary-action" type="button" disabled={isApproving} onClick={onApprove}>
          <CheckCircle2 size={16} aria-hidden="true" />
          {isApproving ? reviewItemModalLabels.actions.approving : reviewItemModalLabels.actions.approve}
        </button>
      </div>
    </ModalShell>
  );
}

export default ReviewItemModal;
