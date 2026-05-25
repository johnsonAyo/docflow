import { useQuery } from "@tanstack/react-query";
import { listDocumentRuns, listRecords, listReviewStates, listWorkflows } from "@/api";

export function useWorkflowData() {
  const { data: savedWorkflows = [] } = useQuery({
    queryKey: ["workflows"],
    queryFn: listWorkflows,
  });

  const { data: documentRuns = [] } = useQuery({
    queryKey: ["documentRuns"],
    queryFn: () => listDocumentRuns(),
  });

  const { data: records = [] } = useQuery({
    queryKey: ["records"],
    queryFn: () => listRecords(),
  });

  const { data: reviewStates = [] } = useQuery({
    queryKey: ["reviewStates"],
    queryFn: () => listReviewStates(),
  });

  return {
    savedWorkflows,
    documentRuns,
    records,
    reviewStates,
  };
}
