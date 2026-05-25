import { Plus } from "lucide-react";
import { type FormEvent } from "react";
import { overviewLabels } from "../WorkflowOverview/labels";

type CreateWorkflowPanelProps = {
  onCreateWorkflow: (name: string, documentType: string) => void;
};

export function CreateWorkflowPanel({ onCreateWorkflow }: CreateWorkflowPanelProps) {
  return (
    <aside className="workflow-create-panel" aria-labelledby="create-workflow-title">
      <p className="app-kicker">{overviewLabels.createWorkflow.kicker}</p>
      <h2 id="create-workflow-title">{overviewLabels.createWorkflow.title}</h2>
      <form className="create-workflow-fields" onSubmit={(event) => submitWorkflow(event, onCreateWorkflow)}>
        <label>
          {overviewLabels.createWorkflow.fields.name}
          <input name="name" type="text" placeholder="e.g. New supplier packet" required />
        </label>
        <button className="app-primary-action" type="submit">
          <Plus size={16} aria-hidden="true" />
          {overviewLabels.createWorkflow.action}
        </button>
      </form>
    </aside>
  );
}

function submitWorkflow(
  event: FormEvent<HTMLFormElement>,
  onCreateWorkflow: CreateWorkflowPanelProps["onCreateWorkflow"],
) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  onCreateWorkflow(String(formData.get("name") || ""), "");
}
