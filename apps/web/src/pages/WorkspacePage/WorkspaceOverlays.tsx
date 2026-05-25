import { AddFieldModal, AppToast } from "@/components/WorkspaceComponents";
import { WorkspaceModel } from "@/pages/WorkspacePage/types";

export function WorkspaceOverlays({ workspace }: { workspace: WorkspaceModel }) {
  const { modals, toast } = workspace;

  return (
    <>
      {modals.addField.isOpen ? (
        <AddFieldModal onClose={modals.addField.close} onSubmit={modals.addField.submit} />
      ) : null}

      {toast.message ? (
        <AppToast message={toast.message.message} type={toast.message.type} onClose={toast.dismiss} />
      ) : null}
    </>
  );
}
