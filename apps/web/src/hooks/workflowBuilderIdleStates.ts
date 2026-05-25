import { WorkflowSaveState } from "@/types";

export const idleUploadState: WorkflowSaveState = {
  status: "idle",
  message: "Ready to upload documents.",
};

export const idleDeliveryState: WorkflowSaveState = {
  status: "idle",
  message: "Delivery actions are ready when records exist.",
};

export const idleReviewState: WorkflowSaveState = {
  status: "idle",
  message: "Review actions are ready when review items exist.",
};
