import { Plus, X } from "lucide-react";
import { type FormEvent } from "react";
import { AppField, WorkflowStage, AppSection } from "@/types";
import { workspaceComponentsLabels, publishedWorkflows, workflowStages, appRuns } from "./labels";

export function WorkflowOverview({
  onCreateWorkflow,
  onOpenWorkflow,
}: {
  onCreateWorkflow: () => void;
  onOpenWorkflow: () => void;
}) {
  return (
    <div className="workflow-home">
      <section className="workflow-list-panel" aria-labelledby="published-workflows-title">
        <div className="builder-title-row">
          <div>
            <p className="app-kicker">{workspaceComponentsLabels.overview.publishedWorkflows.kicker}</p>
            <h2 id="published-workflows-title">{workspaceComponentsLabels.overview.publishedWorkflows.title}</h2>
          </div>
          <button className="app-secondary-action compact" type="button" onClick={onOpenWorkflow}>
            {workspaceComponentsLabels.overview.publishedWorkflows.actionOpen}
          </button>
        </div>

        <div className="published-workflow-list">
          {publishedWorkflows.map((workflow) => (
            <article className="published-workflow-row" key={workflow.name}>
              <div>
                <strong>{workflow.name}</strong>
                <span>{workflow.type} · {workflow.owner}</span>
              </div>
              <span data-status={workflow.status}>{workflow.status}</span>
              <b>{workflow.documents}</b>
              <button className="app-secondary-action compact" type="button" onClick={onOpenWorkflow}>
                {workspaceComponentsLabels.overview.publishedWorkflows.actionEdit}
              </button>
            </article>
          ))}
        </div>
      </section>

      <aside className="workflow-create-panel" aria-labelledby="create-workflow-title">
        <p className="app-kicker">{workspaceComponentsLabels.overview.createWorkflow.kicker}</p>
        <h2 id="create-workflow-title">{workspaceComponentsLabels.overview.createWorkflow.title}</h2>
        <div className="create-workflow-fields">
          <label>
            {workspaceComponentsLabels.overview.createWorkflow.fields.name}
            <input type="text" value={workspaceComponentsLabels.overview.createWorkflow.fields.nameValue} readOnly />
          </label>
          <label>
            {workspaceComponentsLabels.overview.createWorkflow.fields.type}
            <select defaultValue={workspaceComponentsLabels.overview.createWorkflow.fields.typeOptions[2]}>
              {workspaceComponentsLabels.overview.createWorkflow.fields.typeOptions.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </label>
        </div>
        <button className="app-primary-action" type="button" onClick={onCreateWorkflow}>
          <Plus size={16} aria-hidden="true" />
          {workspaceComponentsLabels.overview.createWorkflow.action}
        </button>
      </aside>
    </div>
  );
}

export function WorkflowBuilder({
  activeStage,
  fields,
  onAddField,
  onChangeStage,
}: {
  activeStage: WorkflowStage;
  fields: AppField[];
  onAddField: () => void;
  onChangeStage: (stage: WorkflowStage) => void;
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
          {activeStage === "Document" ? <DocumentStage /> : null}
          {activeStage === "Fields" ? <FieldsStage fields={fields} onAddField={onAddField} /> : null}
          {activeStage === "Review" ? <ReviewStage /> : null}
          {activeStage === "Delivery" ? <DeliveryStage /> : null}
        </div>
      </section>

      <aside className="app-inspector" aria-label="Workflow inspector">
        <div className="inspector-card status-card">
          <span>{workspaceComponentsLabels.builder.inspector.status.title}</span>
          <strong>{workspaceComponentsLabels.builder.inspector.status.state}</strong>
          <p>{workspaceComponentsLabels.builder.inspector.status.description(4, fields.length + 7, 3)}</p>
        </div>

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

function DocumentStage() {
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
          <input type="text" value={workspaceComponentsLabels.builder.stages.document.fields.nameValue} readOnly />
        </label>
        <label>
          {workspaceComponentsLabels.builder.stages.document.fields.type}
          <select defaultValue={workspaceComponentsLabels.builder.stages.document.fields.typeOptions[0]}>
            {workspaceComponentsLabels.builder.stages.document.fields.typeOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </label>
        <label>
          {workspaceComponentsLabels.builder.stages.document.fields.source}
          <select defaultValue={workspaceComponentsLabels.builder.stages.document.fields.sourceOptions[0]}>
            {workspaceComponentsLabels.builder.stages.document.fields.sourceOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </label>
        <label>
          {workspaceComponentsLabels.builder.stages.document.fields.record}
          <textarea value={workspaceComponentsLabels.builder.stages.document.fields.recordValue} readOnly />
        </label>
      </div>
    </>
  );
}

function FieldsStage({ fields, onAddField }: { fields: AppField[]; onAddField: () => void }) {
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
    </>
  );
}

function ReviewStage() {
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

export function PlaceholderPage({ title }: { title: AppSection }) {
  return (
    <section className="placeholder-page" aria-labelledby="placeholder-title">
      <h2 id="placeholder-title">{title}</h2>
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
