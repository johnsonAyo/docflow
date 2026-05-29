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

  function uploadDocument(eventOrData: FormEvent<HTMLFormElement> | FormData) {
    let formData: FormData;
    let resetForm = () => {};

    if (eventOrData instanceof FormData) {
      formData = eventOrData;
    } else {
      eventOrData.preventDefault();
      formData = new FormData(eventOrData.currentTarget);
      const target = eventOrData.currentTarget;
      resetForm = () => target.reset();
    }

    setUploadState({ status: "saving", message: "Uploading document..." });
    workflowMutations.uploadDocumentMutation.mutate(formData, {
      onSuccess: () => {
        resetForm();
        setActiveSection("Review queue");
      },
    });
  }

  return { changeSection, createDraftWorkflow, openWorkflow, publishWorkflow, uploadDocument };
}
