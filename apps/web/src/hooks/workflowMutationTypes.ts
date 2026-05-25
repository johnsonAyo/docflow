import { type Dispatch, type SetStateAction } from "react";
import {
  AppField,
  ReviewState,
  WorkflowDefinition,
  WorkflowDraft,
  WorkflowSaveState,
} from "@/types";

export type ToastMessage = { message: string; type: "error" | "success" } | null;

export type WorkflowMutationOptions = {
  activeWorkflowId: string | null;
  fields: AppField[];
  reviewStates: ReviewState[];
  savedWorkflows: WorkflowDefinition[];
  setActiveWorkflowId: Dispatch<SetStateAction<string | null>>;
  setDeliveryState: Dispatch<SetStateAction<WorkflowSaveState>>;
  setReviewActionState: Dispatch<SetStateAction<WorkflowSaveState>>;
  setSaveState: Dispatch<SetStateAction<WorkflowSaveState>>;
  setToastMessage: Dispatch<SetStateAction<ToastMessage>>;
  setUploadState: Dispatch<SetStateAction<WorkflowSaveState>>;
  workflowDraft: WorkflowDraft;
};
