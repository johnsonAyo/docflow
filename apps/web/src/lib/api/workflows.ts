import { API_V1_URL, parseJsonResponse } from "@/lib/apiClient";
import { WorkflowDefinition, WorkflowPayload } from "@/types";

export async function listWorkflows(): Promise<WorkflowDefinition[]> {
  const response = await fetch(`${API_V1_URL}/workflows`);
  return parseJsonResponse<WorkflowDefinition[]>(response, "Could not load workflows");
}

export async function createWorkflow(payload: WorkflowPayload): Promise<WorkflowDefinition> {
  const response = await fetch(`${API_V1_URL}/workflows`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<WorkflowDefinition>(response, "Could not create workflow");
}

export async function updateWorkflow(
  workflowId: string,
  payload: Partial<WorkflowPayload>,
): Promise<WorkflowDefinition> {
  const response = await fetch(`${API_V1_URL}/workflows/${workflowId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<WorkflowDefinition>(response, "Could not update workflow");
}

export async function deleteWorkflow(workflowId: string): Promise<void> {
  const response = await fetch(`${API_V1_URL}/workflows/${workflowId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    await parseJsonResponse(response, "Could not delete workflow");
  }
}
