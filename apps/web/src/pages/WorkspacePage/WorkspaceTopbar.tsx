import { ArrowRight, Plus } from "lucide-react";
import { workspaceLabels } from "@/pages/WorkspacePage/labels";
import { WorkspaceModel } from "@/pages/WorkspacePage/types";

export function WorkspaceTopbar({ workspace }: { workspace: WorkspaceModel }) {
  const { navigation, builder, actions } = workspace;

  return (
    <header className="app-topbar">
      <div>
        <p className="app-kicker">
          {navigation.isWorkflowBuilder ? workspaceLabels.topbar.kicker.builder : workspaceLabels.topbar.kicker.workspace}
        </p>
        <h1 id="app-title">{workspaceTitle(navigation)}</h1>
      </div>
      <div className="app-topbar-actions">
        {navigation.activeSection === "Workflows" && navigation.workflowView === "overview" ? (
          <button className="app-primary-action" type="button" onClick={() => actions.createDraftWorkflow()}>
            <Plus size={16} aria-hidden="true" />
            {workspaceLabels.topbar.actions.newWorkflow}
          </button>
        ) : null}
        {navigation.isWorkflowBuilder ? (
          <>
            <button className="app-secondary-action" type="button">{workspaceLabels.topbar.actions.previewRun}</button>
            <button className="app-primary-action" type="button" onClick={actions.publishWorkflow} disabled={builder.isSaving}>
              {builder.isSaving ? "Publishing..." : workspaceLabels.topbar.actions.publishWorkflow}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}

function workspaceTitle({ activeSection, isWorkflowBuilder }: WorkspaceModel["navigation"]) {
  if (activeSection !== "Workflows") {
    return activeSection;
  }

  return isWorkflowBuilder ? "Contract intake" : "Workflows";
}
