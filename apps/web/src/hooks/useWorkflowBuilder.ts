import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createWorkflow, listWorkflows, runDemo, updateWorkflow, uploadDocument } from "@/api";
import {
  AppField,
  WorkflowDraft,
  WorkflowStage,
  AppSection,
  WorkflowDefinition,
  WorkflowPayload,
  WorkflowSaveState,
} from "@/types";
import { appFields } from "@/components/WorkspaceComponents/labels";

const defaultWorkflowDraft: WorkflowDraft = {
  name: "Contract intake",
  documentType: "Contract",
  intakeSource: "Shared inbox",
  completeRecord: "Counterparty, dates, renewal terms, payment terms, and approval evidence.",
};

const reviewRules = [
  {
    name: "Low-confidence fields",
    condition: "confidence_below",
    threshold: 0.82,
    action: "route_to_review",
  },
  {
    name: "Missing commercial dates",
    condition: "missing_required_field",
    fields: ["Renewal clause", "Effective date", "Payment terms"],
    action: "route_to_review",
  },
  {
    name: "Risk language",
    condition: "contains_clause_signal",
    signals: ["auto-renewal", "liability", "penalty"],
    action: "flag_for_review",
  },
];

const deliveryActions = [
  {
    type: "records_table",
    target: "approved_records",
  },
  {
    type: "csv_export",
    target: "workflow_run",
  },
  {
    type: "webhook",
    target: "procurement_endpoint",
    enabled: false,
  },
];

function workflowConfig(draft: WorkflowDraft, fields: AppField[]) {
  return {
    version: 1,
    name: draft.name,
    document_type: draft.documentType,
    intake_source: draft.intakeSource,
    complete_record: draft.completeRecord,
    fields,
    review_rules: reviewRules,
    actions: deliveryActions,
  };
}

function workflowPayload(
  draft: WorkflowDraft,
  fields: AppField[],
  status: "draft" | "published",
): WorkflowPayload {
  return {
    name: draft.name,
    document_type: draft.documentType,
    status,
    intake_source: draft.intakeSource,
    complete_record: draft.completeRecord,
    fields,
    review_rules: reviewRules,
    actions: deliveryActions,
    config: workflowConfig(draft, fields),
  };
}

function mapWorkflowToDraft(workflow: WorkflowDefinition): WorkflowDraft {
  const config = workflow.config;

  return {
    name: workflow.name,
    documentType: workflow.document_type,
    intakeSource: typeof config.intake_source === "string" ? config.intake_source : "Manual upload",
    completeRecord: typeof config.complete_record === "string" ? config.complete_record : "",
  };
}

function mapWorkflowFields(workflow: WorkflowDefinition): AppField[] {
  const configFields = workflow.config.fields;
  if (!Array.isArray(configFields)) {
    return appFields;
  }

  return configFields
    .filter((field): field is AppField => (
      typeof field === "object" &&
      field !== null &&
      "name" in field &&
      "type" in field &&
      "source" in field &&
      "confidence" in field &&
      "rule" in field
    ))
    .map((field) => ({
      name: String(field.name),
      type: String(field.type),
      source: String(field.source),
      confidence: String(field.confidence),
      rule: String(field.rule),
    }));
}

function validateWorkflow(draft: WorkflowDraft, fields: AppField[]) {
  const errors: string[] = [];

  if (!draft.name.trim()) {
    errors.push("Workflow name is required.");
  }

  if (!draft.documentType.trim()) {
    errors.push("Document type is required.");
  }

  if (fields.length === 0) {
    errors.push("At least one extraction field is required.");
  }

  if (fields.some((field) => !field.name.trim())) {
    errors.push("Every extraction field needs a name.");
  }

  return errors;
}

export function useWorkflowBuilder() {
  const [activeSection, setActiveSection] = useState<AppSection>("Workflows");
  const [workflowView, setWorkflowView] = useState<"overview" | "builder" | "demo">("overview");
  const [activeStage, setActiveStage] = useState<WorkflowStage>("Fields");
  const [fields, setFields] = useState<AppField[]>(appFields);
  const [workflowDraft, setWorkflowDraft] = useState<WorkflowDraft>(defaultWorkflowDraft);
  const [savedWorkflows, setSavedWorkflows] = useState<WorkflowDefinition[]>([]);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<WorkflowSaveState>({
    status: "idle",
    message: "Workflow has not been saved yet.",
  });
  const [uploadState, setUploadState] = useState<WorkflowSaveState>({
    status: "idle",
    message: "Ready to upload documents.",
  });
  const [demoState, setDemoState] = useState<WorkflowSaveState>({
    status: "idle",
    message: "Demo data has not been seeded yet.",
  });
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);

  const configPreview = useMemo(
    () => JSON.stringify(workflowConfig(workflowDraft, fields), null, 2),
    [fields, workflowDraft],
  );
  const validationErrors = useMemo(
    () => validateWorkflow(workflowDraft, fields),
    [fields, workflowDraft],
  );

  useEffect(() => {
    let isCurrent = true;

    async function loadSavedWorkflows() {
      try {
        const workflows = await listWorkflows();
        if (isCurrent) {
          setSavedWorkflows(workflows);
        }
      } catch (error) {
        if (isCurrent) {
          setSaveState({
            status: "error",
            message: error instanceof Error ? error.message : "Could not load saved workflows.",
          });
        }
      }
    }

    void loadSavedWorkflows();

    return () => {
      isCurrent = false;
    };
  }, []);

  function updateWorkflowDraft(updates: Partial<WorkflowDraft>) {
    setWorkflowDraft((currentDraft) => ({
      ...currentDraft,
      ...updates,
    }));
    setSaveState({
      status: "idle",
      message: "Workflow changes are not saved yet.",
    });
  }

  function handleSectionClick(section: AppSection) {
    setActiveSection(section);
    if (section !== "Workflows") {
      setWorkflowView("overview");
    }
  }

  function createDraftWorkflow(name: string = "Contract intake", documentType: string = "Contract") {
    setActiveWorkflowId(null);
    setWorkflowDraft({
      ...defaultWorkflowDraft,
      name,
      documentType,
    });
    setFields(appFields);
    setWorkflowView("builder");
    setActiveStage("Document");
    setSaveState({
      status: "idle",
      message: "Workflow has not been saved yet.",
    });
  }

  function openWorkflow(workflowId?: string) {
    const workflow = workflowId
      ? savedWorkflows.find((item) => item.id === workflowId)
      : savedWorkflows[0];

    if (workflow) {
      setActiveWorkflowId(workflow.id);
      setWorkflowDraft(mapWorkflowToDraft(workflow));
      setFields(mapWorkflowFields(workflow));
      setSaveState({
        status: "saved",
        message: `Loaded ${workflow.name} from the workflow API.`,
      });
    } else {
      setActiveWorkflowId(null);
      setWorkflowDraft(defaultWorkflowDraft);
      setFields(appFields);
      setSaveState({
        status: "idle",
        message: "Using local starter workflow until the API has saved workflows.",
      });
    }

    setWorkflowView("builder");
    setActiveStage("Fields");
  }

  async function publishWorkflow() {
    if (validationErrors.length > 0) {
      setSaveState({
        status: "error",
        message: validationErrors[0],
      });
      return;
    }

    setSaveState({
      status: "saving",
      message: "Saving workflow definition...",
    });

    try {
      const payload = workflowPayload(workflowDraft, fields, "published");
      const savedWorkflow = activeWorkflowId
        ? await updateWorkflow(activeWorkflowId, payload)
        : await createWorkflow(payload);

      setActiveWorkflowId(savedWorkflow.id);
      setSavedWorkflows((currentWorkflows) => {
        const existingIndex = currentWorkflows.findIndex((workflow) => workflow.id === savedWorkflow.id);
        if (existingIndex === -1) {
          return [savedWorkflow, ...currentWorkflows];
        }

        return currentWorkflows.map((workflow) => (
          workflow.id === savedWorkflow.id ? savedWorkflow : workflow
        ));
      });
      setSaveState({
        status: "saved",
        message: `${savedWorkflow.name} is published and stored in the workflow API.`,
      });
    } catch (error) {
      setSaveState({
        status: "error",
        message: error instanceof Error ? error.message : "Could not save workflow.",
      });
    }
  }

  async function handleUploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      setUploadState({ status: "error", message: "Please select a file to upload." });
      return;
    }

    setUploadState({ status: "saving", message: "Uploading document..." });
    
    try {
      await uploadDocument(formData);
      setUploadState({ 
        status: "saved", 
        message: `Successfully uploaded ${file.name}. It will be processed shortly.` 
      });
      event.currentTarget.reset();
    } catch (error) {
      setUploadState({ 
        status: "error", 
        message: error instanceof Error ? error.message : "Upload failed." 
      });
    }
  }

  async function handleRunDemo() {
    setDemoState({
      status: "saving",
      message: "Creating sample workflows and document runs...",
    });

    try {
      const result = await runDemo();
      setSavedWorkflows((currentWorkflows) => [
        ...result.workflows,
        ...currentWorkflows,
      ]);
      setDemoState({
        status: "saved",
        message: `Demo ready: ${result.workflows.length} workflows, ${result.document_runs.length} runs, ${result.records.length} records.`,
      });
    } catch (error) {
      setDemoState({
        status: "error",
        message: error instanceof Error ? error.message : "Could not run demo mode.",
      });
    }
  }

  function handleAddField(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fieldName = String(formData.get("fieldName") || "New field");
    const fieldType = String(formData.get("fieldType") || "Text");
    const evidenceSource = String(formData.get("evidenceSource") || "Document body");
    const reviewRule = String(formData.get("reviewRule") || "Required");

    setFields((currentFields) => [
      ...currentFields,
      {
        name: fieldName,
        type: fieldType,
        source: evidenceSource,
        confidence: "New",
        rule: reviewRule,
      },
    ]);
    setIsAddFieldOpen(false);
    setSaveState({
      status: "idle",
      message: "Workflow changes are not saved yet.",
    });
  }

  return {
    activeSection,
    workflowView,
    activeStage,
    fields,
    workflowDraft,
    savedWorkflows,
    configPreview,
    validationErrors,
    saveState,
    uploadState,
    demoState,
    isSavingWorkflow: saveState.status === "saving",
    isUploadingDocument: uploadState.status === "saving",
    isRunningDemo: demoState.status === "saving",
    isAddFieldOpen,
    setActiveStage,
    setWorkflowView,
    setIsAddFieldOpen,
    updateWorkflowDraft,
    handleSectionClick,
    createDraftWorkflow,
    openWorkflow,
    publishWorkflow,
    handleUploadDocument,
    handleRunDemo,
    handleAddField,
  };
}
