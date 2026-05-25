import { type Dispatch, type SetStateAction } from "react";
import { type QueryClient } from "@tanstack/react-query";
import {
  createWorkflow,
  recordsCsvUrl,
  updateRecord,
  updateReviewState,
  updateWorkflow,
} from "@/api";
import { workflowPayload } from "@/lib/workflowBuilderDefaults";
import {
  AppField,
  ReviewState,
  WorkflowDefinition,
  WorkflowDraft,
  WorkflowSaveState,
} from "@/types";
import { ToastMessage } from "@/hooks/workflowMutationTypes";

export function saveWorkflow(activeWorkflowId: string | null, workflowDraft: WorkflowDraft, fields: AppField[]) {
  const payload = workflowPayload(workflowDraft, fields, "published");
  return activeWorkflowId ? updateWorkflow(activeWorkflowId, payload) : createWorkflow(payload);
}

export function invalidateDocumentData(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["documentRuns"] });
  queryClient.invalidateQueries({ queryKey: ["records"] });
  queryClient.invalidateQueries({ queryKey: ["reviewStates"] });
}

export function showStateError(
  error: unknown,
  fallbackMessage: string,
  setState: Dispatch<SetStateAction<WorkflowSaveState>>,
  setToastMessage: Dispatch<SetStateAction<ToastMessage>>,
) {
  const errorMessage = error instanceof Error ? error.message : fallbackMessage;
  setState({ status: "error", message: errorMessage });
  setToastMessage({ message: errorMessage, type: "error" });
}

export function exportRecords(savedWorkflows: WorkflowDefinition[]) {
  window.location.href = recordsCsvUrl(savedWorkflows[0]?.id);
}

export function runWebhookTest(
  savedWorkflows: WorkflowDefinition[],
  setDeliveryState: Dispatch<SetStateAction<WorkflowSaveState>>,
  testWebhook: (workflowId: string) => void,
) {
  const workflowId = savedWorkflows[0]?.id;
  if (!workflowId) {
    setDeliveryState({ status: "error", message: "Publish a workflow before testing a webhook." });
    return;
  }

  setDeliveryState({ status: "saving", message: "Sending webhook simulation..." });
  testWebhook(workflowId);
}

export async function approveReview(nextReview: ReviewState) {
  const updatedReview = await updateReviewState(nextReview.id, {
    status: "approved",
    decisions: [...nextReview.decisions, { action: "approved", actor: "user", at: new Date().toISOString() }],
  });

  if (nextReview.record_id) {
    await updateRecord(nextReview.record_id, { status: "approved" });
  }

  return updatedReview;
}

export function nextOpenReview(reviewStates: ReviewState[]) {
  return reviewStates.find((review) => review.status === "open") || reviewStates[0];
}
