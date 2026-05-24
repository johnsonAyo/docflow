import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleAlert,
  Database,
  FileSearch,
  FileText,
  GitBranch,
  Globe2,
  KeyRound,
  Layers3,
  LockKeyhole,
  Mail,
  PlugZap,
  SearchCheck,
  Send,
  ShieldCheck,
  Table2,
  Upload,
  Waypoints,
} from "lucide-react";

type WorkflowStep = {
  eyebrow: string;
  title: string;
  copy: string;
};

type FieldRow = {
  label: string;
  value: string;
  confidence: string;
  status: "Ready" | "Needs review" | "Approved";
};

type Integration = {
  name: string;
  detail: string;
  status: string;
  badgeVariant: "available" | "enterprise";
};

const workflowSteps: WorkflowStep[] = [
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

const extractedFields: FieldRow[] = [
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

const integrations: Integration[] = [
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

const useCases = [
  "Invoice intake",
  "Contract review",
  "Admissions processing",
  "Bills of lading",
  "HR documentation",
  "Regulatory filings",
];

function statusClass(status: FieldRow["status"]) {
  if (status === "Needs review") return "is-warning";
  if (status === "Approved") return "is-approved";
  return "is-ready";
}

export function App() {
  return (
    <main className="site-shell">
      <header className="site-nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Document OCR Engine home">
          <span className="brand-mark">D</span>
          <span>Document OCR Engine</span>
        </a>
        <nav className="nav-links" aria-label="Landing sections">
          <a href="#workflow">Workflow</a>
          <a href="#review">Review</a>
          <a href="#integrations">Integrations</a>
          <a href="#architecture">Security</a>
        </nav>
        <a className="nav-action" href="#demo">
          See it in action
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-scene" aria-hidden="true">
          <ProductFrame />
        </div>

        <div className="hero-content">
          <p className="eyebrow">Document operations platform</p>
          <h1 id="hero-title">Turn business documents into verified, actionable records.</h1>
          <p className="hero-copy">
            Document OCR Engine gives operations teams a structured way to define document
            workflows, extract critical data, resolve exceptions, and deliver
            clean records into the systems that run your business.
          </p>
          <div className="hero-actions" aria-label="Hero actions">
            <a className="primary-button" href="#workflow">
              See how it works
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="secondary-button" href="#review">
              View the review queue
            </a>
          </div>
          <div className="mobile-product-preview" aria-label="Document OCR Engine mobile product preview">
            <div>
              <span>Review queue</span>
              <strong>Contract intake</strong>
            </div>
            <p>Auto-renewal clause detected. Confidence 73%. Routed for review.</p>
            <small>Approved after field verification</small>
          </div>
          <div className="hero-proof" aria-label="Product proof points">
            <span>
              <Check size={14} aria-hidden="true" />
              Visual workflow builder
            </span>
            <span>
              <Check size={14} aria-hidden="true" />
              Human review built in
            </span>
            <span>
              <Check size={14} aria-hidden="true" />
              API, webhook & CSV delivery
            </span>
          </div>
        </div>
      </section>

      <section className="section intro-section" aria-labelledby="intro-title">
        <div className="section-kicker">
          <span>The problem</span>
        </div>
        <div className="intro-grid">
          <div>
            <h2 id="intro-title">
              The bottleneck is never reading the document. It is moving what is
              in it into the right place.
            </h2>
          </div>
          <div className="intro-copy">
            <p>
              Finance teams copy invoice totals by hand. Legal teams miss renewal
              dates buried in contracts. Operations teams chase incomplete forms
              across email chains. Data sits in documents while decisions wait.
            </p>
            <p>
              Document OCR Engine turns every document type into a repeatable, auditable
              operation: define the schema, surface exceptions for human review,
              store the verified record, and route it onward automatically.
            </p>
          </div>
        </div>
      </section>

      <section className="section workflow-section" id="workflow" aria-labelledby="workflow-title">
        <div className="section-heading">
          <p className="eyebrow">Workflow builder</p>
          <h2 id="workflow-title">Configured by operations. Trusted by engineering.</h2>
          <p>
            A guided builder makes workflows understandable for non-technical
            teams. Every configuration is stored as structured, versionable
            definitions that engineering teams can inspect, extend, and integrate.
          </p>
        </div>

        <div className="builder-layout">
          <div className="builder-steps" aria-label="Builder steps">
            {workflowSteps.map((step) => (
              <article className="builder-step" key={step.title}>
                <span>{step.eyebrow}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="builder-preview" aria-label="Workflow builder preview">
            <div className="panel-toolbar">
              <span>Contract intake workflow</span>
              <strong>Saved</strong>
            </div>
            <div className="builder-form">
              <label>
                Document type
                <span>Trade contract</span>
              </label>
              <label>
                Required fields
                <span>Parties, dates, payment terms, renewal, obligations</span>
              </label>
              <label>
                Review if
                <span>Confidence below 82%, missing dates, risky clause found</span>
              </label>
              <label>
                Deliver to
                <span>Export CSV, send webhook, create obligations summary</span>
              </label>
            </div>
            <div className="config-strip">
              <code>workflow.contract_intake.v1</code>
              <span>JSON/YAML compatible</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section proof-section" id="demo" aria-labelledby="demo-title">
        <div className="section-heading compact">
          <p className="eyebrow">Proven workflows</p>
          <h2 id="demo-title">Invoices prove throughput. Contracts prove intelligence.</h2>
        </div>

        <div className="proof-grid">
          <article className="proof-card">
            <div className="proof-icon">
              <FileText size={22} aria-hidden="true" />
            </div>
            <h3>Invoice intake</h3>
            <p>
              Extract vendor, totals, line items, due dates, and payment terms.
              Flag discrepancies and route exceptions before they reach accounting.
            </p>
            <ul>
              <li>Payment summary</li>
              <li>CSV export</li>
              <li>Webhook delivery</li>
            </ul>
          </article>

          <article className="proof-card featured">
            <div className="proof-icon">
              <SearchCheck size={22} aria-hidden="true" />
            </div>
            <h3>Contract intake</h3>
            <p>
              Extract parties, dates, obligations, payment terms, renewal clauses,
              and risk signals into a reviewable, auditable operational record.
            </p>
            <ul>
              <li>Obligations summary</li>
              <li>Risk review</li>
              <li>Renewal tracking</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section review-section" id="review" aria-labelledby="review-title">
        <div className="review-copy">
          <p className="eyebrow">Human review</p>
          <h2 id="review-title">Trust comes from showing the evidence.</h2>
          <p>
            Every extracted value carries a confidence score, source context, and
            review status. Operators approve verified records instead of re-keying
            data from documents.
          </p>
          <div className="review-stats" aria-label="Review statistics">
            <span>
              <strong>47</strong>
              fields extracted
            </span>
            <span>
              <strong>8</strong>
              pending review
            </span>
            <span>
              <strong>3</strong>
              ready to deliver
            </span>
          </div>
        </div>

        <div className="review-panel" aria-label="Review queue preview">
          <div className="panel-toolbar">
            <span>Review queue</span>
            <strong>Batch INV-0427</strong>
          </div>
          <div className="document-evidence">
            <div className="document-sheet">
              <span>INVOICE</span>
              <b>Northline Industrial Supply</b>
              <i />
              <i />
              <i className="short" />
              <em>Net 45 after delivery</em>
            </div>
            <div className="field-list">
              {extractedFields.map((field) => (
                <div className="field-row" key={field.label}>
                  <div>
                    <span>{field.label}</span>
                    <strong>{field.value}</strong>
                  </div>
                  <div className="field-meta">
                    <small>{field.confidence}</small>
                    <b className={statusClass(field.status)}>{field.status}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="section integration-section"
        id="integrations"
        aria-labelledby="integrations-title"
      >
        <div className="section-heading">
          <p className="eyebrow">Integrations</p>
          <h2 id="integrations-title">Connects to the systems your business already runs on.</h2>
          <p>
            Verified records flow directly into downstream tools — no scripting,
            no manual exports. Document OCR Engine fits into existing stacks through open
            standards and native connectors.
          </p>
        </div>

        <div className="integration-grid">
          {integrations.map((integration) => (
            <article className="integration-item" key={integration.name}>
              <div>
                <PlugZap size={19} aria-hidden="true" />
                <h3>{integration.name}</h3>
              </div>
              <p>{integration.detail}</p>
              <span data-variant={integration.badgeVariant}>{integration.status}</span>
            </article>
          ))}
        </div>
      </section>

      <section
        className="section architecture-section"
        id="architecture"
        aria-labelledby="architecture-title"
      >
        <div className="architecture-panel">
          <div>
            <p className="eyebrow">Security & data control</p>
            <h2 id="architecture-title">Your data stays where your policies require it.</h2>
            <p>
              Document OCR Engine is built on clean provider boundaries — OCR, extraction,
              storage, and delivery are independently configurable. Deploy on
              your infrastructure, connect your preferred vendors, and meet your
              data residency requirements without workflow changes.
            </p>
          </div>
          <div className="architecture-list" aria-label="Architecture boundaries">
            <span>
              <FileSearch size={17} aria-hidden="true" />
              OCR provider
            </span>
            <span>
              <Layers3 size={17} aria-hidden="true" />
              Extraction engine
            </span>
            <span>
              <Database size={17} aria-hidden="true" />
              Record store
            </span>
            <span>
              <Waypoints size={17} aria-hidden="true" />
              Delivery layer
            </span>
          </div>
        </div>
      </section>

      <section className="section usecase-section" aria-labelledby="usecase-title">
        <div className="section-heading compact">
          <p className="eyebrow">Works across document types</p>
          <h2 id="usecase-title">One platform. Every document operation your business runs.</h2>
        </div>
        <div className="usecase-strip" aria-label="Example document workflows">
          {useCases.map((useCase) => (
            <span key={useCase}>{useCase}</span>
          ))}
        </div>
      </section>

      <section className="final-section" aria-labelledby="final-title">
        <div>
          <p className="eyebrow">Get started</p>
          <h2 id="final-title">Replace manual document handling with a workflow that runs itself.</h2>
        </div>
        <a className="primary-button" href="#workflow">
          Build your first workflow
          <ArrowRight size={18} aria-hidden="true" />
        </a>
      </section>

      <SiteFooter />
    </main>
  );
}

function SiteFooter() {
  const CURRENT_YEAR = new Date().getFullYear();

  const footerLinks = {
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
  };

  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <a className="footer-brand" href="#top" aria-label="Document OCR Engine home">
            <span className="brand-mark">D</span>
            <span>Document OCR Engine</span>
          </a>
          <p className="footer-tagline">
            Document operations for teams that can't afford to get it wrong.
          </p>
          <div className="footer-social" aria-label="Social links">
            <a href="#" aria-label="Document OCR Engine on LinkedIn" className="footer-social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a href="#" aria-label="Document OCR Engine on X" className="footer-social-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" aria-label="Document OCR Engine on GitHub" className="footer-social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </a>
          </div>
        </div>

        <nav className="footer-nav" aria-label="Footer navigation">
          {Object.entries(footerLinks).map(([group, links]) => (
            <div className="footer-nav-col" key={group}>
              <h3 className="footer-nav-heading">{group}</h3>
              <ul>
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="footer-bottom">
        <p>&copy; {CURRENT_YEAR} Document OCR Engine Technologies, Inc. All rights reserved.</p>
        <div className="footer-legal" aria-label="Legal links">
          <a href="#">Privacy policy</a>
          <a href="#">Terms of service</a>
          <a href="#">Cookie settings</a>
          <a href="#">SOC 2</a>
        </div>
      </div>
    </footer>
  );
}

function ProductFrame() {
  return (
    <div className="product-frame">
      <div className="window-bar">
        <span />
        <span />
        <span />
      </div>
      <div className="product-layout">
        <aside className="product-sidebar">
          <strong>Docu OCR</strong>
          <span className="active">Workflows</span>
          <span>Runs</span>
          <span>Review queue</span>
          <span>Records</span>
          <span>Integrations</span>
        </aside>
        <div className="product-main">
          <div className="product-header">
            <div>
              <small>Workflow builder</small>
              <strong>Contract intake</strong>
            </div>
            <span>Active</span>
          </div>
          <div className="product-columns">
            <div className="flow-column">
              <div className="flow-node complete">
                <Upload size={16} aria-hidden="true" />
                <span>Upload documents</span>
              </div>
              <div className="flow-node complete">
                <FileSearch size={16} aria-hidden="true" />
                <span>Extract fields</span>
              </div>
              <div className="flow-node warning">
                <CircleAlert size={16} aria-hidden="true" />
                <span>Review exceptions</span>
              </div>
              <div className="flow-node">
                <Send size={16} aria-hidden="true" />
                <span>Deliver record</span>
              </div>
            </div>
            <div className="record-card">
              <div className="record-card-header">
                <span>Extracted record</span>
                <BadgeCheck size={17} aria-hidden="true" />
              </div>
              <p>Harbourline Energy Services</p>
              <div className="mini-table">
                <span>Effective date</span>
                <strong>14 May 2026</strong>
                <span>Payment terms</span>
                <strong>Net 45</strong>
                <span>Renewal</span>
                <strong>Needs review</strong>
              </div>
            </div>
          </div>
          <div className="product-footer">
            <span>
              <ShieldCheck size={15} aria-hidden="true" />
              SOC 2 ready
            </span>
            <span>
              <GitBranch size={15} aria-hidden="true" />
              Version controlled
            </span>
            <span>
              <Globe2 size={15} aria-hidden="true" />
              Webhook delivery
            </span>
            <span>
              <KeyRound size={15} aria-hidden="true" />
              Human approval
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
