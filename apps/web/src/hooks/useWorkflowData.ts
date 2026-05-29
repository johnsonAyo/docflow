import { useQuery } from "@tanstack/react-query";
import { listDocumentRuns, listRecords, listReviewStates, listWorkflows } from "@/api";

const STUCK_JOB_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

function isRunRecentlyActive(run: any) {
  if (run.status !== "uploaded" && run.status !== "processing") return false;
  const ageMs = Date.now() - new Date(run.created_at).getTime();
  return ageMs < STUCK_JOB_TIMEOUT_MS;
}

export function useWorkflowData() {
  const { data: savedWorkflows = [] } = useQuery({
    queryKey: ["workflows"],
    queryFn: listWorkflows,
  });

  const { data: documentRuns = [] } = useQuery({
    queryKey: ["documentRuns"],
    queryFn: () => listDocumentRuns(),
    refetchInterval: (query) => {
      const runs = query.state.data as any[];
      const hasActive = runs?.some(isRunRecentlyActive);
      return hasActive ? 2000 : false;
    }
  });

  const hasActiveRuns = documentRuns.some(isRunRecentlyActive);

  const { data: records = [] } = useQuery({
    queryKey: ["records"],
    queryFn: () => listRecords(),
    refetchInterval: hasActiveRuns ? 2000 : false,
  });

  const { data: reviewStates = [] } = useQuery({
    queryKey: ["reviewStates"],
    queryFn: () => listReviewStates(),
    refetchInterval: hasActiveRuns ? 2000 : false,
  });

  return {
    savedWorkflows,
    documentRuns,
    records,
    reviewStates,
  };
}

