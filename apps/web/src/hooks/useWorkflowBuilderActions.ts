import { type FormEvent } from "react";
import { AppSection, ReviewState, WorkflowSaveState } from "@/types";

type DraftActions = {
  createDraftWorkflow: (name?: string, documentType?: string) => void;
  openWorkflow: (workflowId: string) => void;
  setSaveState: (state: WorkflowSaveState) => void;
};

type DraftState = {
  validationErrors: string[];
};

type WorkflowMutations = {
  approveReviewMutation: { mutate: (review: ReviewState) => void };
  nextReview: ReviewState | undefined;
  publishMutation: { mutate: () => void };
  uploadDocumentMutation: { mutate: (formData: FormData, options: { onSuccess: () => void }) => void };
};

type WorkflowBuilderActionOptions = {
  draftActions: DraftActions;
  draftState: DraftState;
  setActiveSection: (section: AppSection) => void;
  setReviewActionState: (state: WorkflowSaveState) => void;
  setUploadState: (state: WorkflowSaveState) => void;
  setWorkflowView: (view: "overview" | "builder") => void;
  workflowMutations: WorkflowMutations;
};

export function useWorkflowBuilderActions({
  draftActions,
  draftState,
  setActiveSection,
  setReviewActionState,
  setUploadState,
  setWorkflowView,
  workflowMutations,
}: WorkflowBuilderActionOptions) {
  function changeSection(section: AppSection) {
    setActiveSection(section);
    if (section !== "Workflows") setWorkflowView("overview");
  }

  function createDraftWorkflow(name = "", documentType = "") {
    draftActions.createDraftWorkflow(name, documentType);
    setWorkflowView("builder");
  }

  function openWorkflow(workflowId: string) {
    draftActions.openWorkflow(workflowId);
    setWorkflowView("builder");
  }

  function publishWorkflow() {
    if (draftState.validationErrors.length > 0) {
      draftActions.setSaveState({ status: "error", message: draftState.validationErrors[0] });
      return;
    }

    draftActions.setSaveState({ status: "saving", message: "Saving workflow definition..." });
    workflowMutations.publishMutation.mutate();
  }

  function uploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      setUploadState({ status: "error", message: "Please select a file to upload." });
      return;
    }

    setUploadState({ status: "saving", message: "Uploading document..." });
    workflowMutations.uploadDocumentMutation.mutate(formData, {
      onSuccess: () => event.currentTarget.reset(),
    });
  }

  function approveNextReview() {
    if (!workflowMutations.nextReview) {
      setReviewActionState({ status: "idle", message: "There are no review items to approve." });
      return;
    }

    setReviewActionState({ status: "saving", message: "Approving review item..." });
    workflowMutations.approveReviewMutation.mutate(workflowMutations.nextReview);
  }

  return { approveNextReview, changeSection, createDraftWorkflow, openWorkflow, publishWorkflow, uploadDocument };
}
