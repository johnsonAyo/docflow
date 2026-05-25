import { WorkflowBuilder, WorkflowOverview, WorkspaceSectionView } from "@/components/WorkspaceComponents";
import { WorkspaceModel } from "@/pages/WorkspacePage/types";

export function WorkspaceContent({ workspace }: { workspace: WorkspaceModel }) {
  const { actions, builder, navigation, overview, sections } = workspace;

  if (navigation.activeSection === "Workflows" && navigation.workflowView === "overview") {
    return (
      <WorkflowOverview
        onCreateWorkflow={actions.createDraftWorkflow}
        onDeleteWorkflow={actions.deleteWorkflow}
        onOpenWorkflow={actions.openWorkflow}
        onRunWorkflow={(id) => {
          actions.setRunWorkflowId(id);
          actions.changeSection("Runs");
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
        onDeleteDeliveryAction={actions.deleteDeliveryAction}
        onDeleteField={actions.deleteField}
        onDeleteReviewRule={actions.deleteReviewRule}
        onWorkflowDraftChange={actions.updateWorkflowDraft}
      />
    );
  }

  if (navigation.activeSection === "Workflows") {
    return null;
  }

  return (
    <WorkspaceSectionView
      title={navigation.activeSection}
      savedWorkflows={overview.savedWorkflows}
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
      onApproveNextReview={actions.approveNextReview}
    />
  );
}
