import { FileSearch, Upload, CircleAlert, Send, BadgeCheck, ShieldCheck, GitBranch, Globe2, KeyRound } from "lucide-react";
import { landingLabels } from "@/pages/LandingPage/labels";

export function SiteFooter() {
  const CURRENT_YEAR = new Date().getFullYear();

  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <a className="footer-brand" href="#top" aria-label={`${landingLabels.header.brand} home`}>
            <span className="brand-mark">{landingLabels.header.brand[0]}</span>
            <span>{landingLabels.header.brand}</span>
          </a>
          <p className="footer-tagline">
            {landingLabels.footer.tagline}
          </p>
          <div className="footer-social" aria-label="Social links">
            <a href="#" aria-label={`${landingLabels.header.brand} on LinkedIn`} className="footer-social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a href="#" aria-label={`${landingLabels.header.brand} on X`} className="footer-social-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" aria-label={`${landingLabels.header.brand} on GitHub`} className="footer-social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </a>
          </div>
        </div>

        <nav className="footer-nav" aria-label="Footer navigation">
          {Object.entries(landingLabels.footer.links).map(([group, links]) => (
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
        <p>&copy; {CURRENT_YEAR} {landingLabels.footer.copyright}</p>
        <div className="footer-legal" aria-label="Legal links">
          {landingLabels.footer.legal.map((link) => (
            <a href={link.href} key={link.label}>{link.label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function ProductFrame() {
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
