import { API_V1_URL, parseJsonResponse, queryString } from "@/lib/apiClient";
import { ExtractedRecord, ReviewState } from "@/types";

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

export async function deleteRecord(recordId: string): Promise<void> {
  const response = await fetch(`${API_V1_URL}/records/${recordId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Could not delete record");
  }
}

export async function deleteReviewState(reviewStateId: string): Promise<void> {
  const response = await fetch(`${API_V1_URL}/review-states/${reviewStateId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Could not delete review state");
  }
}
