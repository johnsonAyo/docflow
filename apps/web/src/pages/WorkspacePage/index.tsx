import { ArrowRight, Plus } from "lucide-react";
import { useWorkflowBuilder } from "@/hooks/useWorkflowBuilder";
import { WorkflowOverview, WorkflowBuilder, PlaceholderPage, AddFieldModal } from "@/components/WorkspaceComponents";
import { workspaceLabels, navItems } from "./labels";

export function WorkspacePage() {
  const {
    activeSection,
    workflowView,
    activeStage,
    fields,
    isAddFieldOpen,
    setActiveStage,
    setWorkflowView,
    setIsAddFieldOpen,
    handleSectionClick,
    handleAddField,
  } = useWorkflowBuilder();



  const isWorkflowBuilder = activeSection === "Workflows" && workflowView === "builder";
  const appTitle = activeSection === "Workflows"
    ? isWorkflowBuilder ? "Contract intake" : "Workflows"
    : activeSection;

  return (
    <main className="app-shell">
      <aside className="app-sidebar" aria-label="Workspace navigation">
        <a className="app-brand" href="#top" aria-label={`${workspaceLabels.sidebar.brand} landing page`}>
          <span className="brand-mark">{workspaceLabels.sidebar.brand[0]}</span>
          <span>{workspaceLabels.sidebar.brand}</span>
        </a>

        <nav className="app-nav" aria-label="Application sections">
          {navItems.map(({ label, Icon }) => (
            <button
              className={activeSection === label ? "active" : ""}
              key={label}
              type="button"
              onClick={() => handleSectionClick(label)}
            >
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

      <section className="app-workspace" aria-labelledby="app-title">
        <header className="app-topbar">
          <div>
            <p className="app-kicker">
              {isWorkflowBuilder ? workspaceLabels.topbar.kicker.builder : workspaceLabels.topbar.kicker.workspace}
            </p>
            <h1 id="app-title">{appTitle}</h1>
          </div>
          <div className="app-topbar-actions">
            {activeSection === "Workflows" && workflowView === "overview" ? (
              <button
                className="app-primary-action"
                type="button"
                onClick={() => {
                  setWorkflowView("builder");
                  setActiveStage("Document");
                }}
              >
                <Plus size={16} aria-hidden="true" />
                {workspaceLabels.topbar.actions.newWorkflow}
              </button>
            ) : null}
            {isWorkflowBuilder ? (
              <>
                <button className="app-secondary-action" type="button">
                  {workspaceLabels.topbar.actions.previewRun}
                </button>
                <button className="app-primary-action" type="button">
                  {workspaceLabels.topbar.actions.publishWorkflow}
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>
        </header>

        {activeSection === "Workflows" && workflowView === "overview" ? (
          <WorkflowOverview
            onCreateWorkflow={() => {
              setWorkflowView("builder");
              setActiveStage("Document");
            }}
            onOpenWorkflow={() => {
              setWorkflowView("builder");
              setActiveStage("Fields");
            }}
          />
        ) : null}

        {isWorkflowBuilder ? (
          <WorkflowBuilder
            activeStage={activeStage}
            fields={fields}
            onAddField={() => setIsAddFieldOpen(true)}
            onChangeStage={setActiveStage}
          />
        ) : null}

        {activeSection !== "Workflows" ? <PlaceholderPage title={activeSection} /> : null}
      </section>

      {isAddFieldOpen ? (
        <AddFieldModal onClose={() => setIsAddFieldOpen(false)} onSubmit={handleAddField} />
      ) : null}
    </main>
  );
}
