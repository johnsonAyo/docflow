import { builderLabels } from "../WorkflowBuilder/labels";
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
          <p className="app-kicker">{builderLabels.stages.document.kicker}</p>
          <h2>{builderLabels.stages.document.title}</h2>
        </div>
      </div>

      <div className="workflow-form-grid">
        <label style={{ alignSelf: "start" }}>
          {builderLabels.stages.document.fields.name}
          <input
            type="text"
            value={workflowDraft.name}
            placeholder="e.g. Contract intake"
            onChange={(event) => onWorkflowDraftChange({ name: event.target.value })}
          />
        </label>
        <div style={{ display: "grid", gap: "var(--app-label-gap)" }}>
          <span style={{ color: "var(--muted)", fontSize: "var(--app-caption-size)", fontWeight: 750, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            {builderLabels.stages.document.fields.source}
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {builderLabels.stages.document.fields.sourceOptions.map((opt) => {
              const isDisabled = opt !== "Direct upload";
              return (
                <label
                  key={opt}
                  data-tooltip={isDisabled ? "Coming soon" : undefined}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontWeight: 400,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    fontSize: "var(--font-size-md)",
                    color: "var(--ink)",
                    letterSpacing: 0,
                    textTransform: "none",
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ width: 14, height: 14, accentColor: "var(--accent)", cursor: isDisabled ? "not-allowed" : "pointer", flexShrink: 0 }}
                    checked={workflowDraft.intakeSources.includes(opt)}
                    disabled={isDisabled}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [...workflowDraft.intakeSources, opt]
                        : workflowDraft.intakeSources.filter((s) => s !== opt);
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
            placeholder="Briefly describe what this workflow processes, e.g. Vendor contracts from the procurement team."
            onChange={(event) => onWorkflowDraftChange({ completeRecord: event.target.value })}
          />
        </label>
      </div>

      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
        <button className="app-primary-action" type="button" onClick={() => onChangeStage("Fields")}>
            Next
        </button>
      </div>
    </>
  );
}

export default DocumentStage;
