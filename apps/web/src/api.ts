import {
  DocumentRun,
  DocumentUploadResponse,
  ExtractedRecord,
  ReviewState,
  WorkflowDefinition,
  WorkflowPayload,
} from "@/types";

export type HealthResponse = {
  ok: boolean;
  service: string;
  database: string;
  database_exists: boolean;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const API_V1_URL = `${API_URL}/api/v1`;

function queryString(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  let detail = fallbackMessage;
  try {
    const body = await response.json() as { detail?: string };
    detail = body.detail || detail;
    if (response.status === 404 && detail === "Not Found") {
      detail = "The backend API endpoint is not available yet. Please wait a minute for deployment to finish.";
    }
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

export async function listDocumentRuns(workflowId?: string): Promise<DocumentRun[]> {
  const response = await fetch(`${API_V1_URL}/document-runs${queryString({ workflow_id: workflowId })}`);
  return parseJsonResponse<DocumentRun[]>(response, "Could not load document runs");
}

export async function listRecords(workflowId?: string): Promise<ExtractedRecord[]> {
  const response = await fetch(`${API_V1_URL}/records${queryString({ workflow_id: workflowId })}`);
  return parseJsonResponse<ExtractedRecord[]>(response, "Could not load records");
}

export async function listReviewStates(workflowId?: string): Promise<ReviewState[]> {
  const response = await fetch(`${API_V1_URL}/review-states${queryString({ workflow_id: workflowId })}`);
  return parseJsonResponse<ReviewState[]>(response, "Could not load review states");
}

export async function updateRecord(
  recordId: string,
  payload: Partial<Pick<ExtractedRecord, "status" | "fields" | "confidence" | "evidence_refs" | "metadata">>,
): Promise<ExtractedRecord> {
  const response = await fetch(`${API_V1_URL}/records/${recordId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<ExtractedRecord>(response, "Could not update record");
}

export async function updateReviewState(
  reviewStateId: string,
  payload: Partial<Pick<ReviewState, "status" | "issues" | "assigned_to" | "decisions">>,
): Promise<ReviewState> {
  const response = await fetch(`${API_V1_URL}/review-states/${reviewStateId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<ReviewState>(response, "Could not update review state");
}

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
