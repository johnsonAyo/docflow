import { API_V1_URL, parseJsonResponse, queryString } from "@/lib/apiClient";
import { DocumentRun, DocumentUploadResponse } from "@/types";

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

export async function updateDocumentRun(
  runId: string,
  payload: Partial<Pick<DocumentRun, "status" | "artifacts" | "error" | "metadata" | "document_name" | "document_type">>,
): Promise<DocumentRun> {
  const response = await fetch(`${API_V1_URL}/document-runs/${runId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<DocumentRun>(response, "Could not update document run");
}

export async function retryDocumentRun(runId: string): Promise<DocumentUploadResponse> {
  const response = await fetch(`${API_V1_URL}/document-runs/${runId}/retry`, {
    method: "POST",
  });
  return parseJsonResponse<DocumentUploadResponse>(response, "Could not retry document run");
}

export async function deleteDocumentRun(runId: string): Promise<void> {
  const response = await fetch(`${API_V1_URL}/document-runs/${runId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Could not delete document run");
  }
}

export async function getDocumentArtifact(objectKey: string): Promise<string> {
  const response = await fetch(`${API_V1_URL}/documents/artifacts/${objectKey}`);
  if (!response.ok) {
    throw new Error("Could not load document artifact");
  }
  return response.text();
}
