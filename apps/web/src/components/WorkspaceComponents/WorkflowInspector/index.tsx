import { builderLabels } from "../WorkflowBuilder/labels";
import { WorkflowSaveState } from "@/types";

type WorkflowInspectorProps = {
  configPreview: string;
  fieldCount: number;
  ruleCount: number;
  saveState: WorkflowSaveState;
  validationErrors: string[];
};

export function WorkflowInspector({
  configPreview,
  fieldCount,
  ruleCount,
  saveState,
  validationErrors,
}: WorkflowInspectorProps) {
  return (
    <aside className="app-inspector" aria-label="Workflow inspector">
      <div className="inspector-card status-card">
        <span>{builderLabels.inspector.status.title}</span>
        <strong>{builderLabels.inspector.status.state}</strong>
        <p>{builderLabels.inspector.status.description(4, fieldCount, ruleCount)}</p>
        <small data-save-state={saveState.status}>{saveState.message}</small>
      </div>
      {validationErrors.length > 0 ? <ValidationCard errors={validationErrors} /> : null}

      <div className="inspector-card workflow-guide-card">
        <div className="inspector-heading"><span>How to define it</span><b>Guide</b></div>
        <ol>
          <li><strong>Document:</strong> describe the file type and the record you expect back.</li>
          <li><strong>Fields:</strong> list the exact values users need extracted from each upload.</li>
          <li><strong>Publish:</strong> save the schema, then run documents through the queue.</li>
        </ol>
      </div>

      <div className="inspector-card config-card">
        <div className="inspector-heading"><span>Advanced config</span><b>JSON</b></div>
        <pre>{configPreview}</pre>
      </div>
    </aside>
  );
}

function ValidationCard({ errors }: { errors: string[] }) {
  return (
    <div className="inspector-card validation-card">
      <span>Validation</span>
      <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
    </div>
  );
}
