import { ArrowRight, Play, Plus } from "lucide-react";
import { useWorkflowBuilder } from "@/hooks/useWorkflowBuilder";
import {
  AddFieldModal,
  DemoMode,
  WorkflowBuilder,
  WorkflowOverview,
  WorkspaceSectionView,
} from "@/components/WorkspaceComponents";
import { workspaceLabels, navItems } from "./labels";

export function WorkspacePage() {
  const {
    activeSection,
    workflowView,
    activeStage,
    fields,
    workflowDraft,
    savedWorkflows,
    configPreview,
    validationErrors,
    saveState,
    uploadState,
    demoState,
    isSavingWorkflow,
    isUploadingDocument,
    isRunningDemo,
    isAddFieldOpen,
    setActiveStage,
    setWorkflowView,
    setIsAddFieldOpen,
    updateWorkflowDraft,
    handleSectionClick,
    createDraftWorkflow,
    openWorkflow,
    publishWorkflow,
    handleUploadDocument,
    handleRunDemo,
    handleAddField,
  } = useWorkflowBuilder();



  const isWorkflowBuilder = activeSection === "Workflows" && workflowView === "builder";
  const isDemoMode = activeSection === "Workflows" && workflowView === "demo";
  const appTitle = activeSection === "Workflows"
    ? isWorkflowBuilder ? "Contract intake" : isDemoMode ? "Demo mode" : "Workflows"
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
              <>
                <button
                  className="app-secondary-action"
                  type="button"
                  onClick={() => setWorkflowView("demo")}
                >
                  <Play size={16} aria-hidden="true" />
                  {workspaceLabels.topbar.actions.startDemo}
                </button>
                <button
                  className="app-primary-action"
                  type="button"
                  onClick={() => createDraftWorkflow()}
                >
                  <Plus size={16} aria-hidden="true" />
                  {workspaceLabels.topbar.actions.newWorkflow}
                </button>
              </>
            ) : null}
            {isWorkflowBuilder ? (
              <>
                <button className="app-secondary-action" type="button">
                  {workspaceLabels.topbar.actions.previewRun}
                </button>
                <button className="app-primary-action" type="button" onClick={publishWorkflow} disabled={isSavingWorkflow}>
                  {isSavingWorkflow ? "Publishing..." : workspaceLabels.topbar.actions.publishWorkflow}
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>
        </header>

        {activeSection === "Workflows" && workflowView === "overview" ? (
          <WorkflowOverview
            onCreateWorkflow={(name, type) => {
              createDraftWorkflow(name, type);
            }}
            onOpenWorkflow={openWorkflow}
            onStartDemo={() => setWorkflowView("demo")}
            savedWorkflows={savedWorkflows}
          />
        ) : null}

        {isWorkflowBuilder ? (
          <WorkflowBuilder
            activeStage={activeStage}
            fields={fields}
            workflowDraft={workflowDraft}
            configPreview={configPreview}
            validationErrors={validationErrors}
            saveState={saveState}
            onAddField={() => setIsAddFieldOpen(true)}
            onChangeStage={setActiveStage}
            onWorkflowDraftChange={updateWorkflowDraft}
          />
        ) : null}

        {isDemoMode ? (
          <DemoMode
            onOpenReviewQueue={() => {
              handleSectionClick("Review queue");
            }}
            onRunDemo={handleRunDemo}
            demoState={demoState}
            isRunningDemo={isRunningDemo}
          />
        ) : null}

        {activeSection !== "Workflows" ? (
          <WorkspaceSectionView
            title={activeSection}
            savedWorkflows={savedWorkflows}
            uploadState={uploadState}
            isUploadingDocument={isUploadingDocument}
            onUploadDocument={handleUploadDocument}
          />
        ) : null}
      </section>

      {isAddFieldOpen ? (
        <AddFieldModal onClose={() => setIsAddFieldOpen(false)} onSubmit={handleAddField} />
      ) : null}
    </main>
  );
}
