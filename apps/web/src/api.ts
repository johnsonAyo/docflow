import { DemoRunResponse, DocumentUploadResponse, WorkflowDefinition, WorkflowPayload } from "@/types";

export type HealthResponse = {
  ok: boolean;
  service: string;
  database: string;
  database_exists: boolean;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const API_V1_URL = `${API_URL}/api/v1`;

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  let detail = fallbackMessage;
  try {
    const body = await response.json() as { detail?: string };
    detail = body.detail || detail;
  } catch {
    detail = `${fallbackMessage} (${response.status})`;
  }

  throw new Error(detail);
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error(`Health check failed with ${response.status}`);
  }

  return response.json() as Promise<HealthResponse>;
}

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


export async function uploadDocument(formData: FormData): Promise<DocumentUploadResponse> {
  const response = await fetch(`${API_V1_URL}/documents/uploads`, {
    method: "POST",
    body: formData,
  });

  return parseJsonResponse<DocumentUploadResponse>(response, "Could not upload document");
}

export async function runDemo(): Promise<DemoRunResponse> {
  const response = await fetch(`${API_V1_URL}/demo/run`, {
    method: "POST",
  });

  return parseJsonResponse<DemoRunResponse>(response, "Could not run demo mode");
}
