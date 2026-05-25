import { FieldRow } from "@/types";
import { landingLabels } from "@/pages/LandingPage/labels";

export function statusClass(status: FieldRow["status"]) {
  return landingLabels.statusClasses[status] || "is-ready";
}
