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

export type DocumentUploadResponse = {
  document_run: DocumentRun;
  artifact: Record<string, unknown>;
  record: ExtractedRecord | null;
  review_state: ReviewState;
};
