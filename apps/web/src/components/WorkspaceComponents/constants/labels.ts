import {
  AppSection,
  PublishedWorkflow,
  WorkflowStage,
  WorkspaceSectionContent,
} from "@/types";

export const workspaceComponentsLabels = {
  overview: {
    publishedWorkflows: {
      kicker: "Published workflows",
      title: "Active document operations",
      actionOpen: "Open builder",
      actionEdit: "Edit"
    },
    createWorkflow: {
      kicker: "New configuration",
      title: "Publish a new workflow",
      fields: {
        name: "Workflow name",
        nameValue: "",
        type: "Document type",
        typeOptions: ["Contract", "Invoice", "Vendor form", "Custom document"]
      },
      action: "Publish workflow"
    }
  },
  builder: {
    inspector: {
      status: {
        title: "Workflow status",
        state: "Ready to publish",
        description: (stages: number, fields: number, rules: number) =>
          `${stages} configured stages, ${fields} extracted fields, ${rules} human review rules.`
      },
      latestRun: {
        title: "Latest run"
      },
      evidence: {
        title: "Evidence preview"
      }
    },
    stages: {
      document: {
        kicker: "Document setup",
        title: "Define what this workflow accepts.",
        fields: {
          name: "Workflow name",
          type: "Document type",
          typeOptions: ["Contract", "Invoice", "Vendor form"],
          source: "Intake source",
          sourceOptions: ["Direct upload", "Shared inbox", "API upload"],
          summary: "Workflow summary"
        }
      },
      fields: {
        kicker: "Field schema",
        title: "Define the record schema for this workflow.",
        action: "Add field",
        tableHeaders: ["Field", "Type", "Confidence", "Rule", ""]
      },
      review: {
        kicker: "Review rules",
        title: "Route exceptions to the right people.",
        confidence: {
          kicker: "Confidence",
          title: "Low-confidence fields",
          items: [
            "Review if field confidence is below 82%.",
            "Review if renewal, termination, or payment terms are missing.",
            "Review if liability language is detected in the contract body."
          ]
        },
        assignment: {
          kicker: "Assignment",
          title: "Human review queue",
          items: [
            "Route commercial exceptions to Trade Ops.",
            "Send payment term conflicts to Finance.",
            "Escalate legal clause flags to Legal Ops."
          ]
        }
      },
      delivery: {
        kicker: "Delivery",
        title: "Send approved records downstream.",
        webhook: {
          kicker: "Webhook",
          title: "Procurement endpoint",
          items: [
            "Send reviewed records to procurement webhook.",
            "Store approved extraction with full evidence trail.",
            "Notify operations when obligations require follow-up."
          ]
        },
        export: {
          kicker: "Export",
          title: "Records table",
          items: [
            "Write every approved field to the records table.",
            "Attach source evidence and reviewer decisions.",
            "Make export available as CSV and API response."
          ]
        }
      }
    }
  },
  addFieldModal: {
    kicker: "Structured field",
    title: "Add extraction field",
    closeAria: "Close add field modal",
    fields: {
      name: {
        label: "Field name",
        placeholder: "Contract value"
      },
      type: {
        label: "Field type",
        options: ["Text", "Number", "Date", "Currency", "Company", "Clause", "Terms"]
      },
      source: {
        label: "Evidence source",
        options: ["Header", "Signature block", "Opening clause", "Commercial schedule", "Document body"]
      },
      rule: {
        label: "Review rule",
        options: ["Required", "Flag if missing", "Review below 82%", "Review if changed"]
      },
      instruction: {
        label: "Workflow instruction",
        placeholder: "Extract the total contract value including currency and billing cadence."
      }
    },
    actions: {
      cancel: "Cancel",
      submit: "Add field"
    }
  }
};

export const publishedWorkflows: PublishedWorkflow[] = [

];

export const workflowStages: WorkflowStage[] = ["Document", "Fields"];

export const workspaceSectionContent: Record<Exclude<AppSection, "Workflows">, WorkspaceSectionContent> = {
  "Process documents": {
    kicker: "Document runs",
    title: "Track every upload from intake to record creation",
    description: "Runs will become the operational ledger for uploads, OCR, extraction, review routing, and processing errors.",
    actions: [],
    items: []
  },
  "Review queue": {
    kicker: "Human review",
    title: "Clear exceptions with source evidence beside each field",
    description: "The review queue should show document evidence, confidence, validation issues, and edit or approval controls.",
    actions: [],
    items: []
  },
  Records: {
    kicker: "Structured records",
    title: "Browse approved extracted data with traceable evidence",
    description: "Records should be searchable by workflow, status, confidence, document type, date, and source document.",
    actions: [],
    items: []
  },
  Integrations: {
    kicker: "Delivery",
    title: "Send approved records where the business already works",
    description: "CSV, API, and webhook are the first integrations because they prove interoperability without paid services.",
    actions: [],
    items: []
  },
};
