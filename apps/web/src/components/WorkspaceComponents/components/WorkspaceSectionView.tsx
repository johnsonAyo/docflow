import { workspaceSectionContent } from "@/components/WorkspaceComponents/labels";
import { DocumentUploadPanel } from "@/components/WorkspaceComponents/components/DocumentUploadPanel";
import { WorkspaceSectionActions } from "@/components/WorkspaceComponents/components/WorkspaceSectionActions";
import { EmptyWorkspaceState, WorkspaceItems } from "@/components/WorkspaceComponents/components/WorkspaceItems";
import { WorkspaceSectionViewProps } from "@/components/WorkspaceComponents/components/workspaceSectionTypes";

export function WorkspaceSectionView(props: WorkspaceSectionViewProps) {
  const content = workspaceSectionContent[props.title];

  return (
    <section className="workspace-section-page" aria-labelledby="workspace-section-title">
      <div className="workspace-section-header">
        <div>
          <p className="app-kicker">{content.kicker}</p>
          <h2 id="workspace-section-title">{content.title}</h2>
          <p>{content.description}</p>
        </div>
        <WorkspaceSectionActions
          isApprovingReview={props.isApprovingReview}
          isTestingWebhook={props.isTestingWebhook}
          onApproveNextReview={props.onApproveNextReview}
          onExportRecords={props.onExportRecords}
          onTestWebhook={props.onTestWebhook}
          title={props.title}
        />
      </div>
      {props.title === "Review queue" ? <StateMessage state={props.reviewActionState} /> : null}
      {props.title === "Integrations" ? <StateMessage state={props.deliveryState} /> : null}
      <div className="workspace-item-list">
        {props.title === "Runs" ? (
          <DocumentUploadPanel
            isUploadingDocument={props.isUploadingDocument}
            onUploadDocument={props.onUploadDocument}
            runWorkflowId={props.runWorkflowId}
            savedWorkflows={props.savedWorkflows}
            setRunWorkflowId={props.setRunWorkflowId}
            uploadState={props.uploadState}
          />
        ) : null}
        {props.items.length === 0 ? <EmptyWorkspaceState title={props.title} /> : null}
        <WorkspaceItems items={props.items} title={props.title} />
      </div>
    </section>
  );
}

function StateMessage({ state }: { state: { status: string; message: string } }) {
  return <p className="delivery-state-message" data-save-state={state.status}>{state.message}</p>;
}

export default WorkspaceSectionView;
