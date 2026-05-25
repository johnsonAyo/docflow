import { useCallback, useState, type FormEvent } from "react";
import { createEmptyWorkflowDraft } from "@/lib/workflowBuilderDefaults";
import { storedOrEmptyDraft } from "@/lib/workflowDraftStorage";
import { usePersistWorkflowDraft, useStoredWorkflowDraft } from "@/hooks/useWorkflowDraftStorage";
import { mapWorkflowFields, mapWorkflowToDraft, validateWorkflow } from "@/lib/workflowBuilderMappers";
import { AppField, WorkflowDefinition, WorkflowDraft, WorkflowSaveState, WorkflowStage } from "@/types";
import { fieldFromForm } from "@/lib/fieldForm";

const idleSaveState: WorkflowSaveState = {
  status: "idle",
  message: "Workflow has not been saved yet.",
};

export function useWorkflowDraftState(savedWorkflows: WorkflowDefinition[]) {
  const { recoveredDraft, storedDraft } = useStoredWorkflowDraft();
  const [activeStage, setActiveStage] = useState<WorkflowStage>(storedDraft?.activeStage || "Fields");
  const [fields, setFields] = useState<AppField[]>(storedDraft?.fields || []);
  const [workflowDraft, setWorkflowDraft] = useState<WorkflowDraft>(() => storedOrEmptyDraft(storedDraft));
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(storedDraft?.activeWorkflowId || null);
  const [saveState, setSaveState] = useState<WorkflowSaveState>(idleSaveState);
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const validationErrors = validateWorkflow(workflowDraft, fields);
  usePersistWorkflowDraft({ activeStage, activeWorkflowId, fields, workflowDraft });

  function updateWorkflowDraft(updates: Partial<WorkflowDraft>) {
    setWorkflowDraft((currentDraft) => ({ ...currentDraft, ...updates }));
    markWorkflowUnsaved();
  }

  function createDraftWorkflow(name = "", documentType = "") {
    setActiveWorkflowId(null);
    setWorkflowDraft({ ...createEmptyWorkflowDraft(), name, documentType });
    setFields([]);
    setActiveStage("Document");
    setSaveState(idleSaveState);
  }

  function openWorkflow(workflowId: string) {
    const workflow = savedWorkflows.find((item) => item.id === workflowId);
    if (!workflow) {
      createDraftWorkflow();
      return;
    }

    setActiveWorkflowId(workflow.id);
    setWorkflowDraft(mapWorkflowToDraft(workflow));
    setFields(mapWorkflowFields(workflow));
    setSaveState({
      status: "saved",
      message: `Loaded ${workflow.name} from the workflow API.`,
    });
    setActiveStage("Document");
  }

  function handleAddField(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextField = fieldFromForm(event.currentTarget);
    setFields((currentFields) => [...currentFields, nextField]);
    setIsAddFieldOpen(false);
    markWorkflowUnsaved();
  }

  function removeDeliveryAction(index: number) {
    setWorkflowDraft((draft) => ({ ...draft, deliveryActions: draft.deliveryActions.filter((_, i) => i !== index) }));
    markWorkflowUnsaved();
  }

  function removeField(index: number) {
    setFields((currentFields) => currentFields.filter((_, itemIndex) => itemIndex !== index));
    markWorkflowUnsaved();
  }

  function removeReviewRule(index: number) {
    setWorkflowDraft((draft) => ({ ...draft, reviewRules: draft.reviewRules.filter((_, i) => i !== index) }));
    markWorkflowUnsaved();
  }

  function markWorkflowUnsaved() {
    setSaveState({ status: "idle", message: "Workflow changes are saved locally." });
  }

  const actions = {
    changeStage: setActiveStage, closeAddFieldModal: useCallback(() => setIsAddFieldOpen(false), []),
    createDraftWorkflow, markWorkflowUnsaved, openAddFieldModal: useCallback(() => setIsAddFieldOpen(true), []),
    openWorkflow, removeDeliveryAction, removeField, removeReviewRule, setActiveWorkflowId, setSaveState,
    submitField: handleAddField, updateWorkflowDraft,
  };
  const state = {
    activeStage, activeWorkflowId, fields, isAddFieldOpen, recoveredDraft,
    saveState, validationErrors, workflowDraft,
  };
  return { actions, state };
}
