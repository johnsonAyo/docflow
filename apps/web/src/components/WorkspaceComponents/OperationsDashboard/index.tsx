import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  CircleAlert,
  CircleCheckBig,
  Clock3,
  Database,
  Loader2,
  ShieldAlert,
  Workflow,
} from "lucide-react";
import { getHealth } from "@/api";
import { isRecentlyActiveRun, isStalledRun } from "@/lib/documentRunStatus";
import { DocumentRun, ExtractedRecord, ReviewState, WorkflowDefinition } from "@/types";

type OperationsDashboardProps = {
  savedWorkflows: WorkflowDefinition[];
  documentRuns: DocumentRun[];
  records: ExtractedRecord[];
  reviewStates: ReviewState[];
};

export function OperationsDashboard({
  savedWorkflows,
  documentRuns,
  records,
  reviewStates,
}: OperationsDashboardProps) {
  const { data: health, isLoading } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    refetchInterval: 30000,
  });

  const metrics = useMemo(() => {
    const activeRuns = documentRuns.filter(isRecentlyActiveRun);
    const stalledRuns = documentRuns.filter(isStalledRun);
    const openReviews = reviewStates.filter((review) => review.status === "open");
    const approvedRecords = records.filter((record) => record.status === "approved" || record.status === "exported");
    const failedRuns = documentRuns.filter((run) => run.status === "failed");
    const failedOrStalledRuns = failedRuns.length + stalledRuns.length;

    return [
      {
        label: "Live queue",
        value: String(activeRuns.length),
        detail: activeRuns.length > 0 ? `${activeRuns.length} documents moving through OCR and extraction.` : "No documents currently in flight.",
        Icon: Clock3,
        tone: activeRuns.length > 0 ? "blue" : "neutral",
      },
      {
        label: "Needs review",
        value: String(openReviews.length),
        detail: openReviews.length > 0 ? "Exceptions are waiting for human review." : "No open review items.",
        Icon: CircleAlert,
        tone: openReviews.length > 0 ? "yellow" : "neutral",
      },
      {
        label: "Approved records",
        value: String(approvedRecords.length),
        detail: "Verified records are ready for downstream delivery.",
        Icon: CircleCheckBig,
        tone: "green",
      },
      {
        label: "Failed/stalled runs",
        value: String(failedOrStalledRuns),
        detail: failedOrStalledRuns > 0 ? "These runs need attention or a retry." : "No failed or stalled runs detected.",
        Icon: ShieldAlert,
        tone: failedOrStalledRuns > 0 ? "red" : "neutral",
      },
      {
        label: "Workflows",
        value: String(savedWorkflows.length),
        detail: savedWorkflows.length > 0 ? "Published workflows are ready to receive documents." : "Create a workflow to start processing.",
        Icon: Workflow,
        tone: "neutral",
      },
      {
        label: "OCR status",
        value: isLoading ? "…" : health?.ocr_dependencies?.status === "ok" ? "Healthy" : "Degraded",
        detail: isLoading
          ? "Checking OCR dependencies."
          : health?.ocr_dependencies?.warnings?.length
            ? health.ocr_dependencies.warnings[0]
            : `${health?.ocr_dependencies?.provider || "OCR"} is available.`,
        Icon: Database,
        tone: isLoading ? "neutral" : health?.ocr_dependencies?.status === "ok" ? "green" : "yellow",
      },
    ];
  }, [documentRuns, health, isLoading, records, reviewStates, savedWorkflows]);

  const recentEvents = useMemo(() => {
    const runEvents = documentRuns.slice(-4).map((run) => ({
      id: `run-${run.id}`,
      title: run.document_name,
      meta: `${run.document_type} · ${run.status.replace(/_/g, " ")}`,
      detail: String(
        run.error || ((run.metadata?.processing as { message?: string } | undefined)?.message) || "Run activity updated.",
      ),
      time: run.updated_at,
    }));
    const reviewEvents = reviewStates.slice(-3).map((review) => ({
      id: `review-${review.id}`,
      title: `Review ${review.status}`,
      meta: review.assigned_to || "Operations",
      detail: String(review.issues[0]?.message || `${review.issues.length} issue(s) tracked.`),
      time: review.updated_at,
    }));
    const recordEvents = records.slice(-3).map((record) => ({
      id: `record-${record.id}`,
      title: record.status,
      meta: `${record.workflow_id} · ${record.status}`,
      detail: String(record.fields[0]?.value || "Record captured."),
      time: record.updated_at,
    }));

    return [...runEvents, ...reviewEvents, ...recordEvents]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 6);
  }, [documentRuns, records, reviewStates]);

  const ocrWarnings = health?.ocr_dependencies.warnings ?? [];
  const startupWarnings = health?.startup_warnings ?? [];

  return (
    <section className="operations-dashboard" aria-labelledby="operations-dashboard-title">
      <div className="operations-dashboard-header">
        <div>
          <p className="app-kicker">Operations dashboard</p>
          <h2 id="operations-dashboard-title">Live processing, review, and health in one place</h2>
          <p>
            Monitor queue depth, OCR health, and review volume before documents get stuck in the pipeline.
          </p>
        </div>
        <div className="operations-dashboard-badges">
          <span data-status={health?.ocr_dependencies?.status ?? "unknown"}>
            OCR {health?.ocr_dependencies?.provider ?? "unknown"} · {health?.ocr_dependencies?.status ?? "unknown"}
          </span>
          <span>{documentRuns.length} runs tracked</span>
        </div>
      </div>

      <div className="operations-metrics-grid">
        {metrics.map((metric) => (
          <article className={`operations-metric-card tone-${metric.tone}`} key={metric.label}>
            <div className="operations-metric-icon">
              <metric.Icon size={16} aria-hidden="true" />
            </div>
            <div>
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
            </div>
            <span>{metric.detail}</span>
          </article>
        ))}
      </div>

      <div className="operations-dashboard-grid">
        <article className="operations-panel">
          <div className="operations-panel-header">
            <div>
              <p className="app-kicker">System status</p>
              <h3>Cloud readiness</h3>
            </div>
            <Activity size={16} aria-hidden="true" />
          </div>
          <ul className="operations-status-list">
            <li>
              <strong>Metadata store</strong>
              <span>{health?.metadata_store ?? "Loading..."}</span>
            </li>
            <li>
              <strong>Document store</strong>
              <span>{health?.document_store ?? "Loading..."}</span>
            </li>
            <li>
              <strong>Mongo database</strong>
              <span>{health?.mongodb_database ?? "Loading..."}</span>
            </li>
            <li>
              <strong>Bucket</strong>
              <span>{health?.document_bucket ?? "Loading..."}</span>
            </li>
          </ul>
          {startupWarnings.length > 0 || ocrWarnings.length > 0 ? (
            <div className="operations-warning">
              <strong>Attention needed</strong>
              <ul>
                {startupWarnings.slice(0, 2).map((warning) => <li key={warning}>{warning}</li>)}
                {ocrWarnings.slice(0, 2).map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
            </div>
          ) : (
            <div className="operations-ok">
              <strong>Everything looks ready</strong>
              <span>OCR binaries and backend storage dependencies are healthy.</span>
            </div>
          )}
        </article>

        <article className="operations-panel">
          <div className="operations-panel-header">
            <div>
              <p className="app-kicker">Recent activity</p>
              <h3>Latest document events</h3>
            </div>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          </div>
          <div className="operations-activity-list">
            {recentEvents.length === 0 ? (
              <div className="operations-empty">
                <strong>No activity yet</strong>
                <span>Upload a document to see live run updates here.</span>
              </div>
            ) : (
              recentEvents.map((event) => (
                <article className="operations-activity-item" key={event.id}>
                  <div>
                    <strong>{event.title}</strong>
                    <span>{event.meta}</span>
                  </div>
                  <p>{event.detail}</p>
                </article>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
