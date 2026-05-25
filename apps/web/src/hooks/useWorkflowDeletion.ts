import { type Dispatch, type SetStateAction } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWorkflow } from "@/api";
import { WorkflowSaveState } from "@/types";
import { ToastMessage } from "@/hooks/workflowMutationTypes";
import { showStateError } from "@/hooks/workflowMutationHelpers";

type WorkflowDeletionOptions = {
  activeWorkflowId: string | null;
  setActiveWorkflowId: Dispatch<SetStateAction<string | null>>;
  setSaveState: Dispatch<SetStateAction<WorkflowSaveState>>;
  setToastMessage: Dispatch<SetStateAction<ToastMessage>>;
};

export function useWorkflowDeletion({
  activeWorkflowId,
  setActiveWorkflowId,
  setSaveState,
  setToastMessage,
}: WorkflowDeletionOptions) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteWorkflow,
    onSuccess: (_result, workflowId) => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      if (activeWorkflowId === workflowId) setActiveWorkflowId(null);
      setSaveState({ status: "idle", message: "Workflow deleted." });
      setToastMessage({ message: "Workflow deleted.", type: "success" });
    },
    onError: (error: unknown) => {
      showStateError(error, "Could not delete workflow.", setSaveState, setToastMessage);
    },
  });

  return { deleteWorkflow: mutation.mutate, isDeletingWorkflow: mutation.isPending };
}
