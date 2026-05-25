import { type FormEvent } from "react";
import {
  AppSection,
  WorkflowDefinition,
  WorkflowSaveState,
  WorkspaceItem,
} from "@/types";
import { type UploadJob } from "@/hooks/useUploadQueue";

export type WorkspaceSectionTitle = Exclude<AppSection, "Workflows">;

export type WorkspaceSectionViewProps = {
  title: WorkspaceSectionTitle;
  savedWorkflows: WorkflowDefinition[];
  uploadState: WorkflowSaveState;
  deliveryState: WorkflowSaveState;
  reviewActionState: WorkflowSaveState;
  items: WorkspaceItem[];
  queue: {
    jobs: UploadJob[];
    queueFiles: (files: File[], workflowId: string, documentType: string) => void;
    removeJob: (id: string) => void;
    clearCompleted: () => void;
  };
  isUploadingDocument: boolean;
  isTestingWebhook: boolean;
  isApprovingReview: boolean;
  runWorkflowId: string;
  setRunWorkflowId: (id: string) => void;
  onUploadDocument: (event: FormEvent<HTMLFormElement>) => void;
  onExportRecords: () => void;
  onTestWebhook: () => void;
  onOpenReviewItem: (reviewId: string) => void;
};
