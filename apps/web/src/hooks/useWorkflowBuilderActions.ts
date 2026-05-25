import { type FormEvent } from "react";
import { AppSection, WorkflowSaveState } from "@/types";

type DraftActions = {
  createDraftWorkflow: (name?: string, documentType?: string) => void;
  openWorkflow: (workflowId: string) => void;
  setSaveState: (state: WorkflowSaveState) => void;
};

type DraftState = {
  validationErrors: string[];
};

type WorkflowMutations = {
  approveReviewItem: (reviewId: string) => void;
  publishMutation: { mutate: () => void };
  uploadDocumentMutation: { mutate: (formData: FormData, options: { onSuccess: () => void }) => void };
};

type WorkflowBuilderActionOptions = {
  draftActions: DraftActions;
  draftState: DraftState;
  setActiveSection: (section: AppSection) => void;
  setUploadState: (state: WorkflowSaveState) => void;
  setWorkflowView: (view: "overview" | "builder") => void;
  workflowMutations: WorkflowMutations;
};

export function useWorkflowBuilderActions({
  draftActions,
  draftState,
  setActiveSection,
  setUploadState,
  setWorkflowView,
  workflowMutations,
}: WorkflowBuilderActionOptions) {
  function changeSection(section: AppSection) {
    setActiveSection(section);
    setWorkflowView("overview");
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

  return { changeSection, createDraftWorkflow, openWorkflow, publishWorkflow, uploadDocument };
}
