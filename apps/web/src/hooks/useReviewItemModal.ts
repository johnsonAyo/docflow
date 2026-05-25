import { useMemo, useState, useCallback } from "react";
import { buildReviewInspection } from "@/lib/reviewItemInspection";
import { DocumentRun, ExtractedRecord, ReviewState, WorkflowDefinition } from "@/types";

type ReviewItemModalOptions = {
  documentRuns: DocumentRun[];
  records: ExtractedRecord[];
  reviewStates: ReviewState[];
  savedWorkflows: WorkflowDefinition[];
};

export function useReviewItemModal({ documentRuns, records, reviewStates, savedWorkflows }: ReviewItemModalOptions) {
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const reviewInspection = useMemo(() => {
    if (!selectedReviewId) return null;
    return buildReviewInspection(selectedReviewId, reviewStates, records, documentRuns, savedWorkflows);
  }, [documentRuns, records, reviewStates, savedWorkflows, selectedReviewId]);

  const openReviewItem = useCallback((reviewId: string) => {
    if (reviewStates.some((item) => item.id === reviewId)) {
      setSelectedReviewId(reviewId);
    }
  }, [reviewStates]);

  const closeReviewItem = useCallback(() => setSelectedReviewId(null), []);

  return {
    closeReviewItem,
    openReviewItem,
    reviewInspection,
    isOpen: selectedReviewId !== null && reviewInspection !== null,
  };
}
