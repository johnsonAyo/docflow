import { DocumentRun } from "@/types";

export const ACTIVE_RUN_TIMEOUT_MS = 5 * 60 * 1000;

export function isRecentlyActiveRun(run: DocumentRun, nowMs = Date.now()) {
  if (run.status !== "uploaded" && run.status !== "processing") return false;
  const createdAtMs = new Date(run.created_at).getTime();
  if (Number.isNaN(createdAtMs)) return false;
  return nowMs - createdAtMs < ACTIVE_RUN_TIMEOUT_MS;
}

export function isStalledRun(run: DocumentRun, nowMs = Date.now()) {
  if (run.status !== "uploaded" && run.status !== "processing") return false;
  const createdAtMs = new Date(run.created_at).getTime();
  if (Number.isNaN(createdAtMs)) return true;
  return nowMs - createdAtMs >= ACTIVE_RUN_TIMEOUT_MS;
}
