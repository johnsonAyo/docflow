import { WorkspaceModel } from "@/pages/WorkspacePage/types";
import { navItems, workspaceLabels } from "@/pages/WorkspacePage/labels";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function WorkspaceSidebar({
  activeSection,
  onSectionClick,
  isCollapsed,
  onToggleCollapse,
}: {
  activeSection: WorkspaceModel["navigation"]["activeSection"];
  onSectionClick: WorkspaceModel["actions"]["changeSection"];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  return (
    <aside className="app-sidebar" data-collapsed={isCollapsed ? "true" : "false"} aria-label="Workspace navigation">
      <div className="app-sidebar-header">
        <a className="app-brand" href="#top" aria-label={`${workspaceLabels.sidebar.brand} landing page`}>
          <span className="brand-mark">{workspaceLabels.sidebar.brand[0]}</span>
          <span className="brand-name">{workspaceLabels.sidebar.brand}</span>
        </a>
        <button
          type="button"
          className="sidebar-collapse-toggle"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} aria-hidden="true" /> : <ChevronLeft size={16} aria-hidden="true" />}
        </button>
      </div>
      <nav className="app-nav" aria-label="Application sections">
        {navItems.map(({ label, Icon }) => (
          <button className={activeSection === label ? "active" : ""} key={label} type="button" onClick={() => onSectionClick(label)}>
            <Icon size={17} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="app-sidebar-card">
        <span>{workspaceLabels.sidebar.currentWorkspace.label}</span>
        <strong>{workspaceLabels.sidebar.currentWorkspace.name}</strong>
        <p>{workspaceLabels.sidebar.currentWorkspace.stats}</p>
      </div>
    </aside>
  );
}
