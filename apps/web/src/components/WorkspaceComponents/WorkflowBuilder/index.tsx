import { Plus } from "lucide-react";
import { DeleteIconButton } from "@/components/ui/DeleteIconButton";
import { WorkflowInspector } from "@/components/WorkspaceComponents/WorkflowInspector";
import { builderLabels } from "@/components/WorkspaceComponents/WorkflowBuilder/labels";
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
  onDeleteField: (index: number) => void;
  onWorkflowDraftChange: (updates: Partial<WorkflowDraft>) => void;
  onPublishWorkflow: () => void;
  isPublishing: boolean;
};

export function WorkflowBuilder({
  fields,
  workflowDraft,
  configPreview,
  validationErrors,
  saveState,
  onAddField,
  onDeleteField,
  onWorkflowDraftChange,
  onPublishWorkflow,
  isPublishing,
}: WorkflowBuilderProps) {
  return (
    <div className="app-layout">
      <section className="app-builder-panel" aria-label="Workflow configuration">
        <div className="workflow-definition-sidebar" aria-label="Workflow definition guide">
          <span>01</span>
          <strong>Define workflow</strong>
          <p>Describe the document, choose how it enters DocFlow, then list the fields DocFlow must extract.</p>
          <b>{fields.length} extraction fields</b>
        </div>

        <div className="app-builder-main">
          <WorkflowDefinitionForm
            fields={fields}
            workflowDraft={workflowDraft}
            onAddField={onAddField}
            onDeleteField={onDeleteField}
            onPublishWorkflow={onPublishWorkflow}
            onWorkflowDraftChange={onWorkflowDraftChange}
            isPublishing={isPublishing}
          />
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

type WorkflowDefinitionFormProps = {
  fields: AppField[];
  workflowDraft: WorkflowDraft;
  onAddField: () => void;
  onDeleteField: (index: number) => void;
  onWorkflowDraftChange: (updates: Partial<WorkflowDraft>) => void;
  onPublishWorkflow: () => void;
  isPublishing: boolean;
};

function WorkflowDefinitionForm({
  fields,
  workflowDraft,
  onAddField,
  onDeleteField,
  onWorkflowDraftChange,
  onPublishWorkflow,
  isPublishing,
}: WorkflowDefinitionFormProps) {
  return (
    <div className="workflow-definition-form">
      <div className="builder-title-row">
        <div>
          <p className="app-kicker">{builderLabels.stages.definition.kicker}</p>
          <h2>{builderLabels.stages.definition.title}</h2>
        </div>
        <button className="app-secondary-action compact" type="button" onClick={onAddField}>
          <Plus size={15} aria-hidden="true" />
          {builderLabels.stages.fields.action}
        </button>
      </div>

      <section className="workflow-definition-section" aria-labelledby="document-definition-title">
        <div className="workflow-section-heading">
          <span>Document</span>
          <h3 id="document-definition-title">What should this workflow accept?</h3>
          <p>Name the workflow, define the document type, and choose the intake path. This is the context the extractor uses when processing uploads.</p>
        </div>

        <div className="workflow-form-grid">
          <label>
            {builderLabels.stages.document.fields.name}
            <input
              type="text"
              value={workflowDraft.name}
              placeholder="e.g. CV screening"
              onChange={(event) => onWorkflowDraftChange({ name: event.target.value })}
            />
          </label>
          <label>
            {builderLabels.stages.document.fields.type}
            <input
              list="workflow-document-types"
              type="text"
              value={workflowDraft.documentType}
              placeholder="e.g. CV, Contract, Invoice"
              onChange={(event) => onWorkflowDraftChange({ documentType: event.target.value })}
            />
            <datalist id="workflow-document-types">
              {builderLabels.stages.document.fields.typeOptions.map((option) => (
                <option value={option} key={option} />
              ))}
            </datalist>
          </label>
          <div className="workflow-intake-options">
            <span>{builderLabels.stages.document.fields.source}</span>
            <div>
              {builderLabels.stages.document.fields.sourceOptions.map((opt) => {
                const isDisabled = opt !== "Direct upload";
                return (
                  <label key={opt} data-tooltip={isDisabled ? "Coming soon" : undefined}>
                    <input
                      type="checkbox"
                      checked={workflowDraft.intakeSources.includes(opt)}
                      disabled={isDisabled}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...workflowDraft.intakeSources, opt]
                          : workflowDraft.intakeSources.filter((source) => source !== opt);
                        onWorkflowDraftChange({ intakeSources: next });
                      }}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          </div>
          <label>
            {builderLabels.stages.document.fields.summary}
            <textarea
              value={workflowDraft.completeRecord}
              placeholder="Describe the end record, e.g. candidate name, contact details, skills, experience, education, and review notes."
              onChange={(event) => onWorkflowDraftChange({ completeRecord: event.target.value })}
            />
          </label>
        </div>
      </section>

      <section className="workflow-definition-section" aria-labelledby="field-definition-title">
        <div className="workflow-section-heading with-action">
          <div>
            <span>Fields</span>
            <h3 id="field-definition-title">What details should be extracted?</h3>
            <p>Add the exact fields the workflow should return. For a CV, this could be candidate name, email, skills, years of experience, education, and location.</p>
          </div>
          <button className="app-secondary-action compact" type="button" onClick={onAddField}>
            <Plus size={15} aria-hidden="true" />
            Add field
          </button>
        </div>

        <div className="schema-table" role="table" aria-label="Extraction schema">
          <div className="schema-row schema-head" role="row">
            {builderLabels.stages.fields.tableHeaders.map((header) => (
              <span key={header}>{header}</span>
            ))}
          </div>
          {fields.length === 0 ? (
            <div className="builder-empty-state">
              No fields defined yet. Add the first field to build your extraction schema.
            </div>
          ) : (
            fields.map((field, index) => (
              <div className="schema-row" role="row" key={`${field.name}-${field.source}-${index}`}>
                <strong>{field.name}</strong>
                <span>{field.type}</span>
                <span>{field.confidence}</span>
                <span>{field.rule}</span>
                <DeleteIconButton label={`Delete ${field.name}`} onClick={() => onDeleteField(index)} />
              </div>
            ))
          )}
        </div>
      </section>

      <div className="workflow-definition-footer">
        <span>{fields.length} fields configured</span>
        <button className="app-primary-action" type="button" onClick={onPublishWorkflow} disabled={isPublishing}>
          {isPublishing ? "Publishing..." : "Publish workflow"}
        </button>
      </div>
    </div>
  );
}

export default WorkflowBuilder;
