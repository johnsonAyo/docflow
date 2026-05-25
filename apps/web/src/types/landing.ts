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
