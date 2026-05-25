export type HealthResponse = {
  ok: boolean;
  service: string;
  database: string;
  database_exists: boolean;
};

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
export const API_V1_URL = `${API_URL}/api/v1`;

export function queryString(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function parseJsonResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
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
