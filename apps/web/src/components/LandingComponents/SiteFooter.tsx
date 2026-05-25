import { landingLabels } from "@/pages/LandingPage/labels";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <a className="footer-brand" href="#top" aria-label={`${landingLabels.header.brand} home`}>
            <span className="brand-mark">{landingLabels.header.brand[0]}</span>
            <span>{landingLabels.header.brand}</span>
          </a>
          <p className="footer-tagline">{landingLabels.footer.tagline}</p>
          <SocialLinks />
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
        <p>&copy; {currentYear} {landingLabels.footer.copyright}</p>
        <div className="footer-legal" aria-label="Legal links">
          {landingLabels.footer.legal.map((link) => (
            <a href={link.href} key={link.label}>{link.label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function SocialLinks() {
  return (
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
  );
}
