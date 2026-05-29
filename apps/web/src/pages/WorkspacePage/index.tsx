import { useState, useEffect } from "react";
import { useDismissToast } from "@/hooks/useDismissToast";
import { useWorkflowBuilder } from "@/hooks/useWorkflowBuilder";
import { WorkspaceContent } from "@/pages/WorkspacePage/WorkspaceContent";
import { WorkspaceOverlays } from "@/pages/WorkspacePage/WorkspaceOverlays";
import { WorkspaceSidebar } from "@/pages/WorkspacePage/WorkspaceSidebar";
import { WorkspaceTopbar } from "@/pages/WorkspacePage/WorkspaceTopbar";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "docflow.sidebar.collapsed";

export function WorkspacePage() {
  const workspace = useWorkflowBuilder();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "true";
  });

  useDismissToast(workspace.toast.message, workspace.toast.dismiss);

  useEffect(() => {
    setSelectedRunId(null);
  }, [workspace.navigation.activeSection]);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  return (
    <main className={`app-shell ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <WorkspaceSidebar
        activeSection={workspace.navigation.activeSection}
        onSectionClick={workspace.actions.changeSection}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />
      <section className="app-workspace" aria-labelledby="app-title">
        <WorkspaceTopbar workspace={workspace} />
        <WorkspaceContent 
          workspace={workspace} 
          selectedRunId={selectedRunId} 
          setSelectedRunId={setSelectedRunId} 
        />
      </section>
      <WorkspaceOverlays workspace={workspace} />
    </main>
  );
}
