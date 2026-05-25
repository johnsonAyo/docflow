export type AppRun = {
  document: string;
  type: string;
  status: string;
  issues: number;
  owner: string;
};

export type AppSection = "Workflows" | "Process documents" | "Review queue" | "Records" | "Integrations";

export type PublishedWorkflow = {
  name: string;
  type: string;
  status: string;
  documents: string;
  owner: string;
};

export type WorkspaceItem = {
  id: string;
  title: string;
  meta: string;
  status: string;
  detail: string;
};

export type WorkspaceAction = {
  label: string;
  intent: "primary" | "secondary";
};

export type WorkspaceSectionContent = {
  kicker: string;
  title: string;
  description: string;
  actions: WorkspaceAction[];
  items: WorkspaceItem[];
};
