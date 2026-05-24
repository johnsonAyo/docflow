import { WorkflowStep, FieldRow, Integration } from "@/types";

export const landingLabels = {
  header: {
    brand: "Document OCR Engine",
    nav: {
      workflow: "Workflow",
      review: "Review",
      integrations: "Integrations",
      security: "Security",
    },
    action: "Open workspace",
  },
  hero: {
    eyebrow: "Document operations platform",
    title: "Turn business documents into verified, actionable records.",
    copy: "Document OCR Engine gives operations teams a structured way to define document workflows, extract critical data, resolve exceptions, and deliver clean records into the systems that run your business.",
    primaryAction: "See how it works",
    secondaryAction: "View the review queue",
    mobilePreview: {
      kicker: "Review queue",
      title: "Contract intake",
      body: "Auto-renewal clause detected. Confidence 73%. Routed for review.",
      status: "Approved after field verification",
    },
    proofPoints: [
      "Visual workflow builder",
      "Human review built in",
      "API, webhook & CSV delivery",
    ],
  },
  intro: {
    kicker: "The problem",
    title:
      "The bottleneck is never reading the document. It is moving what is in it into the right place.",
    copyParagraphs: [
      "Finance teams copy invoice totals by hand. Legal teams miss renewal dates buried in contracts. Operations teams chase incomplete forms across email chains. Data sits in documents while decisions wait.",
      "Document OCR Engine turns every document type into a repeatable, auditable operation: define the schema, surface exceptions for human review, store the verified record, and route it onward automatically.",
    ],
  },
  workflow: {
    eyebrow: "Workflow builder",
    title: "Configured by operations. Trusted by engineering.",
    copy: "A guided builder makes workflows understandable for non-technical teams. Every configuration is stored as structured, versionable definitions that engineering teams can inspect, extend, and integrate.",
    preview: {
      toolbarTitle: "Contract intake workflow",
      toolbarStatus: "Saved",
      fields: [
        { label: "Document type", value: "Trade contract" },
        {
          label: "Required fields",
          value: "Parties, dates, payment terms, renewal, obligations",
        },
        {
          label: "Review if",
          value: "Confidence below 82%, missing dates, risky clause found",
        },
        {
          label: "Deliver to",
          value: "Export CSV, send webhook, create obligations summary",
        },
      ],
      configCode: "workflow.contract_intake.v1",
      configFormat: "JSON/YAML compatible",
    },
  },
  proof: {
    eyebrow: "Proven workflows",
    title: "Invoices prove throughput. Contracts prove intelligence.",
    cards: {
      invoice: {
        title: "Invoice intake",
        copy: "Extract vendor, totals, line items, due dates, and payment terms. Flag discrepancies and route exceptions before they reach accounting.",
        items: ["Payment summary", "CSV export", "Webhook delivery"],
      },
      contract: {
        title: "Contract intake",
        copy: "Extract parties, dates, obligations, payment terms, renewal clauses, and risk signals into a reviewable, auditable operational record.",
        items: ["Obligations summary", "Risk review", "Renewal tracking"],
      },
    },
  },
  review: {
    eyebrow: "Human review",
    title: "Trust comes from showing the evidence.",
    copy: "Every extracted value carries a confidence score, source context, and review status. Operators approve verified records instead of re-keying data from documents.",
    stats: [
      { value: "47", label: "fields extracted" },
      { value: "8", label: "pending review" },
      { value: "3", label: "ready to deliver" },
    ],
    panel: {
      toolbarTitle: "Review queue",
      toolbarBatch: "Batch INV-0427",
      document: {
        type: "INVOICE",
        company: "Northline Industrial Supply",
        terms: "Net 45 after delivery",
      },
    },
  },
  integrations: {
    eyebrow: "Integrations",
    title: "Connects to the systems your business already runs on.",
    copy: "Verified records flow directly into downstream tools — no scripting, no manual exports. Document OCR Engine fits into existing stacks through open standards and native connectors.",
  },
  architecture: {
    eyebrow: "Security & data control",
    title: "Your data stays where your policies require it.",
    copy: "Document OCR Engine is built on clean provider boundaries — OCR, extraction, storage, and delivery are independently configurable. Deploy on your infrastructure, connect your preferred vendors, and meet your data residency requirements without workflow changes.",
    boundaries: [
      { icon: "FileSearch", label: "OCR provider" },
      { icon: "Layers3", label: "Extraction engine" },
      { icon: "Database", label: "Record store" },
      { icon: "Waypoints", label: "Delivery layer" },
    ],
  },
  useCases: {
    eyebrow: "Works across document types",
    title: "One platform. Every document operation your business runs.",
    items: [
      "Invoice intake",
      "Contract review",
      "Admissions processing",
      "Bills of lading",
      "HR documentation",
      "Regulatory filings",
    ],
  },
  final: {
    eyebrow: "Get started",
    title:
      "Replace manual document handling with a workflow that runs itself.",
    action: "Build your first workflow",
  },
  statusClasses: {
    "Needs review": "is-warning",
    "Approved": "is-approved",
    "Ready": "is-ready",
  },
  footer: {
    tagline: "Document operations for teams that can't afford to get it wrong.",
    copyright: "Document OCR Engine Technologies, Inc. All rights reserved.",
    links: {
      Product: [
        { label: "Workflow builder", href: "#workflow" },
        { label: "Review queue", href: "#review" },
        { label: "Integrations", href: "#integrations" },
        { label: "Security", href: "#architecture" },
        { label: "Changelog", href: "#" },
        { label: "Roadmap", href: "#" },
      ],
      Solutions: [
        { label: "Invoice intake", href: "#" },
        { label: "Contract review", href: "#" },
        { label: "HR documentation", href: "#" },
        { label: "Compliance filing", href: "#" },
        { label: "Bills of lading", href: "#" },
      ],
      Company: [
        { label: "About", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Press", href: "#" },
        { label: "Contact", href: "#" },
      ],
      Developers: [
        { label: "API reference", href: "#" },
        { label: "Webhooks", href: "#" },
        { label: "SDKs", href: "#" },
        { label: "Status", href: "#" },
      ],
    },
    legal: [
      { label: "Privacy policy", href: "#" },
      { label: "Terms of service", href: "#" },
      { label: "Cookie settings", href: "#" },
      { label: "SOC 2", href: "#" },
    ]
  }
};

export const workflowSteps: WorkflowStep[] = [
  {
    eyebrow: "01",
    title: "Define the document",
    copy: "Name the workflow, select a document type, and specify what a complete, accurate record looks like.",
  },
  {
    eyebrow: "02",
    title: "Configure the fields",
    copy: "Add structured fields — invoice total, renewal date, contract parties, payment terms, custom clauses, or any domain-specific data point.",
  },
  {
    eyebrow: "03",
    title: "Set review rules",
    copy: "Route low-confidence values, missing fields, anomalous amounts, and flagged clauses directly into a human review queue.",
  },
  {
    eyebrow: "04",
    title: "Deliver the record",
    copy: "Push verified records to downstream systems via CSV export, REST API, or webhook — no manual handoffs.",
  },
];

export const extractedFields: FieldRow[] = [
  {
    label: "Vendor",
    value: "Northline Industrial Supply",
    confidence: "96%",
    status: "Approved",
  },
  {
    label: "Invoice total",
    value: "GBP 18,742.30",
    confidence: "91%",
    status: "Ready",
  },
  {
    label: "Payment terms",
    value: "Net 45 after delivery",
    confidence: "78%",
    status: "Needs review",
  },
  {
    label: "Renewal clause",
    value: "Auto-renews unless cancelled 60 days before term end",
    confidence: "73%",
    status: "Needs review",
  },
];

export const integrations: Integration[] = [
  {
    name: "CSV export",
    detail: "Download structured records for finance, operations, and compliance teams.",
    status: "Available",
    badgeVariant: "available",
  },
  {
    name: "Webhook delivery",
    detail: "Push approved records into any downstream workflow the moment they clear review.",
    status: "Available",
    badgeVariant: "available",
  },
  {
    name: "Records API",
    detail: "Query extracted fields and review status programmatically from any internal system.",
    status: "Available",
    badgeVariant: "available",
  },
  {
    name: "Sheets, CRM & ERP",
    detail: "Native connectors for Google Sheets, Salesforce, NetSuite, and SAP.",
    status: "Enterprise",
    badgeVariant: "enterprise",
  },
];

export const useCases = [
  "Invoice intake",
  "Contract review",
  "Admissions processing",
  "Bills of lading",
  "HR documentation",
  "Regulatory filings",
];
