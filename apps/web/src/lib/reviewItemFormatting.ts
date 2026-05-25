export function normalizeFields(fields: Array<Record<string, unknown>>) {
  return fields.map((field) => ({
    name: String(field.name || field.field || "Field"),
    value: formatValue(field.value),
    confidence: formatConfidence(field.confidence),
  }));
}

export function formatValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

export function formatConfidence(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string") return value.trim();
  return "";
}

export function parseThreshold(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const numeric = Number.parseFloat(value.replace("%", ""));
  if (Number.isNaN(numeric)) return null;
  return numeric > 1 ? numeric / 100 : numeric;
}

export function normalizeKey(value: string) {
  return value.trim().toLowerCase();
}
