import { API_URL, parseJsonResponse, HealthResponse } from "@/lib/apiClient";

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/health`);
  return parseJsonResponse<HealthResponse>(response, "Could not load system health");
}
