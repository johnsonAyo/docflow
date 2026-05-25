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
