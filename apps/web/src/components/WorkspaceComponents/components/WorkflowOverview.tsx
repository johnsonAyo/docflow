import { CreateWorkflowPanel } from "@/components/WorkspaceComponents/components/CreateWorkflowPanel";
import { WorkflowListPanel } from "@/components/WorkspaceComponents/components/WorkflowListPanel";
import { WorkflowDefinition } from "@/types";

interface WorkflowOverviewProps {
  isDeletingWorkflow: boolean;
  onCreateWorkflow: (name: string, documentType: string) => void;
  onDeleteWorkflow: (workflowId: string) => void;
  onOpenWorkflow: (workflowId: string) => void;
  onRunWorkflow: (workflowId: string) => void;
  savedWorkflows: WorkflowDefinition[];
}

export function WorkflowOverview(props: WorkflowOverviewProps) {
  return (
    <div className="workflow-home">
      <WorkflowListPanel
        isDeletingWorkflow={props.isDeletingWorkflow}
        onDeleteWorkflow={props.onDeleteWorkflow}
        onOpenWorkflow={props.onOpenWorkflow}
        onRunWorkflow={props.onRunWorkflow}
        savedWorkflows={props.savedWorkflows}
      />
      <CreateWorkflowPanel onCreateWorkflow={props.onCreateWorkflow} />
    </div>
  );
}

export default WorkflowOverview;
