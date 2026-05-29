import { useCallback, useEffect, useMemo, useState } from "react";
import { workflowConfig } from "@/lib/workflowBuilderDefaults";
import { buildWorkspaceItems } from "@/lib/workflowBuilderMappers";
import { AppSection, WorkflowSaveState } from "@/types";
import { useWorkflowData } from "@/hooks/useWorkflowData";
import { useWorkflowBuilderActions } from "@/hooks/useWorkflowBuilderActions";
import { useReviewItemModal } from "@/hooks/useReviewItemModal";
import { useWorkflowDraftState } from "@/hooks/useWorkflowDraftState";
import { useWorkflowDeletion } from "@/hooks/useWorkflowDeletion";
import { useWorkflowMutations } from "@/hooks/useWorkflowMutations";
import { idleDeliveryState, idleReviewState, idleUploadState } from "@/hooks/workflowBuilderIdleStates";
import { useUploadQueue } from "@/hooks/useUploadQueue";

type ToastMessage = { message: string; type: "error" | "success" } | null;

export function useWorkflowBuilder() {
  const [activeSection, setActiveSection] = useState<AppSection>("Workflows");
  const [runWorkflowId, setRunWorkflowId] = useState("");
  const [toastMessage, setToastMessage] = useState<ToastMessage>(null);
  const [uploadState, setUploadState] = useState<WorkflowSaveState>(idleUploadState);
  const [deliveryState, setDeliveryState] = useState<WorkflowSaveState>(idleDeliveryState);
  const [reviewActionState, setReviewActionState] = useState<WorkflowSaveState>(idleReviewState);
  const { savedWorkflows, documentRuns, records, reviewStates } = useWorkflowData();
  const workflowDraftState = useWorkflowDraftState(savedWorkflows);
  const uploadQueue = useUploadQueue();
  const { actions: draftActions, state: draftState } = workflowDraftState;
  const [workflowView, setWorkflowView] = useState<"overview" | "builder">("overview");
  const workflowMutations = useWorkflowMutations({ activeWorkflowId: draftState.activeWorkflowId, fields: draftState.fields, reviewStates, savedWorkflows, setActiveWorkflowId: draftActions.setActiveWorkflowId, setDeliveryState, setReviewActionState, setSaveState: draftActions.setSaveState, setToastMessage, setUploadState, workflowDraft: draftState.workflowDraft });
  const workflowDeletion = useWorkflowDeletion({ activeWorkflowId: draftState.activeWorkflowId, setActiveWorkflowId: draftActions.setActiveWorkflowId, setSaveState: draftActions.setSaveState, setToastMessage });
  const reviewModal = useReviewItemModal({ documentRuns, records, reviewStates, savedWorkflows });
  const { closeReviewItem, isOpen: isReviewModalOpen, openReviewItem: openReviewItemModal, reviewInspection } = reviewModal;
  const handlers = useWorkflowBuilderActions({ draftActions, draftState, setActiveSection, setUploadState, setWorkflowView, workflowMutations });
  const dismissToast = useCallback(() => setToastMessage(null), []);
  const openReviewItem = useCallback((reviewId: string) => { setReviewActionState(idleReviewState); openReviewItemModal(reviewId); }, [openReviewItemModal]);
  useEffect(() => { if (reviewActionState.status === "saved" && isReviewModalOpen) closeReviewItem(); }, [closeReviewItem, isReviewModalOpen, reviewActionState.status]);
  const workspaceItems = useMemo(() => buildWorkspaceItems(documentRuns, reviewStates, records, savedWorkflows), [documentRuns, records, reviewStates, savedWorkflows]);
  return { actions: { approveReviewItem: workflowMutations.approveReviewItem, changeSection: handlers.changeSection, changeStage: draftActions.changeStage, createDraftWorkflow: handlers.createDraftWorkflow, deleteDeliveryAction: draftActions.removeDeliveryAction, deleteField: draftActions.removeField, deleteReviewRule: draftActions.removeReviewRule, deleteWorkflow: workflowDeletion.deleteWorkflow, exportRecords: workflowMutations.handleExportRecords, openReviewItem, openWorkflow: handlers.openWorkflow, publishWorkflow: handlers.publishWorkflow, setRunWorkflowId, testWebhook: workflowMutations.handleTestWebhook, updateWorkflowDraft: draftActions.updateWorkflowDraft, uploadDocument: handlers.uploadDocument }, builder: { activeStage: draftState.activeStage, configPreview: JSON.stringify(workflowConfig(draftState.workflowDraft, draftState.fields), null, 2), fields: draftState.fields, isSaving: workflowMutations.publishMutation.isPending, saveState: draftState.saveState, validationErrors: draftState.validationErrors, workflowDraft: draftState.workflowDraft }, modals: { addField: { close: draftActions.closeAddFieldModal, isOpen: draftState.isAddFieldOpen, open: draftActions.openAddFieldModal, submit: draftActions.submitField }, review: { close: closeReviewItem, inspection: reviewInspection, isOpen: isReviewModalOpen } }, navigation: { activeSection, isWorkflowBuilder: activeSection === "Workflows" && workflowView === "builder", workflowView }, overview: { savedWorkflows }, queue: uploadQueue, sections: { deliveryState, isApprovingReview: workflowMutations.approveReviewMutation.isPending, isDeletingWorkflow: workflowDeletion.isDeletingWorkflow, isTestingWebhook: workflowMutations.testWebhookMutation.isPending, isUploadingDocument: workflowMutations.uploadDocumentMutation.isPending, items: workspaceItems, reviewActionState, runWorkflowId, uploadState }, toast: { dismiss: dismissToast, message: toastMessage, show: setToastMessage }, data: { documentRuns, records, reviewStates } };
}
