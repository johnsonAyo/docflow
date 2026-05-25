import { DeleteIconButton } from "@/components/WorkspaceComponents/components/DeleteIconButton";
import { workspaceComponentsLabels } from "@/components/WorkspaceComponents/labels";
import { describeReviewRule, readable } from "@/lib/workflowItemDescriptions";
import { WorkflowRule, WorkflowStage } from "@/types";

type ReviewStageProps = {
  onChangeStage: (stage: WorkflowStage) => void;
  onDeleteRule: (index: number) => void;
  reviewRules: WorkflowRule[];
};

export function ReviewStage({ onChangeStage, onDeleteRule, reviewRules }: ReviewStageProps) {
  return (
    <>
      <div className="builder-title-row">
        <div>
          <p className="app-kicker">{workspaceComponentsLabels.builder.stages.review.kicker}</p>
          <h2>{workspaceComponentsLabels.builder.stages.review.title}</h2>
        </div>
      </div>

      <div className="rules-and-actions">
        {reviewRules.length === 0 ? <EmptyRules /> : null}
        {reviewRules.map((rule, index) => (
          <article key={`${rule.name}-${rule.condition}`}>
            <div className="builder-item-heading">
              <div>
                <p className="app-kicker">{readable(rule.condition)}</p>
                <h3>{rule.name}</h3>
              </div>
              <DeleteIconButton label={`Delete ${rule.name}`} onClick={() => onDeleteRule(index)} />
            </div>
            <ul>{describeReviewRule(rule).map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        ))}
      </div>

      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
        <button className="app-primary-action" type="button" onClick={() => onChangeStage("Delivery")}>
          Next: Delivery
        </button>
      </div>
    </>
  );
}

function EmptyRules() {
  return <div className="builder-empty-state">No review rules configured.</div>;
}

export default ReviewStage;
