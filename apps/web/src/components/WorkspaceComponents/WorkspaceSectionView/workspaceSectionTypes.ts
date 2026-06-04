import { type FormEvent } from "react";
import {
  AppSection,
  DocumentRun,
  ReviewState,
  WorkflowDefinition,
  WorkflowSaveState,
  WorkspaceItem,
} from "@/types";

export type WorkspaceSectionTitle = Exclude<AppSection, "Workflows">;

export type WorkspaceSectionViewProps = {
  title: WorkspaceSectionTitle;
  savedWorkflows: WorkflowDefinition[];
  documentRuns: DocumentRun[];
  reviewStates: ReviewState[];
  lastUploadedRun: DocumentRun | null;
  uploadState: WorkflowSaveState;
  deliveryState: WorkflowSaveState;
  reviewActionState: WorkflowSaveState;
  items: WorkspaceItem[];
  isUploadingDocument: boolean;
  isTestingWebhook: boolean;
  isApprovingReview: boolean;
  runWorkflowId: string;
  setRunWorkflowId: (id: string) => void;
  onUploadDocument: (eventOrData: any) => void;
  onExportRecords: () => void;
  onTestWebhook: () => void;
  onOpenReviewItem: (reviewId: string) => void;
  onOpenRun?: (runId: string) => void;
  onDeleteItem?: (itemId: string) => void;
};
