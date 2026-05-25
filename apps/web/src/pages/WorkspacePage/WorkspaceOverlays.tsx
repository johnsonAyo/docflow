import { AddFieldModal, AppToast } from "@/components/WorkspaceComponents";
import { ReviewItemModal } from "@/components/WorkspaceComponents/ReviewItemModal";
import { WorkspaceModel } from "@/pages/WorkspacePage/types";

export function WorkspaceOverlays({ workspace }: { workspace: WorkspaceModel }) {
  const { actions, modals, sections, toast } = workspace;
  const reviewInspection = modals.review.inspection;

  return (
    <>
      {modals.addField.isOpen ? (
        <AddFieldModal onClose={modals.addField.close} onSubmit={modals.addField.submit} />
      ) : null}

      {modals.review.isOpen && reviewInspection ? (
        <ReviewItemModal
          inspection={reviewInspection}
          isApproving={sections.isApprovingReview}
          onApprove={() => actions.approveReviewItem(reviewInspection.id)}
          onClose={modals.review.close}
        />
      ) : null}

      {toast.message ? (
        <AppToast message={toast.message.message} type={toast.message.type} onClose={toast.dismiss} />
      ) : null}
    </>
  );
}
