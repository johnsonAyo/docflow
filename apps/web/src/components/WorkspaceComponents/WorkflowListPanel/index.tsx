import { WorkflowRow } from "@/components/WorkspaceComponents/WorkflowRow";
import { overviewLabels } from "../WorkflowOverview/labels";
import { WorkflowDefinition } from "@/types";

type WorkflowListPanelProps = {
  isDeletingWorkflow: boolean;
  onDeleteWorkflow: (workflowId: string) => void;
  onOpenWorkflow: (workflowId: string) => void;
  onRunWorkflow: (workflowId: string) => void;
  savedWorkflows: WorkflowDefinition[];
};

export function WorkflowListPanel({
  isDeletingWorkflow,
  onDeleteWorkflow,
  onOpenWorkflow,
  onRunWorkflow,
  savedWorkflows,
}: WorkflowListPanelProps) {
  return (
    <section className="workflow-list-panel" aria-labelledby="published-workflows-title">
      <div className="builder-title-row">
        <div>
          <p className="app-kicker">{overviewLabels.publishedWorkflows.kicker}</p>
          <h2 id="published-workflows-title">{overviewLabels.publishedWorkflows.title}</h2>
        </div>
      </div>
      <div className="published-workflow-list">
        {savedWorkflows.length === 0 ? <EmptyWorkflowState /> : null}
        {savedWorkflows.map((workflow) => (
          <WorkflowRow
            documents="API saved"
            id={workflow.id}
            isDeleting={isDeletingWorkflow}
            key={workflow.id}
            name={workflow.name}
            onDelete={onDeleteWorkflow}
            onEdit={onOpenWorkflow}
            onRun={onRunWorkflow}
            owner="Workspace"
            status={workflow.status === "published" ? "Published" : "Draft"}
            type={workflow.document_type}
          />
        ))}
      </div>
    </section>
  );
}

function EmptyWorkflowState() {
  return (
    <div className="empty-workflow-state">
      <strong>No workflows saved yet</strong>
      <p>Create and publish your first workflow, then upload your own documents in Runs.</p>
    </div>
  );
}
