import { workspaceComponentsLabels } from "@/components/WorkspaceComponents/labels";
import { WorkflowDraft, WorkflowStage } from "@/types";

type DocumentStageProps = {
  workflowDraft: WorkflowDraft;
  onChangeStage: (stage: WorkflowStage) => void;
  onWorkflowDraftChange: (updates: Partial<WorkflowDraft>) => void;
};

export function DocumentStage({
  workflowDraft,
  onChangeStage,
  onWorkflowDraftChange,
}: DocumentStageProps) {
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
            value={workflowDraft.name}
            placeholder="e.g. Contract intake"
            onChange={(event) => onWorkflowDraftChange({ name: event.target.value })}
          />
        </label>
        <label>
          {workspaceComponentsLabels.builder.stages.document.fields.type}
          <select
            value={workflowDraft.documentType}
            onChange={(event) => onWorkflowDraftChange({ documentType: event.target.value })}
          >
            <option value="" disabled hidden>Select document type...</option>
            {workspaceComponentsLabels.builder.stages.document.fields.typeOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </label>
        <fieldset style={{ border: "none", padding: "16px 0", margin: 0, borderBottom: "1px solid var(--line)" }}>
          <legend style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--faint)", marginBottom: "0.75rem", letterSpacing: "0.02em" }}>
            {workspaceComponentsLabels.builder.stages.document.fields.source}
          </legend>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {workspaceComponentsLabels.builder.stages.document.fields.sourceOptions.map((opt) => (
              <label key={opt} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 400, cursor: "pointer", fontSize: "0.9rem", color: "var(--ink)", letterSpacing: 0, textTransform: "none" }}>
                <input
                  type="checkbox"
                  style={{ width: 14, height: 14, accentColor: "var(--accent)", cursor: "pointer", flexShrink: 0 }}
                  checked={workflowDraft.intakeSources.includes(opt)}
                  onChange={(event) => {
                    const next = event.target.checked
                      ? [...workflowDraft.intakeSources, opt]
                      : workflowDraft.intakeSources.filter((s) => s !== opt);
                    onWorkflowDraftChange({ intakeSources: next });
                  }}
                />
                {opt}
              </label>
            ))}
          </div>
        </fieldset>
        <label>
          {workspaceComponentsLabels.builder.stages.document.fields.summary}
          <textarea
            value={workflowDraft.completeRecord}
            placeholder="Briefly describe what this workflow processes, e.g. Vendor contracts from the procurement team."
            onChange={(event) => onWorkflowDraftChange({ completeRecord: event.target.value })}
          />
        </label>
      </div>

      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
        <button className="app-primary-action" type="button" onClick={() => onChangeStage("Fields")}>
          Next: Field schema
        </button>
      </div>
    </>
  );
}

export default DocumentStage;
