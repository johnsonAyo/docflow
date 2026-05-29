import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  approveReview,
  exportRecords,
  invalidateDocumentData,
  runWebhookTest,
  saveWorkflow,
  showStateError,
} from "@/hooks/workflowMutationHelpers";
import { WorkflowMutationOptions } from "@/hooks/workflowMutationTypes";
import { testWebhook, uploadDocument } from "@/api";

export function useWorkflowMutations({
  activeWorkflowId,
  fields,
  reviewStates,
  savedWorkflows,
  setActiveWorkflowId,
  setDeliveryState,
  setReviewActionState,
  setSaveState,
  setToastMessage,
  setUploadState,
  workflowDraft,
}: WorkflowMutationOptions) {
  const queryClient = useQueryClient();

  const publishMutation = useMutation({
    mutationFn: () => saveWorkflow(activeWorkflowId, workflowDraft, fields),
    onSuccess: (savedWorkflow) => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      setActiveWorkflowId(savedWorkflow.id);
      setSaveState({
        status: "saved",
        message: `${savedWorkflow.name} is published and stored in the workflow API.`,
      });
      setToastMessage({ message: `${savedWorkflow.name} published successfully!`, type: "success" });
    },
    onError: (error: unknown) => {
      showStateError(error, "Could not save workflow.", setSaveState, setToastMessage);
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: (formData: FormData) => uploadDocument(formData),
    onSuccess: (_result, variables) => {
      const bundleTitle = variables.get("bundle_title") as string | null;
      const file = (variables.get("file") || variables.get("files")) as File | null;
      const displayName = bundleTitle ? `bundle "${bundleTitle}"` : file?.name ? `"${file.name}"` : "document";
      invalidateDocumentData(queryClient);
      setUploadState({
        status: "saved",
        message: `Successfully uploaded ${displayName}. It will be processed shortly.`,
      });
      setToastMessage({ message: `Document ${displayName} uploaded successfully!`, type: "success" });
    },
    onError: (error: unknown) => {
      showStateError(error, "Upload failed.", setUploadState, setToastMessage);
    },
  });

  const testWebhookMutation = useMutation({
    mutationFn: (workflowId: string) => testWebhook(workflowId),
    onSuccess: (result) => {
      setDeliveryState({
        status: "saved",
        message: `Webhook simulation logged as ${String(result.id || "sent")}.`,
      });
      setToastMessage({ message: "Webhook simulation sent successfully!", type: "success" });
    },
    onError: (error: unknown) => {
      showStateError(error, "Could not test webhook.", setDeliveryState, setToastMessage);
    },
  });

  const approveReviewMutation = useMutation({
    mutationFn: approveReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewStates"] });
      queryClient.invalidateQueries({ queryKey: ["records"] });
      setReviewActionState({ status: "saved", message: "Review item approved." });
      setToastMessage({ message: "Review item approved successfully!", type: "success" });
    },
    onError: (error: unknown) => {
      showStateError(error, "Could not approve review item.", setReviewActionState, setToastMessage);
    },
  });

  return {
    approveReviewMutation,
    approveReviewItem: (reviewId: string) => {
      const review = reviewStates.find((item) => item.id === reviewId);
      if (!review) {
        setReviewActionState({ status: "error", message: "Review item no longer exists." });
        return;
      }

      setReviewActionState({ status: "saving", message: `Approving ${review.issues[0]?.field || "review item"}...` });
      approveReviewMutation.mutate(review);
    },
    handleExportRecords: () => exportRecords(savedWorkflows),
    handleTestWebhook: () => runWebhookTest(savedWorkflows, setDeliveryState, testWebhookMutation.mutate),
    publishMutation,
    testWebhookMutation,
    uploadDocumentMutation,
  };
}
