import { AppSection, WorkspaceSectionContent } from "@/types";

export const workspaceSectionContent: Record<Exclude<AppSection, "Workflows">, WorkspaceSectionContent> = {
  Runs: {
    kicker: "Document runs",
    title: "Track every upload from intake to record creation",
    description: "Runs will become the operational ledger for uploads, OCR, extraction, review routing, and processing errors.",
    actions: [
      { label: "Upload documents", intent: "primary" },
      { label: "View runs", intent: "secondary" },
    ],
    items: []
  },
  "Review queue": {
    kicker: "Human review",
    title: "Clear exceptions with source evidence beside each field",
    description: "The review queue should show document evidence, confidence, validation issues, and edit or approval controls.",
    actions: [
      { label: "Approve next item", intent: "primary" },
      { label: "Filter issues", intent: "secondary" },
    ],
    items: []
  },
  Records: {
    kicker: "Structured records",
    title: "Browse approved extracted data with traceable evidence",
    description: "Records should be searchable by workflow, status, confidence, document type, date, and source document.",
    actions: [
      { label: "Export CSV", intent: "primary" },
      { label: "View record detail", intent: "secondary" },
    ],
    items: []
  },
  Integrations: {
    kicker: "Delivery",
    title: "Send approved records where the business already works",
    description: "CSV, API, and webhook are the first integrations because they prove interoperability without paid services.",
    actions: [
      { label: "Test webhook", intent: "primary" },
      { label: "Configure CSV", intent: "secondary" },
    ],
    items: []
  },
};
