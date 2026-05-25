import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { ProductFrame } from "@/components/LandingComponents";
import { fadeInUp, staggerContainer } from "@/components/LandingSections/motion";
import { landingLabels } from "@/pages/LandingPage/labels";

export function HeroSection() {
  return (
    <motion.section className="hero" id="top" aria-labelledby="hero-title" initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div className="hero-scene" aria-hidden="true" variants={fadeInUp}>
        <ProductFrame />
      </motion.div>
      <motion.div className="hero-content" variants={fadeInUp}>
        <p className="eyebrow">{landingLabels.hero.eyebrow}</p>
        <h1 id="hero-title">{landingLabels.hero.title}</h1>
        <p className="hero-copy">{landingLabels.hero.copy}</p>
        <div className="hero-actions" aria-label="Hero actions">
          <a className="primary-button" href="#workflow">
            {landingLabels.hero.primaryAction}
            <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="secondary-button" href="#review">{landingLabels.hero.secondaryAction}</a>
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
            <span key={point}><Check size={14} aria-hidden="true" />{point}</span>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}
