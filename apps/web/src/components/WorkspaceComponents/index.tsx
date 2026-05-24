import { ArrowRight, CheckCircle2, Download, Plus, Send, Upload, X } from "lucide-react";
import { type FormEvent } from "react";
import {
  AppField,
  WorkflowDefinition,
  WorkflowDraft,
  WorkflowSaveState,
  WorkflowStage,
  AppSection,
  WorkspaceItem,
} from "@/types";
import {
  workspaceComponentsLabels,
  workflowStages,
  appRuns,
  workspaceSectionContent,
} from "./labels";

export function WorkflowOverview({
  onCreateWorkflow,
  onOpenWorkflow,
  onRunWorkflow,
  savedWorkflows,
}: {
  onCreateWorkflow: (name: string, documentType: string) => void;
  onOpenWorkflow: (workflowId?: string) => void;
  onRunWorkflow: (workflowId: string) => void;
  savedWorkflows: WorkflowDefinition[];
}) {
  const workflowRows = savedWorkflows.map((workflow) => ({
    id: workflow.id,
    name: workflow.name,
    type: workflow.document_type,
    status: workflow.status === "published" ? "Published" : "Draft",
    documents: "API saved",
    owner: "Workspace",
  }));

  return (
    <div className="workflow-home">
      <section className="workflow-list-panel" aria-labelledby="published-workflows-title">
        <div className="builder-title-row">
          <div>
            <p className="app-kicker">{workspaceComponentsLabels.overview.publishedWorkflows.kicker}</p>
            <h2 id="published-workflows-title">{workspaceComponentsLabels.overview.publishedWorkflows.title}</h2>
          </div>
          <button
            className="app-secondary-action compact"
            type="button"
            onClick={() => onOpenWorkflow()}
          >
            {workspaceComponentsLabels.overview.publishedWorkflows.actionOpen}
          </button>
        </div>

        <div className="published-workflow-list">
          {workflowRows.length === 0 ? (
            <div className="empty-workflow-state">
              <strong>No workflows saved yet</strong>
              <p>Create and publish your first workflow, then upload your own documents in Runs.</p>
            </div>
          ) : null}
          {workflowRows.map((workflow) => (
            <article className="published-workflow-row" key={workflow.id ?? workflow.name}>
              <div>
                <strong>{workflow.name}</strong>
                <span>{workflow.type} · {workflow.owner}</span>
              </div>
              <span data-status={workflow.status}>{workflow.status}</span>
              <b>{workflow.documents}</b>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="app-secondary-action compact"
                  type="button"
                  onClick={() => onOpenWorkflow(workflow.id)}
                >
                  {workspaceComponentsLabels.overview.publishedWorkflows.actionEdit}
                </button>
                <button
                  className="app-primary-action compact"
                  type="button"
                  onClick={() => onRunWorkflow(workflow.id!)}
                >
                  Run
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="workflow-create-panel" aria-labelledby="create-workflow-title">
        <p className="app-kicker">{workspaceComponentsLabels.overview.createWorkflow.kicker}</p>
        <h2 id="create-workflow-title">{workspaceComponentsLabels.overview.createWorkflow.title}</h2>
        <form
          className="create-workflow-fields"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = String(formData.get("name") || "Contract intake");
            const type = "Contract";
            onCreateWorkflow(name, type);
          }}
        >
          <label>
            {workspaceComponentsLabels.overview.createWorkflow.fields.name}
            <input name="name" type="text" defaultValue={workspaceComponentsLabels.overview.createWorkflow.fields.nameValue} required />
          </label>
          <button className="app-primary-action" type="submit">
            <Plus size={16} aria-hidden="true" />
            {workspaceComponentsLabels.overview.createWorkflow.action}
          </button>
        </form>
      </aside>
    </div>
  );
}

export function WorkflowBuilder({
  activeStage,
  fields,
  workflowDraft,
  configPreview,
  validationErrors,
  saveState,
  onAddField,
  onChangeStage,
  onWorkflowDraftChange,
}: {
  activeStage: WorkflowStage;
  fields: AppField[];
  workflowDraft: WorkflowDraft;
  configPreview: string;
  validationErrors: string[];
  saveState: WorkflowSaveState;
  onAddField: () => void;
  onChangeStage: (stage: WorkflowStage) => void;
  onWorkflowDraftChange: (updates: Partial<WorkflowDraft>) => void;
}) {
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
          {activeStage === "Document" ? (
            <DocumentStage draft={workflowDraft} onDraftChange={onWorkflowDraftChange} onNext={() => onChangeStage("Fields")} />
          ) : null}
          {activeStage === "Fields" ? <FieldsStage fields={fields} onAddField={onAddField} onNext={() => onChangeStage("Review")} /> : null}
          {activeStage === "Review" ? <ReviewStage onNext={() => onChangeStage("Delivery")} /> : null}
          {activeStage === "Delivery" ? <DeliveryStage /> : null}
        </div>
      </section>

      <aside className="app-inspector" aria-label="Workflow inspector">
        <div className="inspector-card status-card">
          <span>{workspaceComponentsLabels.builder.inspector.status.title}</span>
          <strong>{workspaceComponentsLabels.builder.inspector.status.state}</strong>
          <p>{workspaceComponentsLabels.builder.inspector.status.description(4, fields.length + 7, 3)}</p>
          <small data-save-state={saveState.status}>{saveState.message}</small>
        </div>

        {validationErrors.length > 0 ? (
          <div className="inspector-card validation-card">
            <span>Validation</span>
            <ul>
              {validationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="inspector-card">
          <div className="inspector-heading">
            <span>{workspaceComponentsLabels.builder.inspector.latestRun.title}</span>
            <b>{workspaceComponentsLabels.builder.inspector.latestRun.batch}</b>
          </div>
          <div className="run-list">
            {appRuns.map((run) => (
              <div className="run-row" key={run.document}>
                <div>
                  <strong>{run.document}</strong>
                  <span>{run.type} · {run.owner}</span>
                </div>
                <b data-status={run.status}>{run.status}</b>
              </div>
            ))}
          </div>
        </div>

        <div className="inspector-card config-card">
          <div className="inspector-heading">
            <span>Advanced config</span>
            <b>JSON</b>
          </div>
          <pre>{configPreview}</pre>
        </div>

        <div className="inspector-card evidence-card">
          <span>{workspaceComponentsLabels.builder.inspector.evidence.title}</span>
          <div className="evidence-document">
            <b>{workspaceComponentsLabels.builder.inspector.evidence.document.clause}</b>
            <p>{workspaceComponentsLabels.builder.inspector.evidence.document.text}</p>
          </div>
          <div className="extraction-result">
            <strong>{workspaceComponentsLabels.builder.inspector.evidence.result.title}</strong>
            <span>{workspaceComponentsLabels.builder.inspector.evidence.result.details}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function DocumentStage({
  draft,
  onDraftChange,
  onNext,
}: {
  draft: WorkflowDraft;
  onDraftChange: (updates: Partial<WorkflowDraft>) => void;
  onNext: () => void;
}) {
  return (
    <>
      <div className="builder-title-row">
        <div>
          <p className="app-kicker">{workspaceComponentsLabels.builder.stages.document.kicker}</p>
          <h2>{workspaceComponentsLabels.builder.stages.document.title}</h2>
        </div>
      </div>

      <div className="workflow-form-grid">
        <label>
          {workspaceComponentsLabels.builder.stages.document.fields.name}
          <input
            type="text"
            value={draft.name}
            onChange={(event) => onDraftChange({ name: event.target.value })}
          />
        </label>
        <label>
          {workspaceComponentsLabels.builder.stages.document.fields.type}
          <select
            value={draft.documentType}
            onChange={(event) => onDraftChange({ documentType: event.target.value })}
          >
            {workspaceComponentsLabels.builder.stages.document.fields.typeOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </label>
        <label>
          {workspaceComponentsLabels.builder.stages.document.fields.source}
          <select
            value={draft.intakeSource}
            onChange={(event) => onDraftChange({ intakeSource: event.target.value })}
          >
            {workspaceComponentsLabels.builder.stages.document.fields.sourceOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </label>
        <label>
          {workspaceComponentsLabels.builder.stages.document.fields.record}
          <textarea
            value={draft.completeRecord}
            onChange={(event) => onDraftChange({ completeRecord: event.target.value })}
          />
        </label>
      </div>

      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
        <button className="app-primary-action" type="button" onClick={onNext}>
          Next: Field schema <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </>
  );
}

function FieldsStage({ fields, onAddField, onNext }: { fields: AppField[]; onAddField: () => void; onNext: () => void }) {
  return (
    <>
      <div className="builder-title-row">
        <div>
          <p className="app-kicker">{workspaceComponentsLabels.builder.stages.fields.kicker}</p>
          <h2>{workspaceComponentsLabels.builder.stages.fields.title}</h2>
        </div>
        <button className="app-secondary-action compact" type="button" onClick={onAddField}>
          <Plus size={15} aria-hidden="true" />
          {workspaceComponentsLabels.builder.stages.fields.action}
        </button>
      </div>

      <div className="schema-table" role="table" aria-label="Extraction schema">
        <div className="schema-row schema-head" role="row">
          {workspaceComponentsLabels.builder.stages.fields.tableHeaders.map((header) => (
            <span key={header}>{header}</span>
          ))}
        </div>
        {fields.map((field) => (
          <div className="schema-row" role="row" key={`${field.name}-${field.source}`}>
            <strong>{field.name}</strong>
            <span>{field.type}</span>
            <span>{field.source}</span>
            <span>{field.confidence}</span>
            <span>{field.rule}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
        <button className="app-primary-action" type="button" onClick={onNext}>
          Next: Review rules <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </>
  );
}

function ReviewStage({ onNext }: { onNext: () => void }) {
  return (
    <>
      <div className="builder-title-row">
        <div>
          <p className="app-kicker">{workspaceComponentsLabels.builder.stages.review.kicker}</p>
          <h2>{workspaceComponentsLabels.builder.stages.review.title}</h2>
        </div>
      </div>

      <div className="rules-and-actions">
        <article>
          <p className="app-kicker">{workspaceComponentsLabels.builder.stages.review.confidence.kicker}</p>
          <h3>{workspaceComponentsLabels.builder.stages.review.confidence.title}</h3>
          <ul>
            {workspaceComponentsLabels.builder.stages.review.confidence.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <p className="app-kicker">{workspaceComponentsLabels.builder.stages.review.assignment.kicker}</p>
          <h3>{workspaceComponentsLabels.builder.stages.review.assignment.title}</h3>
          <ul>
            {workspaceComponentsLabels.builder.stages.review.assignment.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
        <button className="app-primary-action" type="button" onClick={onNext}>
          Next: Delivery <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </>
  );
}

function DeliveryStage() {
  return (
    <>
      <div className="builder-title-row">
        <div>
          <p className="app-kicker">{workspaceComponentsLabels.builder.stages.delivery.kicker}</p>
          <h2>{workspaceComponentsLabels.builder.stages.delivery.title}</h2>
        </div>
      </div>

      <div className="rules-and-actions">
        <article>
          <p className="app-kicker">{workspaceComponentsLabels.builder.stages.delivery.webhook.kicker}</p>
          <h3>{workspaceComponentsLabels.builder.stages.delivery.webhook.title}</h3>
          <ul>
            {workspaceComponentsLabels.builder.stages.delivery.webhook.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <p className="app-kicker">{workspaceComponentsLabels.builder.stages.delivery.export.kicker}</p>
          <h3>{workspaceComponentsLabels.builder.stages.delivery.export.title}</h3>
          <ul>
            {workspaceComponentsLabels.builder.stages.delivery.export.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </>
  );
}

export function WorkspaceSectionView({
  title,
  savedWorkflows,
  uploadState,
  deliveryState,
  reviewActionState,
  items,
  isUploadingDocument,
  isTestingWebhook,
  isApprovingReview,
  runWorkflowId,
  setRunWorkflowId,
  onUploadDocument,
  onExportRecords,
  onTestWebhook,
  onApproveNextReview,
}: {
  title: Exclude<AppSection, "Workflows">;
  savedWorkflows: WorkflowDefinition[];
  uploadState: WorkflowSaveState;
  deliveryState: WorkflowSaveState;
  reviewActionState: WorkflowSaveState;
  items: WorkspaceItem[];
  isUploadingDocument: boolean;
  isTestingWebhook: boolean;
  isApprovingReview: boolean;
  runWorkflowId?: string;
  setRunWorkflowId?: (id: string) => void;
  onUploadDocument: (event: FormEvent<HTMLFormElement>) => void;
  onExportRecords: () => void;
  onTestWebhook: () => void;
  onApproveNextReview: () => void;
}) {
  const content = workspaceSectionContent[title];
  const PrimaryIcon = title === "Runs" ? Upload : title === "Records" ? Download : title === "Integrations" ? Send : CheckCircle2;

  return (
    <section className="workspace-section-page" aria-labelledby="workspace-section-title">
      <div className="workspace-section-header">
        <div>
          <p className="app-kicker">{content.kicker}</p>
          <h2 id="workspace-section-title">{content.title}</h2>
          <p>{content.description}</p>
        </div>
        <div className="inline-actions">
          {content.actions.map((action, index) => (
            <button
              className={action.intent === "primary" ? "app-primary-action" : "app-secondary-action"}
              key={action.label}
              type="button"
              disabled={
                (title === "Integrations" && index === 0 && isTestingWebhook) ||
                (title === "Review queue" && index === 0 && isApprovingReview)
              }
              onClick={() => {
                if (title === "Records" && index === 0) {
                  onExportRecords();
                }
                if (title === "Review queue" && index === 0) {
                  onApproveNextReview();
                }
                if (title === "Integrations" && index === 0) {
                  onTestWebhook();
                }
              }}
            >
              {index === 0 ? <PrimaryIcon size={16} aria-hidden="true" /> : null}
              {title === "Integrations" && index === 0 && isTestingWebhook ? "Testing..." : null}
              {title === "Review queue" && index === 0 && isApprovingReview ? "Approving..." : null}
              {!(title === "Integrations" && index === 0 && isTestingWebhook) && !(title === "Review queue" && index === 0 && isApprovingReview) ? action.label : null}
            </button>
          ))}
        </div>
      </div>
      {title === "Review queue" ? (
        <p className="delivery-state-message" data-save-state={reviewActionState.status}>{reviewActionState.message}</p>
      ) : null}
      {title === "Integrations" ? (
        <p className="delivery-state-message" data-save-state={deliveryState.status}>{deliveryState.message}</p>
      ) : null}

      <div className="workspace-item-list">
        {title === "Runs" ? (
          <form className="document-upload-panel" onSubmit={onUploadDocument}>
            <div>
              <p className="app-kicker">Upload documents</p>
              <h3>Create a document run</h3>
              <span data-save-state={uploadState.status}>{uploadState.message}</span>
            </div>
            <label>
              Workflow
              <select 
                name="workflow_id" 
                disabled={savedWorkflows.length === 0 || isUploadingDocument}
                value={runWorkflowId}
                onChange={(e) => setRunWorkflowId?.(e.target.value)}
              >
                {savedWorkflows.length === 0 ? (
                  <option value="">Publish a workflow first</option>
                ) : null}
                {savedWorkflows.map((workflow) => (
                  <option key={workflow.id} value={workflow.id}>{workflow.name}</option>
                ))}
              </select>
            </label>
            <label>
              Document type
              <select name="document_type" disabled={isUploadingDocument} defaultValue="Invoice">
                <option>Invoice</option>
                <option>Contract</option>
                <option>Vendor form</option>
                <option>Custom document</option>
              </select>
            </label>
            <label>
              File
              <input name="file" type="file" accept="application/pdf,image/*" disabled={isUploadingDocument} />
            </label>
            <button
              className="app-primary-action"
              type="submit"
              disabled={savedWorkflows.length === 0 || isUploadingDocument}
            >
              <Upload size={16} aria-hidden="true" />
              {isUploadingDocument ? "Uploading..." : "Upload"}
            </button>
          </form>
        ) : null}

        {items.length === 0 ? (
          <div className="empty-workflow-state">
            <strong>{title === "Runs" ? "No document runs yet" : title === "Review queue" ? "No review items yet" : "No records yet"}</strong>
            <p>{title === "Runs" ? "Publish a workflow and upload your own document to create the first run." : title === "Review queue" ? "Review items will appear after extraction finds missing or low-confidence fields." : "Extracted records will appear after documents are uploaded and processed."}</p>
          </div>
        ) : null}

        {items.map((item) => (
          <article className="workspace-item-row" key={`${title}-${item.title}`}>
            <div>
              <strong>{item.title}</strong>
              <span>{item.meta}</span>
            </div>
            <p>{item.detail}</p>
            <b data-status={item.status}>{item.status}</b>
            <button className="icon-row-action" type="button" aria-label={`Open ${item.title}`}>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AddFieldModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="field-modal" role="dialog" aria-modal="true" aria-labelledby="field-modal-title">
        <div className="modal-header">
          <div>
            <p className="app-kicker">{workspaceComponentsLabels.addFieldModal.kicker}</p>
            <h2 id="field-modal-title">{workspaceComponentsLabels.addFieldModal.title}</h2>
          </div>
          <button className="icon-action" type="button" aria-label={workspaceComponentsLabels.addFieldModal.closeAria} onClick={onClose}>
            <X size={17} aria-hidden="true" />
          </button>
        </div>

        <form className="field-modal-form" onSubmit={onSubmit}>
          <label>
            {workspaceComponentsLabels.addFieldModal.fields.name.label}
            <input name="fieldName" type="text" placeholder={workspaceComponentsLabels.addFieldModal.fields.name.placeholder} required />
          </label>
          <label>
            {workspaceComponentsLabels.addFieldModal.fields.type.label}
            <select name="fieldType" defaultValue={workspaceComponentsLabels.addFieldModal.fields.type.options[2]}>
              {workspaceComponentsLabels.addFieldModal.fields.type.options.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </label>
          <label>
            {workspaceComponentsLabels.addFieldModal.fields.source.label}
            <select name="evidenceSource" defaultValue={workspaceComponentsLabels.addFieldModal.fields.source.options[3]}>
              {workspaceComponentsLabels.addFieldModal.fields.source.options.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </label>
          <label>
            {workspaceComponentsLabels.addFieldModal.fields.rule.label}
            <select name="reviewRule" defaultValue={workspaceComponentsLabels.addFieldModal.fields.rule.options[2]}>
              {workspaceComponentsLabels.addFieldModal.fields.rule.options.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </label>
          <label className="wide-field">
            {workspaceComponentsLabels.addFieldModal.fields.instruction.label}
            <textarea name="instruction" placeholder={workspaceComponentsLabels.addFieldModal.fields.instruction.placeholder} />
          </label>
          <div className="modal-actions">
            <button className="app-secondary-action" type="button" onClick={onClose}>
              {workspaceComponentsLabels.addFieldModal.actions.cancel}
            </button>
            <button className="app-primary-action" type="submit">
              {workspaceComponentsLabels.addFieldModal.actions.submit}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
