import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createWorkflow,
  listDocumentRuns,
  listRecords,
  listReviewStates,
  listWorkflows,
  recordsCsvUrl,
  testWebhook,
  updateRecord,
  updateReviewState,
  updateWorkflow,
  uploadDocument,
} from "@/api";
import {
  AppField,
  WorkflowDraft,
  WorkflowStage,
  AppSection,
  WorkflowDefinition,
  WorkflowPayload,
  WorkflowSaveState,
  ReviewState,
  WorkspaceItem,
} from "@/types";

const defaultWorkflowDraft: WorkflowDraft = {
  name: "",
  documentType: "",
  intakeSources: [],
  completeRecord: "",
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
    intake_source: draft.intakeSources,
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
    intake_source: draft.intakeSources,
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
    intakeSources: Array.isArray(config.intake_source)
      ? (config.intake_source as string[])
      : typeof config.intake_source === "string" && config.intake_source
        ? [config.intake_source]
        : [],
    completeRecord: typeof config.complete_record === "string" ? config.complete_record : "",
  };
}

function mapWorkflowFields(workflow: WorkflowDefinition): AppField[] {
  const configFields = workflow.config.fields;
  if (!Array.isArray(configFields)) {
    return [];
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

function displayStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function workflowName(workflows: WorkflowDefinition[], workflowId: string) {
  return workflows.find((workflow) => workflow.id === workflowId)?.name || "Workflow";
}

function fieldDisplay(fields: Array<Record<string, unknown>>) {
  if (fields.length === 0) {
    return "No extracted fields yet.";
  }

  return fields
    .slice(0, 3)
    .map((field) => `${String(field.name || "Field")}: ${String(field.value || "Pending")}`)
    .join(" · ");
}

export function useWorkflowBuilder() {
  const queryClient = useQueryClient();

  const [activeSection, setActiveSection] = useState<AppSection>("Workflows");
  const [workflowView, setWorkflowView] = useState<"overview" | "builder">("overview");
  const [activeStage, setActiveStage] = useState<WorkflowStage>("Fields");
  const [fields, setFields] = useState<AppField[]>([]);
  const [workflowDraft, setWorkflowDraft] = useState<WorkflowDraft>(defaultWorkflowDraft);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [runWorkflowId, setRunWorkflowId] = useState<string | "">("");
  const [toastMessage, setToastMessage] = useState<{ message: string; type: "error" | "success" } | null>(null);

  const { data: savedWorkflows = [] } = useQuery({
    queryKey: ["workflows"],
    queryFn: listWorkflows,
  });

  const { data: documentRuns = [] } = useQuery({
    queryKey: ["documentRuns"],
    queryFn: () => listDocumentRuns(),
  });

  const { data: records = [] } = useQuery({
    queryKey: ["records"],
    queryFn: () => listRecords(),
  });

  const { data: reviewStates = [] } = useQuery({
    queryKey: ["reviewStates"],
    queryFn: () => listReviewStates(),
  });

  const [saveState, setSaveState] = useState<WorkflowSaveState>({
    status: "idle",
    message: "Workflow has not been saved yet.",
  });
  const [uploadState, setUploadState] = useState<WorkflowSaveState>({
    status: "idle",
    message: "Ready to upload documents.",
  });
  const [deliveryState, setDeliveryState] = useState<WorkflowSaveState>({
    status: "idle",
    message: "Delivery actions are ready when records exist.",
  });
  const [reviewActionState, setReviewActionState] = useState<WorkflowSaveState>({
    status: "idle",
    message: "Review actions are ready when review items exist.",
  });
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);


  const configPreview = JSON.stringify(workflowConfig(workflowDraft, fields), null, 2);

  const validationErrors = validateWorkflow(workflowDraft, fields);

  const workspaceItems: Record<Exclude<AppSection, "Workflows">, WorkspaceItem[]> = (() => {
    const runs = documentRuns.map((run) => ({
      title: run.document_name,
      meta: `${run.document_type} · ${workflowName(savedWorkflows, run.workflow_id)}`,
      status: displayStatus(run.status),
      detail: run.error || String((run.metadata.processing as Record<string, unknown> | undefined)?.message || "Document run is tracked."),
    }));

    const reviews = reviewStates.map((review) => {
      const run = documentRuns.find((item) => item.id === review.document_run_id);
      const issue = review.issues[0] || {};
      return {
        title: String(issue.field || run?.document_name || "Review item"),
        meta: `${run?.document_name || "Document"} · ${workflowName(savedWorkflows, review.workflow_id)}`,
        status: review.status === "open" ? "Needs review" : displayStatus(review.status),
        detail: String(issue.message || `${review.issues.length} issue(s) recorded.`),
      };
    });

    const recordRows = records.map((record) => {
      const run = documentRuns.find((item) => item.id === record.document_run_id);
      return {
        title: run?.document_name || record.id,
        meta: `${workflowName(savedWorkflows, record.workflow_id)} · ${record.confidence === null ? "No confidence" : `${Math.round(record.confidence * 100)}% confidence`}`,
        status: displayStatus(record.status),
        detail: fieldDisplay(record.fields),
      };
    });

    return {
      Runs: runs,
      "Review queue": reviews,
      Records: recordRows,
      Integrations: [],
    };
  })();

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

  function createDraftWorkflow(name: string = "", documentType: string = "") {
    setActiveWorkflowId(null);
    setWorkflowDraft({
      ...defaultWorkflowDraft,
      name,
      documentType,
    });
    setFields([]);
    setWorkflowView("builder");
    setActiveStage("Document");
    setSaveState({
      status: "idle",
      message: "Workflow has not been saved yet.",
    });
  }

  function openWorkflow(workflowId: string) {
    const workflow = savedWorkflows.find((item) => item.id === workflowId);

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
      setFields([]);
      setSaveState({
        status: "idle",
        message: "",
      });
    }

    setWorkflowView("builder");
    setActiveStage("Fields");
  }

  const publishMutation = useMutation({
    mutationFn: async () => {
      const payload = workflowPayload(workflowDraft, fields, "published");
      return activeWorkflowId
        ? await updateWorkflow(activeWorkflowId, payload)
        : await createWorkflow(payload);
    },
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
      const errorMessage = error instanceof Error ? error.message : "Could not save workflow.";
      setSaveState({
        status: "error",
        message: errorMessage,
      });
      setToastMessage({ message: errorMessage, type: "error" });
    }
  });

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

    publishMutation.mutate();
  }

  const uploadDocumentMutation = useMutation({
    mutationFn: (formData: FormData) => uploadDocument(formData),
    onSuccess: (result, variables) => {
      const file = variables.get("file") as File;
      queryClient.invalidateQueries({ queryKey: ["documentRuns"] });
      queryClient.invalidateQueries({ queryKey: ["records"] });
      queryClient.invalidateQueries({ queryKey: ["reviewStates"] });

      setUploadState({
        status: "saved",
        message: `Successfully uploaded ${file.name}. It will be processed shortly.`
      });
      setToastMessage({ message: `Document ${file.name} uploaded successfully!`, type: "success" });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Upload failed.";
      setUploadState({
        status: "error",
        message: errorMessage
      });
      setToastMessage({ message: errorMessage, type: "error" });
    }
  });

  function handleUploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      setUploadState({ status: "error", message: "Please select a file to upload." });
      return;
    }

    setUploadState({ status: "saving", message: "Uploading document..." });

    uploadDocumentMutation.mutate(formData, {
      onSuccess: () => {
        event.currentTarget.reset();
      }
    });
  }

  function handleExportRecords() {
    const workflowId = savedWorkflows[0]?.id;
    window.location.href = recordsCsvUrl(workflowId);
  }

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
      const errorMessage = error instanceof Error ? error.message : "Could not test webhook.";
      setDeliveryState({
        status: "error",
        message: errorMessage,
      });
      setToastMessage({ message: errorMessage, type: "error" });
    }
  });

  function handleTestWebhook() {
    const workflowId = savedWorkflows[0]?.id;
    if (!workflowId) {
      setDeliveryState({
        status: "error",
        message: "Publish a workflow before testing a webhook.",
      });
      return;
    }

    setDeliveryState({
      status: "saving",
      message: "Sending webhook simulation...",
    });

    testWebhookMutation.mutate(workflowId);
  }

  const approveReviewMutation = useMutation({
    mutationFn: async (nextReview: ReviewState) => {
      const updatedReview = await updateReviewState(nextReview.id, {
        status: "approved",
        decisions: [
          ...nextReview.decisions,
          {
            action: "approved",
            actor: "user",
            at: new Date().toISOString(),
          },
        ],
      });
      if (nextReview.record_id) {
        await updateRecord(nextReview.record_id, { status: "approved" });
      }
      return updatedReview;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewStates"] });
      queryClient.invalidateQueries({ queryKey: ["records"] });
      setReviewActionState({
        status: "saved",
        message: "Review item approved.",
      });
      setToastMessage({ message: "Review item approved successfully!", type: "success" });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Could not approve review item.";
      setReviewActionState({
        status: "error",
        message: errorMessage,
      });
      setToastMessage({ message: errorMessage, type: "error" });
    }
  });

  function handleApproveNextReview() {
    const nextReview = reviewStates.find((review) => review.status === "open") || reviewStates[0];
    if (!nextReview) {
      setReviewActionState({
        status: "idle",
        message: "There are no review items to approve.",
      });
      return;
    }

    setReviewActionState({
      status: "saving",
      message: "Approving review item...",
    });

    approveReviewMutation.mutate(nextReview);
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
    workspaceItems,
    configPreview,
    validationErrors,
    saveState,
    uploadState,
    deliveryState,
    reviewActionState,
    runWorkflowId,
    setRunWorkflowId,
    isSavingWorkflow: publishMutation.isPending,
    isUploadingDocument: uploadDocumentMutation.isPending,
    isTestingWebhook: testWebhookMutation.isPending,
    isApprovingReview: approveReviewMutation.isPending,
    toastMessage,
    setToastMessage,
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
    handleExportRecords,
    handleTestWebhook,
    handleApproveNextReview,
    handleAddField,
  };
}
