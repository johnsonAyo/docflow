import { WorkspaceModel } from "@/pages/WorkspacePage/types";
import { navItems, workspaceLabels } from "@/pages/WorkspacePage/labels";

export function WorkspaceSidebar({
  activeSection,
  onSectionClick,
}: {
  activeSection: WorkspaceModel["navigation"]["activeSection"];
  onSectionClick: WorkspaceModel["actions"]["changeSection"];
}) {
  return (
    <aside className="app-sidebar" aria-label="Workspace navigation">
      <a className="app-brand" href="#top" aria-label={`${workspaceLabels.sidebar.brand} landing page`}>
        <span className="brand-mark">{workspaceLabels.sidebar.brand[0]}</span>
        <span>{workspaceLabels.sidebar.brand}</span>
      </a>
      <nav className="app-nav" aria-label="Application sections">
        {navItems.map(({ label, Icon }) => (
          <button className={activeSection === label ? "active" : ""} key={label} type="button" onClick={() => onSectionClick(label)}>
            <Icon size={17} aria-hidden="true" />
            {label}
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
