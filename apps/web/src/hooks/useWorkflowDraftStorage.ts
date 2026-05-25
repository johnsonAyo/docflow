import { useEffect, useState } from "react";
import {
  clearWorkflowDraft,
  hasWorkflowDraftContent,
  loadWorkflowDraft,
  saveWorkflowDraft,
  StoredWorkflowDraft,
} from "@/lib/workflowDraftStorage";

export function useStoredWorkflowDraft() {
  const [storedDraft] = useState(loadWorkflowDraft);
  return {
    recoveredDraft: Boolean(storedDraft && hasWorkflowDraftContent(storedDraft)),
    storedDraft,
  };
}

export function usePersistWorkflowDraft(state: StoredWorkflowDraft) {
  useEffect(() => {
    if (!hasWorkflowDraftContent(state)) {
      clearWorkflowDraft();
      return;
    }

    saveWorkflowDraft(state);
  }, [state]);
}
