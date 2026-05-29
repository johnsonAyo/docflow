import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { DocumentRun } from "@/types";
import { workspaceSectionContent } from "./labels";
import { DocumentUploadPanel } from "@/components/WorkspaceComponents/DocumentUploadPanel";
import { WorkspaceSectionActions } from "@/components/WorkspaceComponents/WorkspaceSectionActions";
import { EmptyWorkspaceState, WorkspaceItems } from "@/components/WorkspaceComponents/WorkspaceItems";
import { WorkspaceSectionViewProps } from "@/components/WorkspaceComponents/WorkspaceSectionView/workspaceSectionTypes";

export function WorkspaceSectionView(props: WorkspaceSectionViewProps) {
  const content = workspaceSectionContent[props.title];
  const [hasSelectedFiles, setHasSelectedFiles] = useState(false);

  return (
    <section className="workspace-section-page" aria-labelledby="workspace-section-title">
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
      {props.title === "Review queue" ? <StateMessage state={props.reviewActionState} /> : null}
      {props.title === "Integrations" ? <StateMessage state={props.deliveryState} /> : null}
      
      {(props.title === "Review queue" || props.title === "Process documents") && (
        <ActiveProcessingQueue
          documentRuns={props.documentRuns}
          savedWorkflows={props.savedWorkflows}
        />
      )}

      <div className="workspace-item-list">
        {props.title === "Process documents" ? (
          <DocumentUploadPanel
            queue={props.queue}
            runWorkflowId={props.runWorkflowId}
            savedWorkflows={props.savedWorkflows}
            setRunWorkflowId={props.setRunWorkflowId}
            onUploadDocument={props.onUploadDocument}
            onSelectedFilesChange={setHasSelectedFiles}
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

type ActiveProcessingQueueProps = {
  documentRuns: DocumentRun[];
  savedWorkflows: any[];
};

const STUCK_JOB_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

function ActiveProcessingQueue({ documentRuns, savedWorkflows }: ActiveProcessingQueueProps) {
  const activeRuns = documentRuns.filter((run) => {
    if (run.status !== "uploaded" && run.status !== "processing") return false;
    const ageMs = Date.now() - new Date(run.created_at).getTime();
    return ageMs < STUCK_JOB_TIMEOUT_MS;
  });

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
  const statusMsg = processingMeta?.message || (run.status === "uploaded" ? "Waiting for OCR worker..." : "OCR and field extraction in progress...");

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
