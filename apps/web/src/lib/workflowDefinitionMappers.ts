import { AppField, WorkflowDefinition, WorkflowDraft } from "@/types";
import { deliveryActions, reviewRules } from "@/lib/workflowBuilderDefaults";
import { mapWorkflowActions, mapWorkflowRules } from "@/lib/workflowConfigListMappers";

export function mapWorkflowToDraft(workflow: WorkflowDefinition): WorkflowDraft {
  const config = workflow.config;

  return {
    name: workflow.name,
    documentType: workflow.document_type,
    intakeSources: mapIntakeSources(config.intake_source),
    completeRecord: typeof config.complete_record === "string" ? config.complete_record : "",
    reviewRules: mapWorkflowRules(config.review_rules, reviewRules),
    deliveryActions: mapWorkflowActions(config.actions, deliveryActions),
  };
}

export function mapWorkflowFields(workflow: WorkflowDefinition): AppField[] {
  const configFields = workflow.config.fields;
  if (!Array.isArray(configFields)) {
    return [];
  }

  return configFields.filter(isAppFieldLike).map((field) => ({
    name: String(field.name),
    type: String(field.type),
    source: String(field.source),
    confidence: String(field.confidence),
    rule: String(field.rule),
  }));
}

export function validateWorkflow(draft: WorkflowDraft, fields: AppField[]) {
  const errors: string[] = [];
  if (!draft.name.trim()) errors.push("Workflow name is required.");
  if (!draft.documentType.trim()) errors.push("Document type is required.");
  if (fields.length === 0) errors.push("At least one extraction field is required.");
  if (fields.some((field) => !field.name.trim())) errors.push("Every extraction field needs a name.");
  return errors;
}

function mapIntakeSources(source: unknown): string[] {
  if (Array.isArray(source)) {
    return source.map(String);
  }

  return typeof source === "string" && source ? [source] : [];
}

function isAppFieldLike(field: unknown): field is AppField {
  return (
    typeof field === "object" &&
    field !== null &&
    "name" in field &&
    "type" in field &&
    "source" in field &&
    "confidence" in field &&
    "rule" in field
  );
}
