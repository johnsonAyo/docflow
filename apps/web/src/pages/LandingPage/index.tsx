import { ArrowRight, Check, FileText, SearchCheck, PlugZap, FileSearch, Layers3, Database, Waypoints } from "lucide-react";
import { SiteFooter, ProductFrame } from "@/components/LandingComponents";
import { FieldRow } from "@/types";
import { landingLabels, workflowSteps, extractedFields, integrations } from "./labels";

function statusClass(status: FieldRow["status"]) {
  return landingLabels.statusClasses[status] || "is-ready";
}

export function LandingPage() {
  return (
    <main className="site-shell">
      <header className="site-nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label={`${landingLabels.header.brand} home`}>
          <span className="brand-mark">{landingLabels.header.brand[0]}</span>
          <span>{landingLabels.header.brand}</span>
        </a>
        <nav className="nav-links" aria-label="Landing sections">
          <a href="#workflow">{landingLabels.header.nav.workflow}</a>
          <a href="#review">{landingLabels.header.nav.review}</a>
          <a href="#integrations">{landingLabels.header.nav.integrations}</a>
          <a href="#architecture">{landingLabels.header.nav.security}</a>
        </nav>
        <a className="nav-action" href="#/app">
          {landingLabels.header.action}
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-scene" aria-hidden="true">
          <ProductFrame />
        </div>

        <div className="hero-content">
          <p className="eyebrow">{landingLabels.hero.eyebrow}</p>
          <h1 id="hero-title">{landingLabels.hero.title}</h1>
          <p className="hero-copy">{landingLabels.hero.copy}</p>
          <div className="hero-actions" aria-label="Hero actions">
            <a className="primary-button" href="#workflow">
              {landingLabels.hero.primaryAction}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="secondary-button" href="#review">
              {landingLabels.hero.secondaryAction}
            </a>
          </div>
          <div className="mobile-product-preview" aria-label={`${landingLabels.header.brand} mobile product preview`}>
            <div>
              <span>{landingLabels.hero.mobilePreview.kicker}</span>
              <strong>{landingLabels.hero.mobilePreview.title}</strong>
            </div>
            <p>{landingLabels.hero.mobilePreview.body}</p>
            <small>{landingLabels.hero.mobilePreview.status}</small>
          </div>
          <div className="hero-proof" aria-label="Product proof points">
            {landingLabels.hero.proofPoints.map((point) => (
              <span key={point}>
                <Check size={14} aria-hidden="true" />
                {point}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section intro-section" aria-labelledby="intro-title">
        <div className="section-kicker">
          <span>{landingLabels.intro.kicker}</span>
        </div>
        <div className="intro-grid">
          <div>
            <h2 id="intro-title">{landingLabels.intro.title}</h2>
          </div>
          <div className="intro-copy">
            {landingLabels.intro.copyParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="section workflow-section" id="workflow" aria-labelledby="workflow-title">
        <div className="section-heading">
          <p className="eyebrow">{landingLabels.workflow.eyebrow}</p>
          <h2 id="workflow-title">{landingLabels.workflow.title}</h2>
          <p>{landingLabels.workflow.copy}</p>
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
              <span>{landingLabels.workflow.preview.toolbarTitle}</span>
              <strong>{landingLabels.workflow.preview.toolbarStatus}</strong>
            </div>
            <div className="builder-form">
              {landingLabels.workflow.preview.fields.map((field) => (
                <label key={field.label}>
                  {field.label}
                  <span>{field.value}</span>
                </label>
              ))}
            </div>
            <div className="config-strip">
              <code>{landingLabels.workflow.preview.configCode}</code>
              <span>{landingLabels.workflow.preview.configFormat}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section proof-section" id="demo" aria-labelledby="demo-title">
        <div className="section-heading compact">
          <p className="eyebrow">{landingLabels.proof.eyebrow}</p>
          <h2 id="demo-title">{landingLabels.proof.title}</h2>
        </div>

        <div className="proof-grid">
          <article className="proof-card">
            <div className="proof-icon">
              <FileText size={22} aria-hidden="true" />
            </div>
            <h3>{landingLabels.proof.cards.invoice.title}</h3>
            <p>{landingLabels.proof.cards.invoice.copy}</p>
            <ul>
              {landingLabels.proof.cards.invoice.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="proof-card featured">
            <div className="proof-icon">
              <SearchCheck size={22} aria-hidden="true" />
            </div>
            <h3>{landingLabels.proof.cards.contract.title}</h3>
            <p>{landingLabels.proof.cards.contract.copy}</p>
            <ul>
              {landingLabels.proof.cards.contract.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="section review-section" id="review" aria-labelledby="review-title">
        <div className="review-copy">
          <p className="eyebrow">{landingLabels.review.eyebrow}</p>
          <h2 id="review-title">{landingLabels.review.title}</h2>
          <p>{landingLabels.review.copy}</p>
          <div className="review-stats" aria-label="Review statistics">
            {landingLabels.review.stats.map((stat) => (
              <span key={stat.label}>
                <strong>{stat.value}</strong>
                {stat.label}
              </span>
            ))}
          </div>
        </div>

        <div className="review-panel" aria-label="Review queue preview">
          <div className="panel-toolbar">
            <span>{landingLabels.review.panel.toolbarTitle}</span>
            <strong>{landingLabels.review.panel.toolbarBatch}</strong>
          </div>
          <div className="document-evidence">
            <div className="document-sheet">
              <span>{landingLabels.review.panel.document.type}</span>
              <b>{landingLabels.review.panel.document.company}</b>
              <i />
              <i />
              <i className="short" />
              <em>{landingLabels.review.panel.document.terms}</em>
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
          <p className="eyebrow">{landingLabels.integrations.eyebrow}</p>
          <h2 id="integrations-title">{landingLabels.integrations.title}</h2>
          <p>{landingLabels.integrations.copy}</p>
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
            <p className="eyebrow">{landingLabels.architecture.eyebrow}</p>
            <h2 id="architecture-title">{landingLabels.architecture.title}</h2>
            <p>{landingLabels.architecture.copy}</p>
          </div>
          <div className="architecture-list" aria-label="Architecture boundaries">
            {landingLabels.architecture.boundaries.map((boundary) => (
              <span key={boundary.label}>
                {boundary.icon === "FileSearch" && <FileSearch size={17} aria-hidden="true" />}
                {boundary.icon === "Layers3" && <Layers3 size={17} aria-hidden="true" />}
                {boundary.icon === "Database" && <Database size={17} aria-hidden="true" />}
                {boundary.icon === "Waypoints" && <Waypoints size={17} aria-hidden="true" />}
                {boundary.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section usecase-section" aria-labelledby="usecase-title">
        <div className="section-heading compact">
          <p className="eyebrow">{landingLabels.useCases.eyebrow}</p>
          <h2 id="usecase-title">{landingLabels.useCases.title}</h2>
        </div>
        <div className="usecase-strip" aria-label="Example document workflows">
          {landingLabels.useCases.items.map((useCase) => (
            <span key={useCase}>{useCase}</span>
          ))}
        </div>
      </section>

      <section className="final-section" aria-labelledby="final-title">
        <div>
          <p className="eyebrow">{landingLabels.final.eyebrow}</p>
          <h2 id="final-title">{landingLabels.final.title}</h2>
        </div>
        <a className="primary-button" href="#workflow">
          {landingLabels.final.action}
          <ArrowRight size={18} aria-hidden="true" />
        </a>
      </section>

      <SiteFooter />
    </main>
  );
}
