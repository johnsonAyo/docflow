import { AppField, WorkflowDraft, WorkflowStage } from "@/types";
import { createEmptyWorkflowDraft } from "@/lib/workflowBuilderDefaults";

const storageKey = "docflow.workflowBuilderDraft.v1";

export type StoredWorkflowDraft = {
  activeStage: WorkflowStage;
  activeWorkflowId: string | null;
  fields: AppField[];
  workflowDraft: WorkflowDraft;
};

export function clearWorkflowDraft() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(storageKey);
}

export function hasWorkflowDraftContent(state: StoredWorkflowDraft) {
  const draft = state.workflowDraft;
  return Boolean(
    state.activeWorkflowId ||
    state.fields.length > 0 ||
    draft.name.trim() ||
    draft.documentType.trim() ||
    draft.intakeSources.length > 0 ||
    draft.completeRecord.trim(),
  );
}

export function loadWorkflowDraft(): StoredWorkflowDraft | null {
  if (!canUseStorage()) return null;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) || "null");
    return isStoredWorkflowDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveWorkflowDraft(state: StoredWorkflowDraft) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

export function storedOrEmptyDraft(storedDraft: StoredWorkflowDraft | null) {
  return storedDraft?.workflowDraft || createEmptyWorkflowDraft();
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function isStoredWorkflowDraft(value: unknown): value is StoredWorkflowDraft {
  if (typeof value !== "object" || value === null) return false;
  const draft = value as StoredWorkflowDraft;
  return Boolean(draft.workflowDraft && Array.isArray(draft.fields));
}
