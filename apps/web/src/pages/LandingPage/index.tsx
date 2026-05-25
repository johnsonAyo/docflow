import { ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/LandingComponents";
import {
  ArchitectureSection,
  FinalSection,
  HeroSection,
  IntegrationSection,
  IntroSection,
  ProofSection,
  ReviewSection,
  UseCasesSection,
  WorkflowSection,
} from "@/components/LandingSections";
import { landingLabels } from "@/pages/LandingPage/labels";

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

      <HeroSection />
      <IntroSection />
      <WorkflowSection />
      <ProofSection />
      <ReviewSection />
      <IntegrationSection />
      <ArchitectureSection />
      <UseCasesSection />
      <FinalSection />
      <SiteFooter />
    </main>
  );
}
