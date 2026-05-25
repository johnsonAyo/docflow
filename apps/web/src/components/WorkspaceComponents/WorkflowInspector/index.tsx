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
      <PlaceholderCard title={builderLabels.inspector.latestRun.title}>
        Runs will appear here once this workflow is published and documents are uploaded.
      </PlaceholderCard>
      <div className="inspector-card config-card">
        <div className="inspector-heading"><span>Advanced config</span><b>JSON</b></div>
        <pre>{configPreview}</pre>
      </div>
      <div className="inspector-card evidence-card">
        <span>{builderLabels.inspector.evidence.title}</span>
        <EmptyPreview className="evidence-document">Upload a document to preview the text and visual extraction layout.</EmptyPreview>
        <EmptyPreview className="extraction-result">Extracted fields and confidence scores will appear here.</EmptyPreview>
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

function PlaceholderCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="inspector-card">
      <div className="inspector-heading"><span>{title}</span></div>
      <div className="run-list"><EmptyPreview>{children}</EmptyPreview></div>
    </div>
  );
}

function EmptyPreview({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={{ border: "1px dashed var(--line-strong)", color: "var(--muted)", fontStyle: "italic", fontSize: "0.85rem", background: "transparent", textAlign: "center", padding: "24px 16px", borderRadius: "var(--r-sm)" }}>
      {children}
    </div>
  );
}
