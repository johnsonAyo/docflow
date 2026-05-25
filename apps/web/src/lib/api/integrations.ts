import { API_V1_URL, parseJsonResponse } from "@/lib/apiClient";

export function recordsCsvUrl(workflowId?: string): string {
  const url = new URL(`${API_V1_URL}/exports/records.csv`);
  if (workflowId) {
    url.searchParams.set("workflow_id", workflowId);
  }
  return url.toString();
}

export async function testWebhook(workflowId: string): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_V1_URL}/integrations/webhook-test`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workflow_id: workflowId,
      target: "docflow-webhook-test",
      payload: {
        source: "workspace",
        simulation: true,
      },
    }),
  });

  return parseJsonResponse<Record<string, unknown>>(response, "Could not test webhook");
}
