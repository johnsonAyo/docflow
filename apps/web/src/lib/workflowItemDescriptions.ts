import { WorkflowDeliveryAction, WorkflowRule } from "@/types";

export function describeDeliveryAction(action: WorkflowDeliveryAction) {
  return [
    `Type: ${readable(action.type)}`,
    `Target: ${readable(action.target)}`,
    action.enabled === false ? "Disabled" : "Enabled",
  ];
}

export function describeReviewRule(rule: WorkflowRule) {
  return [
    `Condition: ${readable(rule.condition)}`,
    `Action: ${readable(rule.action)}`,
    rule.threshold ? `Threshold: ${Math.round(rule.threshold * 100)}%` : "",
    rule.fields?.length ? `Fields: ${rule.fields.join(", ")}` : "",
    rule.signals?.length ? `Signals: ${rule.signals.join(", ")}` : "",
  ].filter(Boolean);
}

export function readable(value: string) {
  return value.replace(/_/g, " ");
}
