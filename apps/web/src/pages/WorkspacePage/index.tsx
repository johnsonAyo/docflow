import { useDismissToast } from "@/hooks/useDismissToast";
import { useWorkflowBuilder } from "@/hooks/useWorkflowBuilder";
import { WorkspaceContent } from "@/pages/WorkspacePage/WorkspaceContent";
import { WorkspaceOverlays } from "@/pages/WorkspacePage/WorkspaceOverlays";
import { WorkspaceSidebar } from "@/pages/WorkspacePage/WorkspaceSidebar";
import { WorkspaceTopbar } from "@/pages/WorkspacePage/WorkspaceTopbar";

export function WorkspacePage() {
  const workspace = useWorkflowBuilder();
  useDismissToast(workspace.toast.message, workspace.toast.dismiss);

  return (
    <main className="app-shell">
      <WorkspaceSidebar
        activeSection={workspace.navigation.activeSection}
        onSectionClick={workspace.actions.changeSection}
      />
      <section className="app-workspace" aria-labelledby="app-title">
        <WorkspaceTopbar workspace={workspace} />
        <WorkspaceContent workspace={workspace} />
      </section>
      <WorkspaceOverlays workspace={workspace} />
    </main>
  );
}
