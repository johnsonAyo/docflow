import { ArrowRight, Plus } from "lucide-react";
import { useWorkflowBuilder } from "@/hooks/useWorkflowBuilder";
import {
  AddFieldModal,
  AppToast,
  WorkflowBuilder,
  WorkflowOverview,
  WorkspaceSectionView,
} from "@/components/WorkspaceComponents";
import { useEffect } from "react";
import { workspaceLabels, navItems } from "./labels";

export function WorkspacePage() {
  const {
    activeSection,
    workflowView,
    activeStage,
    fields,
    workflowDraft,
    savedWorkflows,
    workspaceItems,
    configPreview,
    validationErrors,
    saveState,
    uploadState,
    deliveryState,
    reviewActionState,
    isSavingWorkflow,
    isUploadingDocument,
    isTestingWebhook,
    isApprovingReview,
    isAddFieldOpen,
    setActiveStage,
    setIsAddFieldOpen,
    updateWorkflowDraft,
    handleSectionClick,
    createDraftWorkflow,
    openWorkflow,
    publishWorkflow,
    handleUploadDocument,
    handleExportRecords,
    handleTestWebhook,
    handleApproveNextReview,
    handleAddField,
    runWorkflowId,
    setRunWorkflowId,
    toastMessage,
    setToastMessage,
  } = useWorkflowBuilder();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);



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
                onClick={() => createDraftWorkflow()}
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
            onRunWorkflow={(id) => {
              setRunWorkflowId(id);
              handleSectionClick("Runs");
            }}
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

        {activeSection !== "Workflows" ? (
          <WorkspaceSectionView
            title={activeSection}
            savedWorkflows={savedWorkflows}
            uploadState={uploadState}
            deliveryState={deliveryState}
            reviewActionState={reviewActionState}
            items={workspaceItems[activeSection]}
            isUploadingDocument={isUploadingDocument}
            isTestingWebhook={isTestingWebhook}
            isApprovingReview={isApprovingReview}
            runWorkflowId={runWorkflowId}
            setRunWorkflowId={setRunWorkflowId}
            onUploadDocument={handleUploadDocument}
            onExportRecords={handleExportRecords}
            onTestWebhook={handleTestWebhook}
            onApproveNextReview={handleApproveNextReview}
          />
        ) : null}
      </section>

      {isAddFieldOpen ? (
        <AddFieldModal onClose={() => setIsAddFieldOpen(false)} onSubmit={handleAddField} />
      ) : null}

      {toastMessage ? (
        <AppToast 
          message={toastMessage.message} 
          type={toastMessage.type} 
          onClose={() => setToastMessage(null)} 
        />
      ) : null}
    </main>
  );
}
