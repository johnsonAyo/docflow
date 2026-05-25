import { AppSection, WorkspaceSectionContent } from "@/types";

export const workspaceSectionContent: Record<Exclude<AppSection, "Workflows">, WorkspaceSectionContent> = {
  "Process documents": {
    kicker: "Document runs",
    title: "Track active uploads while OCR and extraction run",
    description: "This queue only shows documents still in flight. Finished records and review items move to their own tabs.",
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
