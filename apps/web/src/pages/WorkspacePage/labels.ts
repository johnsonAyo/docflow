import { Waypoints, FileSearch, CircleAlert, Table2, PlugZap } from "lucide-react";

export const navItems = [
  { label: "Workflows" as const, Icon: Waypoints },
  { label: "Process documents" as const, Icon: FileSearch },
  { label: "Review queue" as const, Icon: CircleAlert },
  { label: "Records" as const, Icon: Table2 },
  { label: "Integrations" as const, Icon: PlugZap },
];

export const workspaceLabels = {
  sidebar: {
    brand: "Document OCR Engine",
    currentWorkspace: {
      label: "Current workspace",
      name: "Operations Command",
      stats: "12 workflows, 247 documents processed this month."
    }
  },
  topbar: {
    kicker: {
      builder: "Workflow builder",
      workspace: "Workspace"
    },
    actions: {
      newWorkflow: "New workflow",
      previewRun: "Preview run",
      publishWorkflow: "Publish workflow"
    }
  }
};
