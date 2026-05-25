import { Database, FileSearch, Layers3, Waypoints } from "lucide-react";
import { MotionSection } from "@/components/LandingSections/shared";
import { landingLabels } from "@/pages/LandingPage/labels";

export function ArchitectureSection() {
  return (
    <MotionSection className="section architecture-section" id="architecture" ariaLabelledby="architecture-title">
      <div className="architecture-panel">
        <div>
          <p className="eyebrow">{landingLabels.architecture.eyebrow}</p>
          <h2 id="architecture-title">{landingLabels.architecture.title}</h2>
          <p>{landingLabels.architecture.copy}</p>
        </div>
        <div className="architecture-list" aria-label="Architecture boundaries">
          {landingLabels.architecture.boundaries.map((boundary) => (
            <span key={boundary.label}>{boundaryIcon(boundary.icon)}{boundary.label}</span>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}

function boundaryIcon(icon: string) {
  if (icon === "FileSearch") {
    return <FileSearch size={17} aria-hidden="true" />;
  }
  if (icon === "Layers3") {
    return <Layers3 size={17} aria-hidden="true" />;
  }
  if (icon === "Database") {
    return <Database size={17} aria-hidden="true" />;
  }

  return <Waypoints size={17} aria-hidden="true" />;
}
