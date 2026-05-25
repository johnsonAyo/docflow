import { Plus } from "lucide-react";
import { type FormEvent } from "react";
import { workspaceComponentsLabels } from "@/components/WorkspaceComponents/labels";

type CreateWorkflowPanelProps = {
  onCreateWorkflow: (name: string, documentType: string) => void;
};

export function CreateWorkflowPanel({ onCreateWorkflow }: CreateWorkflowPanelProps) {
  return (
    <aside className="workflow-create-panel" aria-labelledby="create-workflow-title">
      <p className="app-kicker">{workspaceComponentsLabels.overview.createWorkflow.kicker}</p>
      <h2 id="create-workflow-title">{workspaceComponentsLabels.overview.createWorkflow.title}</h2>
      <form className="create-workflow-fields" onSubmit={(event) => submitWorkflow(event, onCreateWorkflow)}>
        <label>
          {workspaceComponentsLabels.overview.createWorkflow.fields.name}
          <input name="name" type="text" placeholder="e.g. New supplier packet" required />
        </label>
        <button className="app-primary-action" type="submit">
          <Plus size={16} aria-hidden="true" />
          {workspaceComponentsLabels.overview.createWorkflow.action}
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
