import { Plus, Pencil, Trash2 } from "lucide-react";
import { overviewLabels } from "./labels";
import { WorkflowDefinition } from "@/types";

interface WorkflowOverviewProps {
  isDeletingWorkflow?: boolean;
  onCreateWorkflow: (name: string, documentType: string) => void;
  onDeleteWorkflow?: (workflowId: string) => void;
  onOpenWorkflow: (workflowId: string) => void;
  onRunWorkflow: (workflowId: string) => void;
  savedWorkflows: WorkflowDefinition[];
}

export function WorkflowOverview({
  isDeletingWorkflow,
  onCreateWorkflow,
  onDeleteWorkflow,
  onOpenWorkflow,
  savedWorkflows,
}: WorkflowOverviewProps) {
  const workflowRows = savedWorkflows.map((workflow) => ({
    id: workflow.id,
    name: workflow.name,
    type: workflow.document_type,
    status: workflow.status === "published" ? "Published" : "Draft",
    owner: "Workspace",
  }));

  return (
    <div className="workflow-home">
      <section className="workflow-list-panel" aria-labelledby="published-workflows-title">
        <div className="builder-title-row">
          <div>
            <p className="app-kicker">{overviewLabels.publishedWorkflows.kicker}</p>
            <h2 id="published-workflows-title">{overviewLabels.publishedWorkflows.title}</h2>
          </div>
        </div>

        <div className="published-workflow-list">
          {workflowRows.length === 0 ? (
            <div className="empty-workflow-state">
              <strong>No workflows saved yet</strong>
              <p>Create and publish your first workflow, then upload your own documents in Runs.</p>
            </div>
          ) : null}
          {workflowRows.map((workflow) => (
            <article
              className="published-workflow-row"
              key={workflow.id ?? workflow.name}
            >
              <div>
                <strong>{workflow.name}</strong>
                <span>{workflow.type} · {workflow.owner}</span>
              </div>
              <span data-status={workflow.status}>{workflow.status}</span>
              <div className="workflow-actions">
                <button
                  className="app-secondary-action compact icon-only"
                  type="button"
                  title="Edit workflow"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenWorkflow(workflow.id!);
                  }}
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="app-secondary-action compact icon-only delete"
                  type="button"
                  title="Delete workflow"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteWorkflow?.(workflow.id!);
                  }}
                  disabled={isDeletingWorkflow}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
          <style>{`
            .published-workflow-row .workflow-actions { opacity: 0; transition: opacity 0.2s; display: flex; gap: 0.5rem; }
            .published-workflow-row:hover .workflow-actions { opacity: 1; }
          `}</style>
        </div>
      </section>

      <aside className="workflow-create-panel" aria-labelledby="create-workflow-title">
        <p className="app-kicker">{overviewLabels.createWorkflow.kicker}</p>
        <h2 id="create-workflow-title">{overviewLabels.createWorkflow.title}</h2>
        <form
          className="create-workflow-fields"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = String(formData.get("name") || "");
            onCreateWorkflow(name, "");
          }}
        >
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
    </div>
  );
}

export default WorkflowOverview;
