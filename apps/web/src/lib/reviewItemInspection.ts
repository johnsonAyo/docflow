import { mapWorkflowFields } from "@/lib/workflowDefinitionMappers";
import { normalizeFields, normalizeKey, parseThreshold } from "@/lib/reviewItemFormatting";
import { DocumentRun, ExtractedRecord, ReviewState, WorkflowDefinition } from "@/types";

type ReviewIssue = { field: string; message: string };

type ComparisonStatus = "matched" | "missing" | "low-confidence";

export type ReviewFieldComparison = {
  name: string;
  expectation: string;
  actual: string;
  status: ComparisonStatus;
  statusLabel: string;
};

export type ReviewUnexpectedField = { name: string; value: string };

export type ReviewInspection = {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  expectedFields: ReviewFieldComparison[];
  unexpectedFields: ReviewUnexpectedField[];
  issues: ReviewIssue[];
};

export function buildReviewInspection(
  reviewId: string,
  reviewStates: ReviewState[],
  records: ExtractedRecord[],
  documentRuns: DocumentRun[],
  workflows: WorkflowDefinition[],
): ReviewInspection | null {
  const review = reviewStates.find((item) => item.id === reviewId);
  if (!review) return null;

  const run = documentRuns.find((item) => item.id === review.document_run_id);
  const record = records.find((item) => item.id === review.record_id);
  const workflow = workflows.find((item) => item.id === review.workflow_id);
  const expectedFields = workflow ? mapWorkflowFields(workflow) : [];
  const actualFields = normalizeFields(record?.fields || []);
  const issues = review.issues.map((issue) => ({
    field: String(issue.field || "Review"),
    message: String(issue.message || "Requires review."),
  }));
  const issueMap = new Map(issues.map((issue) => [normalizeKey(issue.field), issue.message]));
  const actualMap = new Map(actualFields.map((field) => [normalizeKey(field.name), field]));

  const comparisons: ReviewFieldComparison[] = expectedFields.map((field) => {
    const actual = actualMap.get(normalizeKey(field.name));
    const threshold = parseThreshold(field.confidence);
    const actualConfidence = parseThreshold(actual?.confidence);
    const actualValue = actual?.value || "";
    const missing = !actual || !actualValue;
    const lowConfidence = !missing && threshold !== null && actualConfidence !== null && actualConfidence < threshold;
    actualMap.delete(normalizeKey(field.name));

    return {
      name: field.name,
      expectation: [field.rule, field.confidence].filter(Boolean).join(" · "),
      actual: actualValue
        ? [actualValue, actual?.confidence ? `(${actual.confidence})` : ""].filter(Boolean).join(" ")
        : "",
      status: missing ? "missing" : lowConfidence ? "low-confidence" : "matched",
      statusLabel: missing ? "Missing" : lowConfidence ? "Low confidence" : "Matched",
    };
  });

  const unexpectedFields = [...actualMap.values()].filter((field) => field.value).map((field) => ({
    name: field.name,
    value: field.value,
  }));
  const missingCount = comparisons.filter((item) => item.status === "missing").length;
  const lowCount = comparisons.filter((item) => item.status === "low-confidence").length;

  return {
    id: review.id,
    title: `${run?.document_name || "Review item"}`,
    subtitle: `${workflow?.name || "Workflow"} · ${run?.document_type || review.workflow_id}`,
    summary: `${comparisons.length} expected fields, ${comparisons.length - missingCount - lowCount} matched, ${missingCount} missing, ${lowCount} low confidence, ${unexpectedFields.length} unexpected.`,
    expectedFields: comparisons,
    unexpectedFields,
    issues: issues.map((issue) => ({
      ...issue,
      message: issueMap.get(normalizeKey(issue.field)) || issue.message,
    })),
  };
}
