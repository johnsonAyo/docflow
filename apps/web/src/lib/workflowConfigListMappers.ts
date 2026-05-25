import { WorkflowDeliveryAction, WorkflowRule } from "@/types";

export function mapWorkflowRules(value: unknown, fallback: WorkflowRule[]): WorkflowRule[] {
  if (!Array.isArray(value)) return fallback;
  return value.filter(isRecord).map((rule) => ({
    name: stringValue(rule.name, "Review rule"),
    condition: stringValue(rule.condition, "custom"),
    action: stringValue(rule.action, "route_to_review"),
    threshold: numberValue(rule.threshold),
    fields: stringList(rule.fields),
    signals: stringList(rule.signals),
  }));
}

export function mapWorkflowActions(
  value: unknown,
  fallback: WorkflowDeliveryAction[],
): WorkflowDeliveryAction[] {
  if (!Array.isArray(value)) return fallback;
  return value.filter(isRecord).map((action) => ({
    type: stringValue(action.type, "custom"),
    target: stringValue(action.target, "workflow_output"),
    enabled: typeof action.enabled === "boolean" ? action.enabled : undefined,
  }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function numberValue(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.map(String) : undefined;
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value ? value : fallback;
}
