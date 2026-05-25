import { AppField } from "@/types";

export function fieldFromForm(form: HTMLFormElement): AppField {
  const formData = new FormData(form);

  return {
    name: String(formData.get("fieldName") || "New field"),
    type: String(formData.get("fieldType") || "Text"),
    source: String(formData.get("evidenceSource") || "Document body"),
    confidence: "New",
    rule: String(formData.get("reviewRule") || "Required"),
  };
}
