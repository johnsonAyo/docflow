import { type FormEvent } from "react";
import {
  AppSection,
  WorkflowDefinition,
  WorkflowSaveState,
  WorkspaceItem,
} from "@/types";

export type WorkspaceSectionTitle = Exclude<AppSection, "Workflows">;

export type WorkspaceSectionViewProps = {
  title: WorkspaceSectionTitle;
  savedWorkflows: WorkflowDefinition[];
  uploadState: WorkflowSaveState;
  deliveryState: WorkflowSaveState;
  reviewActionState: WorkflowSaveState;
  items: WorkspaceItem[];
  isUploadingDocument: boolean;
  isTestingWebhook: boolean;
  isApprovingReview: boolean;
  runWorkflowId: string;
  setRunWorkflowId: (id: string) => void;
  onUploadDocument: (event: FormEvent<HTMLFormElement>) => void;
  onExportRecords: () => void;
  onTestWebhook: () => void;
  onApproveNextReview: () => void;
};
