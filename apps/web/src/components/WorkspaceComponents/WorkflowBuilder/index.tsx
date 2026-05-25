import { DeliveryStage } from "@/components/WorkspaceComponents/DeliveryStage";
import { DocumentStage } from "@/components/WorkspaceComponents/DocumentStage";
import { FieldsStage } from "@/components/WorkspaceComponents/FieldsStage";
import { ReviewStage } from "@/components/WorkspaceComponents/ReviewStage";
import { WorkflowInspector } from "@/components/WorkspaceComponents/WorkflowInspector";
import { workflowStages } from "@/components/WorkspaceComponents/constants/labels";
import { AppField, WorkflowDraft, WorkflowSaveState, WorkflowStage } from "@/types";

type WorkflowBuilderProps = {
  activeStage: WorkflowStage;
  fields: AppField[];
  workflowDraft: WorkflowDraft;
  configPreview: string;
  validationErrors: string[];
  saveState: WorkflowSaveState;
  onAddField: () => void;
  onChangeStage: (stage: WorkflowStage) => void;
  onDeleteDeliveryAction: (index: number) => void;
  onDeleteField: (index: number) => void;
  onDeleteReviewRule: (index: number) => void;
  onWorkflowDraftChange: (updates: Partial<WorkflowDraft>) => void;
};

export function WorkflowBuilder({
  activeStage,
  fields,
  workflowDraft,
  configPreview,
  validationErrors,
  saveState,
  onAddField,
  onChangeStage,
  onDeleteDeliveryAction,
  onDeleteField,
  onDeleteReviewRule,
  onWorkflowDraftChange,
}: WorkflowBuilderProps) {
  return (
    <div className="app-layout">
      <section className="app-builder-panel" aria-label="Workflow configuration">
        <div className="app-stage-list" aria-label="Workflow stages">
          {workflowStages.map((stage, index) => (
            <button
              className={activeStage === stage ? "selected" : ""}
              key={stage}
              type="button"
              onClick={() => onChangeStage(stage)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {stage}
            </button>
          ))}
        </div>

        <div className="app-builder-main">
          {activeStage === "Document" && (
            <DocumentStage
              workflowDraft={workflowDraft}
              onChangeStage={onChangeStage}
              onWorkflowDraftChange={onWorkflowDraftChange}
            />
          )}
          {activeStage === "Fields" && (
            <FieldsStage
              fields={fields}
              onAddField={onAddField}
              onChangeStage={onChangeStage}
              onDeleteField={onDeleteField}
            />
          )}
          {activeStage === "Review" && (
            <ReviewStage
              onChangeStage={onChangeStage}
              onDeleteRule={onDeleteReviewRule}
              reviewRules={workflowDraft.reviewRules}
            />
          )}
          {activeStage === "Delivery" && (
            <DeliveryStage
              deliveryActions={workflowDraft.deliveryActions}
              onDeleteAction={onDeleteDeliveryAction}
            />
          )}
        </div>
      </section>

      <WorkflowInspector
        configPreview={configPreview}
        fieldCount={fields.length}
        ruleCount={workflowDraft.reviewRules.length}
        saveState={saveState}
        validationErrors={validationErrors}
      />
    </div>
  );
}

export default WorkflowBuilder;
