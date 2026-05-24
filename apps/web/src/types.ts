export type WorkflowStep = {
  eyebrow: string;
  title: string;
  copy: string;
};

export type FieldRow = {
  label: string;
  value: string;
  confidence: string;
  status: "Ready" | "Needs review" | "Approved";
};

export type Integration = {
  name: string;
  detail: string;
  status: string;
  badgeVariant: "available" | "enterprise";
};

export type AppField = {
  name: string;
  type: string;
  source: string;
  confidence: string;
  rule: string;
};

export type WorkflowDraft = {
  name: string;
  documentType: string;
  intakeSource: string;
  completeRecord: string;
};

export type WorkflowStatus = "draft" | "published" | "archived";

export type WorkflowDefinition = {
  id: string;
  name: string;
  slug: string;
  document_type: string;
  status: WorkflowStatus;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type WorkflowPayload = {
  name: string;
  document_type: string;
  status: WorkflowStatus;
  intake_source: string;
  complete_record: string;
  fields: AppField[];
  review_rules: Array<Record<string, unknown>>;
  actions: Array<Record<string, unknown>>;
  config: Record<string, unknown>;
};

export type WorkflowSaveState = {
  status: "idle" | "saving" | "saved" | "error";
  message: string;
};

export type DocumentRunStatus = "uploaded" | "processing" | "needs_review" | "approved" | "failed";

export type DocumentRun = {
  id: string;
  workflow_id: string;
  document_name: string;
  document_type: string;
  status: DocumentRunStatus;
  artifacts: Array<Record<string, unknown>>;
  error: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type DocumentUploadResponse = {
  document_run: DocumentRun;
  artifact: Record<string, unknown>;
  record: ExtractedRecord | null;
  review_state: ReviewState;
};

export type ExtractedRecord = {
  id: string;
  workflow_id: string;
  document_run_id: string;
  status: "draft" | "needs_review" | "approved" | "exported" | "failed";
  fields: Array<Record<string, unknown>>;
  confidence: number | null;
  evidence_refs: Array<Record<string, unknown>>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ReviewState = {
  id: string;
  workflow_id: string;
  document_run_id: string;
  record_id: string | null;
  status: "open" | "approved" | "rejected" | "resolved";
  issues: Array<Record<string, unknown>>;
  assigned_to: string | null;
  decisions: Array<Record<string, unknown>>;
  created_at: string;
  updated_at: string;
};

export type AppRun = {
  document: string;
  type: string;
  status: string;
  issues: number;
  owner: string;
};

export type AppSection = "Workflows" | "Runs" | "Review queue" | "Records" | "Integrations";

export type WorkflowStage = "Document" | "Fields" | "Review" | "Delivery";

export type PublishedWorkflow = {
  name: string;
  type: string;
  status: string;
  documents: string;
  owner: string;
};

export type WorkspaceItem = {
  title: string;
  meta: string;
  status: string;
  detail: string;
};

export type WorkspaceAction = {
  label: string;
  intent: "primary" | "secondary";
};

export type WorkspaceSectionContent = {
  kicker: string;
  title: string;
  description: string;
  actions: WorkspaceAction[];
  items: WorkspaceItem[];
};
