import {
  AppField,
  WorkflowDeliveryAction,
  WorkflowDraft,
  WorkflowPayload,
  WorkflowRule,
} from "@/types";

export function createEmptyWorkflowDraft(): WorkflowDraft {
  return {
    name: "",
    documentType: "",
    intakeSources: [],
    completeRecord: "",
    reviewRules: cloneReviewRules(),
    deliveryActions: cloneDeliveryActions(),
  };
}

export const reviewRules: WorkflowRule[] = [
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

export const deliveryActions: WorkflowDeliveryAction[] = [
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

export function workflowConfig(draft: WorkflowDraft, fields: AppField[]) {
  return {
    version: 1,
    name: draft.name,
    document_type: draft.documentType,
    intake_source: draft.intakeSources,
    complete_record: draft.completeRecord,
    fields,
    review_rules: draft.reviewRules,
    actions: draft.deliveryActions,
  };
}

export function workflowPayload(
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
    review_rules: draft.reviewRules,
    actions: draft.deliveryActions,
    config: workflowConfig(draft, fields),
  };
}

function cloneReviewRules() {
  return reviewRules.map((rule) => ({
    ...rule,
    fields: rule.fields ? [...rule.fields] : undefined,
    signals: rule.signals ? [...rule.signals] : undefined,
  }));
}

function cloneDeliveryActions() {
  return deliveryActions.map((action) => ({ ...action }));
}
