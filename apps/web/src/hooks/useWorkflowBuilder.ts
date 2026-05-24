import { useState, type FormEvent } from "react";
import { AppField, WorkflowStage, AppSection } from "@/types";
import { appFields } from "@/components/WorkspaceComponents/labels";

export function useWorkflowBuilder() {
  const [activeSection, setActiveSection] = useState<AppSection>("Workflows");
  const [workflowView, setWorkflowView] = useState<"overview" | "builder">("overview");
  const [activeStage, setActiveStage] = useState<WorkflowStage>("Fields");
  const [fields, setFields] = useState<AppField[]>(appFields);
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);

  function handleSectionClick(section: AppSection) {
    setActiveSection(section);
    if (section !== "Workflows") {
      setWorkflowView("overview");
    }
  }

  function handleAddField(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fieldName = String(formData.get("fieldName") || "New field");
    const fieldType = String(formData.get("fieldType") || "Text");
    const evidenceSource = String(formData.get("evidenceSource") || "Document body");
    const reviewRule = String(formData.get("reviewRule") || "Required");

    setFields((currentFields) => [
      ...currentFields,
      {
        name: fieldName,
        type: fieldType,
        source: evidenceSource,
        confidence: "New",
        rule: reviewRule,
      },
    ]);
    setIsAddFieldOpen(false);
  }

  return {
    activeSection,
    workflowView,
    activeStage,
    fields,
    isAddFieldOpen,
    setActiveStage,
    setWorkflowView,
    setIsAddFieldOpen,
    handleSectionClick,
    handleAddField,
  };
}
