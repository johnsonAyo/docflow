import {
  AppField,
  AppRun,
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
        nameValue: "New supplier packet",
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
        title: "Latest run",
        batch: "Batch CT-219"
      },
      evidence: {
        title: "Evidence preview",
        document: {
          clause: "Renewal clause",
          text: "Agreement renews for successive one-year periods unless either party gives written notice at least sixty days prior to expiration."
        },
        result: {
          title: "Auto-renewal detected",
          details: "73% confidence · routed to review"
        }
      }
    },
    stages: {
      document: {
        kicker: "Document setup",
        title: "Define what this workflow accepts.",
        fields: {
          name: "Workflow name",
          nameValue: "Contract intake",
          type: "Document type",
          typeOptions: ["Contract", "Invoice", "Vendor form"],
          source: "Intake source",
          sourceOptions: ["Shared inbox", "Manual upload", "API upload"],
          record: "Complete record",
          recordValue: "Counterparty, dates, renewal terms, payment terms, and approval evidence."
        }
      },
      fields: {
        kicker: "Field schema",
        title: "Define the record schema for this workflow.",
        action: "Add field",
        tableHeaders: ["Field", "Type", "Evidence source", "Confidence", "Rule"]
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

export const appRuns: AppRun[] = [
  {
    document: "Harbourline master services agreement",
    type: "Contract",
    status: "Needs review",
    issues: 2,
    owner: "Trade Ops",
  },
  {
    document: "Northline industrial invoice 0427",
    type: "Invoice",
    status: "Ready",
    issues: 0,
    owner: "Finance",
  },
  {
    document: "Westbridge supplier onboarding pack",
    type: "Vendor form",
    status: "In review",
    issues: 4,
    owner: "Procurement",
  },
];

export const publishedWorkflows: PublishedWorkflow[] = [
  {
    name: "Contract intake",
    type: "Contract",
    status: "Published",
    documents: "94 documents",
    owner: "Trade Ops",
  },
  {
    name: "Invoice approval",
    type: "Invoice",
    status: "Published",
    documents: "128 documents",
    owner: "Finance",
  },
  {
    name: "Supplier onboarding",
    type: "Vendor form",
    status: "Draft",
    documents: "25 documents",
    owner: "Procurement",
  },
];

export const workflowStages: WorkflowStage[] = ["Document", "Fields", "Review", "Delivery"];

export const appFields: AppField[] = [
  {
    name: "Counterparty",
    type: "Company",
    source: "Header + signature block",
    confidence: "96%",
    rule: "Required",
  },
  {
    name: "Effective date",
    type: "Date",
    source: "Opening clause",
    confidence: "94%",
    rule: "Required",
  },
  {
    name: "Renewal clause",
    type: "Clause",
    source: "Term section",
    confidence: "73%",
    rule: "Review below 82%",
  },
  {
    name: "Payment terms",
    type: "Terms",
    source: "Commercial schedule",
    confidence: "88%",
    rule: "Flag if missing",
  },
];

export const workspaceSectionContent: Record<Exclude<AppSection, "Workflows">, WorkspaceSectionContent> = {
  Runs: {
    kicker: "Document runs",
    title: "Track every upload from intake to record creation",
    description: "Runs will become the operational ledger for uploads, OCR, extraction, review routing, and processing errors.",
    actions: [
      { label: "Upload documents", intent: "primary" },
      { label: "View runs", intent: "secondary" },
    ],
    items: [
      {
        title: "Harbourline master services agreement",
        meta: "Contract · Trade Ops",
        status: "Needs review",
        detail: "2 issues after extraction",
      },
      {
        title: "Northline industrial invoice 0427",
        meta: "Invoice · Finance",
        status: "Ready",
        detail: "All required fields extracted",
      },
      {
        title: "Westbridge supplier onboarding pack",
        meta: "Vendor form · Procurement",
        status: "In review",
        detail: "4 fields awaiting approval",
      },
    ],
  },
  "Review queue": {
    kicker: "Human review",
    title: "Clear exceptions with source evidence beside each field",
    description: "The review queue should show document evidence, confidence, validation issues, and edit or approval controls.",
    actions: [
      { label: "Approve next item", intent: "primary" },
      { label: "Filter issues", intent: "secondary" },
    ],
    items: [
      {
        title: "Renewal clause",
        meta: "Harbourline contract · 73% confidence",
        status: "Needs review",
        detail: "Auto-renewal detected with ambiguous notice period",
      },
      {
        title: "Invoice total",
        meta: "Northline invoice · 81% confidence",
        status: "Needs review",
        detail: "Subtotal, tax, and total do not reconcile",
      },
      {
        title: "Payment terms",
        meta: "Westbridge supplier pack · 88% confidence",
        status: "In review",
        detail: "Reviewer changed net terms from 45 to 30 days",
      },
    ],
  },
  Records: {
    kicker: "Structured records",
    title: "Browse approved extracted data with traceable evidence",
    description: "Records should be searchable by workflow, status, confidence, document type, date, and source document.",
    actions: [
      { label: "Export CSV", intent: "primary" },
      { label: "View record detail", intent: "secondary" },
    ],
    items: [
      {
        title: "Northline industrial invoice 0427",
        meta: "Invoice approval · Finance",
        status: "Ready",
        detail: "$18,420.00 due 2026-06-15",
      },
      {
        title: "Harbourline master services agreement",
        meta: "Contract intake · Trade Ops",
        status: "Needs review",
        detail: "Renewal, governing law, and penalties captured",
      },
      {
        title: "Westbridge supplier onboarding pack",
        meta: "Supplier onboarding · Procurement",
        status: "Draft",
        detail: "Tax ID and bank verification pending",
      },
    ],
  },
  Integrations: {
    kicker: "Delivery",
    title: "Send approved records where the business already works",
    description: "CSV, API, and webhook are the first integrations because they prove interoperability without paid services.",
    actions: [
      { label: "Test webhook", intent: "primary" },
      { label: "Configure CSV", intent: "secondary" },
    ],
    items: [
      {
        title: "CSV export",
        meta: "Per workflow or document run",
        status: "Planned",
        detail: "Download reviewed records with source and confidence columns",
      },
      {
        title: "Webhook delivery",
        meta: "Local endpoint simulation",
        status: "Planned",
        detail: "Send approved records and log delivery outcome",
      },
      {
        title: "Records API",
        meta: "Backend metadata route",
        status: "Available",
        detail: "Expose records for downstream tools and scripts",
      },
    ],
  },
};
