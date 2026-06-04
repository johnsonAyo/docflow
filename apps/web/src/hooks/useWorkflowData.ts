import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { listDocumentRuns, listRecords, listReviewStates, listWorkflows } from "@/api";
import { isRecentlyActiveRun } from "@/lib/documentRunStatus";
import { DocumentRun } from "@/types";

function terminalRunSignature(runs: DocumentRun[]) {
  return runs
    .filter((run) => run.status === "needs_review" || run.status === "approved" || run.status === "failed")
    .map((run) => `${run.id}:${run.status}:${run.updated_at}`)
    .sort()
    .join("|");
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
      const runs = query.state.data as DocumentRun[] | undefined;
      const hasActive = runs?.some(isRecentlyActiveRun);
      return hasActive ? 4000 : false;
    }
  });

  const terminalSignature = useMemo(() => terminalRunSignature(documentRuns), [documentRuns]);
  const previousTerminalSignature = useRef(terminalSignature);

  const { data: records = [], refetch: refetchRecords } = useQuery({
    queryKey: ["records"],
    queryFn: () => listRecords(),
  });

  const { data: reviewStates = [], refetch: refetchReviewStates } = useQuery({
    queryKey: ["reviewStates"],
    queryFn: () => listReviewStates(),
  });

  useEffect(() => {
    if (previousTerminalSignature.current === terminalSignature) return;
    previousTerminalSignature.current = terminalSignature;
    void refetchRecords();
    void refetchReviewStates();
  }, [refetchRecords, refetchReviewStates, terminalSignature]);

  return {
    savedWorkflows,
    documentRuns,
    records,
    reviewStates,
  };
}
