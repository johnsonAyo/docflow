import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { fadeInUp } from "@/components/LandingSections/motion";

export function MotionSection({
  ariaLabelledby,
  children,
  className,
  id,
}: {
  ariaLabelledby: string;
  children: React.ReactNode;
  className: string;
  id?: string;
}) {
  return (
    <motion.section
      className={className}
      id={id}
      aria-labelledby={ariaLabelledby}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
    >
      {children}
    </motion.section>
  );
}

export function SectionHeading({
  compact = false,
  copy,
  eyebrow,
  title,
  titleId,
}: {
  compact?: boolean;
  copy?: string;
  eyebrow: string;
  title: string;
  titleId: string;
}) {
  return (
    <div className={`section-heading${compact ? " compact" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={titleId}>{title}</h2>
      {copy ? <p>{copy}</p> : null}
    </div>
  );
}

export function ProofCard({
  card,
  className,
  Icon,
}: {
  card: { title: string; copy: string; items: string[] };
  className: string;
  Icon: typeof FileText;
}) {
  return (
    <article className={`proof-card ${className}`}>
      <div className="proof-icon">
        <Icon size={22} aria-hidden="true" />
      </div>
      <h3>{card.title}</h3>
      <p>{card.copy}</p>
      <ul>
        {card.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
