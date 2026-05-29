import {
  AppSection,
  DocumentRun,
  ExtractedRecord,
  ReviewState,
  WorkflowDefinition,
  WorkspaceItem,
} from "@/types";

export function buildWorkspaceItems(
  documentRuns: DocumentRun[],
  reviewStates: ReviewState[],
  records: ExtractedRecord[],
  workflows: WorkflowDefinition[],
): Record<Exclude<AppSection, "Workflows">, WorkspaceItem[]> {
  const activeRuns = documentRuns.filter(isActiveRun);
  const openReviews = reviewStates.filter((review) => review.status === "open");
  const approvedRecords = records.filter((rec) => rec.status === "approved" || rec.status === "exported");
  return {
    "Process documents": activeRuns.map((run) => mapRunItem(run, workflows)),
    "Review queue": openReviews.map((review) => mapReviewItem(review, documentRuns, workflows)),
    Records: approvedRecords.map((record) => mapRecordItem(record, documentRuns, workflows)),
    Integrations: [],
  };
}

function mapRunItem(run: DocumentRun, workflows: WorkflowDefinition[]): WorkspaceItem {
  const processing = run.metadata.processing as Record<string, unknown> | undefined;
  return {
    id: run.id,
    title: run.document_name,
    meta: `${run.document_type} · ${workflowName(workflows, run.workflow_id)}`,
    status: displayStatus(run.status),
    detail: run.error || String(processing?.message || "Document run is tracked."),
  };
}

function mapReviewItem(review: ReviewState, runs: DocumentRun[], workflows: WorkflowDefinition[]): WorkspaceItem {
  const run = runs.find((item) => item.id === review.document_run_id);
  const issue = review.issues[0] || {};
  return {
    id: review.id,
    title: String(issue.field || run?.document_name || "Review item"),
    meta: `${run?.document_name || "Document"} · ${workflowName(workflows, review.workflow_id)}`,
    status: review.status === "open" ? "Needs review" : displayStatus(review.status),
    detail: String(issue.message || `${review.issues.length} issue(s) recorded.`),
  };
}

function mapRecordItem(record: ExtractedRecord, runs: DocumentRun[], workflows: WorkflowDefinition[]): WorkspaceItem {
  const run = runs.find((item) => item.id === record.document_run_id);
  const confidence = record.confidence === null ? "No confidence" : `${Math.round(record.confidence * 100)}% confidence`;
  return {
    id: record.id,
    title: run?.document_name || record.id,
    meta: `${workflowName(workflows, record.workflow_id)} · ${confidence}`,
    status: displayStatus(record.status),
    detail: fieldDisplay(record.fields),
  };
}

function displayStatus(status: string) {
  return status.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function workflowName(workflows: WorkflowDefinition[], workflowId: string) {
  return workflows.find((workflow) => workflow.id === workflowId)?.name || "Workflow";
}

function fieldDisplay(fields: Array<Record<string, unknown>>) {
  if (fields.length === 0) return "No extracted fields yet.";
  return fields.slice(0, 3).map((field) => `${String(field.name || "Field")}: ${String(field.value || "Pending")}`).join(" · ");
}

function isActiveRun(run: DocumentRun) {
  return run.status === "failed";
}
