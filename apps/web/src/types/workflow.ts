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
  intakeSources: string[];
  completeRecord: string;
  reviewRules: WorkflowRule[];
  deliveryActions: WorkflowDeliveryAction[];
};

export type WorkflowStatus = "draft" | "published" | "archived";

export type WorkflowRule = {
  name: string;
  condition: string;
  action: string;
  threshold?: number;
  fields?: string[];
  signals?: string[];
};

export type WorkflowDeliveryAction = {
  type: string;
  target: string;
  enabled?: boolean;
};

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
  intake_source: string[];
  complete_record: string;
  fields: AppField[];
  review_rules: WorkflowRule[];
  actions: WorkflowDeliveryAction[];
  config: Record<string, unknown>;
};

export type WorkflowSaveState = {
  status: "idle" | "saving" | "saved" | "error";
  message: string;
};

export type WorkflowStage = "Document" | "Fields" | "Review" | "Delivery";
