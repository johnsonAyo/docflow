import { WorkflowBuilder, WorkflowOverview, WorkspaceSectionView } from "@/components/WorkspaceComponents";
import { DocumentRunWorkspaceView } from "@/components/WorkspaceComponents/DocumentRunWorkspaceView";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { WorkspaceModel } from "@/pages/WorkspacePage/types";
import { useQueryClient } from "@tanstack/react-query";
import { deleteDocumentRun, deleteRecord, deleteReviewState } from "@/api";

type WorkspaceContentProps = {
  workspace: WorkspaceModel & {
    data: {
      documentRuns: any[];
      records: any[];
      reviewStates: any[];
    };
  };
  selectedRunId: string | null;
  setSelectedRunId: (id: string | null) => void;
};

export function WorkspaceContent({ workspace, selectedRunId, setSelectedRunId }: WorkspaceContentProps) {
  const { actions, builder, navigation, overview, sections } = workspace;
  const queryClient = useQueryClient();

  if (selectedRunId) {
    return (
      <ErrorBoundary>
        <DocumentRunWorkspaceView
          runId={selectedRunId}
          documentRuns={workspace.data.documentRuns}
          records={workspace.data.records}
          reviewStates={workspace.data.reviewStates}
          savedWorkflows={overview.savedWorkflows}
          onClose={() => setSelectedRunId(null)}
          setToastMessage={workspace.toast.show}
        />
      </ErrorBoundary>
    );
  }

  if (navigation.activeSection === "Workflows" && navigation.workflowView === "overview") {
    return (
        <WorkflowOverview
          onCreateWorkflow={actions.createDraftWorkflow}
          onDeleteWorkflow={actions.deleteWorkflow}
          onOpenWorkflow={actions.openWorkflow}
        onRunWorkflow={(id) => {
          actions.setRunWorkflowId(id);
          actions.changeSection("Process documents");
        }}
        savedWorkflows={overview.savedWorkflows}
        isDeletingWorkflow={sections.isDeletingWorkflow}
      />
    );
  }

  if (navigation.isWorkflowBuilder) {
    return (
        <WorkflowBuilder
          activeStage={builder.activeStage}
          fields={builder.fields}
          workflowDraft={builder.workflowDraft}
          configPreview={builder.configPreview}
          validationErrors={builder.validationErrors}
          saveState={builder.saveState}
          onAddField={workspace.modals.addField.open}
          onChangeStage={actions.changeStage}
          onDeleteField={actions.deleteField}
          onWorkflowDraftChange={actions.updateWorkflowDraft}
          onPublishWorkflow={actions.publishWorkflow}
          isPublishing={builder.isSaving}
        />
    );
  }

  if (navigation.activeSection === "Workflows") {
    return null;
  }

  const handleOpenRun = (itemId: string) => {
    if (navigation.activeSection === "Process documents") {
      setSelectedRunId(itemId);
    } else if (navigation.activeSection === "Review queue") {
      const review = workspace.data.reviewStates.find((r) => r.id === itemId);
      if (review) setSelectedRunId(review.document_run_id);
    } else if (navigation.activeSection === "Records") {
      const rec = workspace.data.records.find((r) => r.id === itemId);
      if (rec) setSelectedRunId(rec.document_run_id);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const section = navigation.activeSection;
    try {
      if (section === "Process documents") {
        await deleteDocumentRun(itemId);
      } else if (section === "Review queue") {
        const review = workspace.data.reviewStates.find((r) => r.id === itemId);
        if (review) {
          await deleteReviewState(review.id);
          await deleteDocumentRun(review.document_run_id);
        }
      } else if (section === "Records") {
        const rec = workspace.data.records.find((r) => r.id === itemId);
        if (rec) {
          await deleteRecord(rec.id);
          await deleteDocumentRun(rec.document_run_id);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["documentRuns"] });
      queryClient.invalidateQueries({ queryKey: ["records"] });
      queryClient.invalidateQueries({ queryKey: ["reviewStates"] });
      workspace.toast.show({ message: "Item deleted successfully.", type: "success" });
    } catch (err: any) {
      workspace.toast.show({ message: err.message || "Failed to delete item.", type: "error" });
    }
  };

  return (
    <ErrorBoundary>
      <WorkspaceSectionView
        title={navigation.activeSection}
        savedWorkflows={overview.savedWorkflows}
        documentRuns={workspace.data.documentRuns}
        uploadState={sections.uploadState}
        deliveryState={sections.deliveryState}
        reviewActionState={sections.reviewActionState}
        items={sections.items[navigation.activeSection]}
        isUploadingDocument={sections.isUploadingDocument}
        isTestingWebhook={sections.isTestingWebhook}
        isApprovingReview={sections.isApprovingReview}
        runWorkflowId={sections.runWorkflowId}
        setRunWorkflowId={actions.setRunWorkflowId}
        onUploadDocument={actions.uploadDocument}
        onExportRecords={actions.exportRecords}
        onTestWebhook={actions.testWebhook}
        onOpenReviewItem={actions.openReviewItem}
        onOpenRun={handleOpenRun}
        onDeleteItem={handleDeleteItem}
        queue={workspace.queue}
      />
    </ErrorBoundary>
  );
}

