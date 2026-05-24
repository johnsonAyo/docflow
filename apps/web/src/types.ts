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
