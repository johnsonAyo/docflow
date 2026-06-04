import { useState, useEffect } from "react";
import { CircleAlert, CircleCheckBig, Eye, Loader2 } from "lucide-react";
import { isRecentlyActiveRun } from "@/lib/documentRunStatus";
import { DocumentRun, ReviewState, WorkflowSaveState } from "@/types";
import { workspaceSectionContent } from "./labels";
import { DocumentUploadPanel } from "@/components/WorkspaceComponents/DocumentUploadPanel";
import { WorkspaceSectionActions } from "@/components/WorkspaceComponents/WorkspaceSectionActions";
import { EmptyWorkspaceState, WorkspaceItems } from "@/components/WorkspaceComponents/WorkspaceItems";
import { WorkspaceSectionViewProps } from "@/components/WorkspaceComponents/WorkspaceSectionView/workspaceSectionTypes";

export function WorkspaceSectionView(props: WorkspaceSectionViewProps) {
  const content = workspaceSectionContent[props.title];
  const [hasSelectedFiles, setHasSelectedFiles] = useState(false);
  const isBusy = props.isUploadingDocument;

  return (
    <section className={`workspace-section-page${isBusy ? " is-busy" : ""}`} data-section={props.title} aria-labelledby="workspace-section-title">
      <div className="workspace-section-header">
        <div>
          <p className="app-kicker">{content.kicker}</p>
          <h2 id="workspace-section-title">{content.title}</h2>
          <p>{content.description}</p>
        </div>
        <WorkspaceSectionActions
          isTestingWebhook={props.isTestingWebhook}
          onExportRecords={props.onExportRecords}
          onTestWebhook={props.onTestWebhook}
          title={props.title}
        />
      </div>
      {props.title === "Review queue" && props.reviewActionState.message ? <StateMessage state={props.reviewActionState} /> : null}
      {props.title === "Integrations" && props.deliveryState.message ? <StateMessage state={props.deliveryState} /> : null}
      {props.title === "Process documents" && isBusy ? (
        <UploadBusyBanner message={props.uploadState.message || "Upload in progress. We’re sending the file, then OCR and extraction will continue automatically."} />
      ) : null}
      {props.title === "Process documents" ? (
        <UploadRunFeedback
          documentRuns={props.documentRuns}
          isUploadingDocument={props.isUploadingDocument}
          lastUploadedRun={props.lastUploadedRun}
          reviewStates={props.reviewStates}
          uploadState={props.uploadState}
          onOpenRun={props.onOpenRun}
        />
      ) : null}
      
      {(props.title === "Review queue" || props.title === "Process documents") && (
        <ActiveProcessingQueue
          documentRuns={props.documentRuns}
          savedWorkflows={props.savedWorkflows}
        />
      )}

      <div className="workspace-item-list">
        {props.title === "Process documents" ? (
          <DocumentUploadPanel
            runWorkflowId={props.runWorkflowId}
            savedWorkflows={props.savedWorkflows}
            setRunWorkflowId={props.setRunWorkflowId}
            onUploadDocument={props.onUploadDocument}
            onSelectedFilesChange={setHasSelectedFiles}
            isUploadingDocument={props.isUploadingDocument}
            uploadState={props.uploadState}
          />
        ) : null}
        {props.title === "Integrations" ? (
          <div className="coming-soon-integrations">
            <div className="integration-card coming-soon">
              <div className="integration-header">
                <h4>Webhook delivery</h4>
                <span className="badge-soon">Coming Soon</span>
              </div>
              <p>Automatically push verified document fields to your webhook endpoint after approval.</p>
            </div>
            <div className="integration-card coming-soon">
              <div className="integration-header">
                <h4>Email inbox ingestion</h4>
                <span className="badge-soon">Coming Soon</span>
              </div>
              <p>Forward incoming invoices or contracts to a dedicated inbox address to auto-start processing.</p>
            </div>
            <div className="integration-card coming-soon">
              <div className="integration-header">
                <h4>REST API access</h4>
                <span className="badge-soon">Coming Soon</span>
              </div>
              <p>Integrate DocFlow into your existing systems and ingest documents programmatically.</p>
            </div>
          </div>
        ) : (
          <>
            {props.items.length === 0 && !hasSelectedFiles ? <EmptyWorkspaceState title={props.title} /> : null}
            <WorkspaceItems
              items={props.items}
              onOpenReviewItem={props.onOpenReviewItem}
              onOpenRun={props.onOpenRun}
              onDeleteItem={props.onDeleteItem}
              title={props.title}
            />
          </>
        )}
      </div>
    </section>
  );
}

type UploadRunFeedbackProps = {
  documentRuns: DocumentRun[];
  isUploadingDocument: boolean;
  lastUploadedRun: DocumentRun | null;
  reviewStates: ReviewState[];
  uploadState: WorkflowSaveState;
  onOpenRun?: (runId: string) => void;
};

function UploadRunFeedback({
  documentRuns,
  isUploadingDocument,
  lastUploadedRun,
  reviewStates,
  uploadState,
  onOpenRun,
}: UploadRunFeedbackProps) {
  const liveRun = lastUploadedRun
    ? documentRuns.find((run) => run.id === lastUploadedRun.id) || lastUploadedRun
    : null;

  if (!isUploadingDocument && !liveRun && uploadState.status !== "saving" && uploadState.status !== "saved" && uploadState.status !== "error") {
    return null;
  }

  const openReview = liveRun
    ? reviewStates.find((review) => review.document_run_id === liveRun.id && review.status === "open") ?? null
    : null;
  const feedback = uploadFeedbackCopy({
    isUploadingDocument,
    run: liveRun,
    review: openReview,
    uploadState,
  });

  return (
    <div className={`upload-run-feedback tone-${feedback.tone}`} role="status" aria-live="polite">
      <div className="upload-run-feedback-icon">
        {feedback.tone === "green" ? (
          <CircleCheckBig size={18} aria-hidden="true" />
        ) : feedback.tone === "yellow" || feedback.tone === "red" ? (
          <CircleAlert size={18} aria-hidden="true" />
        ) : (
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        )}
      </div>
      <div>
        <span>{feedback.kicker}</span>
        <strong>{feedback.title}</strong>
        <p>{feedback.message}</p>
      </div>
      {liveRun && feedback.actionLabel ? (
        <button className="app-secondary-action compact" type="button" onClick={() => onOpenRun?.(liveRun.id)}>
          <Eye size={15} aria-hidden="true" />
          {feedback.actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function uploadFeedbackCopy({
  isUploadingDocument,
  run,
  review,
  uploadState,
}: {
  isUploadingDocument: boolean;
  run: DocumentRun | null;
  review: ReviewState | null;
  uploadState: WorkflowSaveState;
}) {
  if (uploadState.status === "error") {
    return {
      actionLabel: run ? "Open run" : "",
      kicker: "Upload failed",
      message: uploadState.message || "The document could not be uploaded. Please try again.",
      title: "Something blocked the upload.",
      tone: "red",
    };
  }

  if (isUploadingDocument || uploadState.status === "saving") {
    return {
      actionLabel: "",
      kicker: "Uploading",
      message: uploadState.message || "We are sending the file and creating a processing run.",
      title: "Your document is being uploaded.",
      tone: "blue",
    };
  }

  if (!run) {
    return {
      actionLabel: "",
      kicker: "Preparing",
      message: uploadState.message || "The upload completed. Waiting for the run status to refresh.",
      title: "Processing run is being prepared.",
      tone: "blue",
    };
  }

  const processing = run.metadata?.processing as { message?: string; stage?: string } | undefined;
  if (run.status === "needs_review") {
    return {
      actionLabel: review ? "Open review" : "Open run",
      kicker: "Review ready",
      message: review
        ? `${review.issues.length} issue${review.issues.length === 1 ? "" : "s"} need your confirmation before this record is approved.`
        : "The run needs review. Open it to inspect the extracted data and issues.",
      title: `${run.document_name} is ready for review.`,
      tone: "yellow",
    };
  }

  if (run.status === "approved") {
    return {
      actionLabel: "View result",
      kicker: "Completed",
      message: "The document has been approved and the extracted record is available.",
      title: `${run.document_name} has finished processing.`,
      tone: "green",
    };
  }

  if (run.status === "failed") {
    return {
      actionLabel: "Open run",
      kicker: "Failed",
      message: run.error || "Processing failed. Open the run to inspect or retry.",
      title: `${run.document_name} could not be processed.`,
      tone: "red",
    };
  }

  return {
    actionLabel: "Open run",
    kicker: run.status === "uploaded" ? "Starting" : "Processing",
    message: processing?.message || "OCR and field extraction are running now.",
    title: `${run.document_name} is being processed.`,
    tone: "blue",
  };
}

function UploadBusyBanner({ message }: { message: string }) {
  return (
    <div className="upload-busy-banner" role="status" aria-live="polite">
      <Loader2 size={16} className="animate-spin" />
      <div>
        <strong>Upload in progress</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}

type ActiveProcessingQueueProps = {
  documentRuns: DocumentRun[];
  savedWorkflows: any[];
};

function ActiveProcessingQueue({ documentRuns, savedWorkflows }: ActiveProcessingQueueProps) {
  const activeRuns = documentRuns.filter(isRecentlyActiveRun);

  if (activeRuns.length === 0) return null;

  return (
    <div className="active-processing-queue">
      <h3>
        <Loader2 size={16} className="animate-spin text-blue-500" />
        Active Processing ({activeRuns.length})
      </h3>
      <div className="processing-jobs-list">
        {activeRuns.map((run) => (
          <ActiveJobCard key={run.id} run={run} savedWorkflows={savedWorkflows} />
        ))}
      </div>
    </div>
  );
}

function ActiveJobCard({ run, savedWorkflows }: { run: DocumentRun; savedWorkflows: any[] }) {
  const [progress, setProgress] = useState(10);
  const [timeLeft, setTimeLeft] = useState(12);

  useEffect(() => {
    const calculateProgress = () => {
      const createdTime = new Date(run.created_at).getTime();
      const elapsedMs = Date.now() - createdTime;
      const elapsedSec = Math.max(0, elapsedMs / 1000);
      const totalEstimatedSec = 12;

      if (run.status === "uploaded") {
        const pct = Math.min(25, Math.round((elapsedSec / totalEstimatedSec) * 100));
        setProgress(pct);
        setTimeLeft(Math.max(1, Math.round(totalEstimatedSec - elapsedSec)));
      } else {
        const percent = 25 + (elapsedSec / totalEstimatedSec) * 70;
        setProgress(Math.min(95, Math.round(percent)));
        setTimeLeft(Math.max(1, Math.round(totalEstimatedSec - elapsedSec)));
      }
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 1000);
    return () => clearInterval(interval);
  }, [run.created_at, run.status]);

  const workflowName = savedWorkflows.find((w) => w.id === run.workflow_id)?.name || "Workflow";
  const processingMeta = run.metadata?.processing as Record<string, any> | undefined;
  const statusMsg = processingMeta?.message || (run.status === "uploaded" ? "Preparing OCR..." : "OCR and field extraction in progress...");

  return (
    <div className="processing-job-card">
      <div className="job-card-header">
        <div className="job-card-title-sec">
          <strong>{run.document_name}</strong>
          <span>{run.document_type} · {workflowName}</span>
        </div>
        <div className="job-card-status-sec">
          <span>{progress}%</span>
          <span>{timeLeft > 1 ? `Estimated wait: ~${timeLeft}s` : "Finishing up..."}</span>
        </div>
      </div>
      <div className="job-progress-wrapper">
        <div className="job-progress-track">
          <div className="job-progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <div className="job-message">
        <Loader2 size={14} className="animate-spin text-blue-500" style={{ flexShrink: 0 }} />
        <span>{statusMsg}</span>
      </div>
    </div>
  );
}

function StateMessage({ state }: { state: { status: string; message: string } }) {
  return <p className="delivery-state-message" data-save-state={state.status}>{state.message}</p>;
}

export default WorkspaceSectionView;
