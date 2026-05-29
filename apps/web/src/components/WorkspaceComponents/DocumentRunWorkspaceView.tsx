import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Play, Trash2, CheckCircle2, Copy, FileText, ChevronDown, ChevronUp, AlertCircle, ExternalLink } from "lucide-react";
import { DocumentRun, ExtractedRecord, ReviewState, WorkflowDefinition } from "@/types";
import { updateRecord, updateReviewState, retryDocumentRun, deleteDocumentRun, getDocumentArtifact, updateDocumentRun } from "@/api";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type DocumentRunWorkspaceViewProps = {
  runId: string;
  documentRuns: DocumentRun[];
  records: ExtractedRecord[];
  reviewStates: ReviewState[];
  savedWorkflows: WorkflowDefinition[];
  onClose: () => void;
  setToastMessage: (toast: { message: string; type: "success" | "error" } | null) => void;
};

export function DocumentRunWorkspaceView({
  runId,
  documentRuns,
  records,
  reviewStates,
  savedWorkflows,
  onClose,
  setToastMessage,
}: DocumentRunWorkspaceViewProps) {
  const queryClient = useQueryClient();
  const run = documentRuns.find((item) => item.id === runId);
  const record = records.find((item) => item.document_run_id === runId);
  const review = reviewStates.find((item) => item.document_run_id === runId);
  const workflow = savedWorkflows.find((w) => w.id === run?.workflow_id);

  const isApproved = run?.status === "approved" || record?.status === "approved";

  console.log("DocumentRunWorkspaceView debugging:", {
    runId,
    runFound: !!run,
    runStatus: run?.status,
    recordFound: !!record,
    recordStatus: record?.status,
    isApproved,
  });

  // Editable fields state
  const [editedFields, setEditedFields] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Collapsed states for raw OCR sections
  const [ocrTexts, setOcrTexts] = useState<Record<string, string>>({});
  const [ocrExpanded, setOcrExpanded] = useState<Record<string, boolean>>({});
  const [loadingOcr, setLoadingOcr] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (record) {
      setEditedFields(JSON.parse(JSON.stringify(record.fields || [])));
    }
  }, [record]);

  if (!run) {
    return (
      <div className="empty-workspace-state">
        <strong>Document run not found</strong>
        <button className="app-secondary-action" onClick={onClose}>
          <ArrowLeft size={16} /> Back to Runs
        </button>
      </div>
    );
  }

  // Group fields by filename
  const fieldsByFile: Record<string, any[]> = {};
  
  // Extract file names from run artifacts or metadata
  const originalArtifacts = run.artifacts?.filter((art: any) => art.kind === "original") || [];
  const filenames = originalArtifacts.map((art: any) => art.filename || "document");

  // Initialize fields grouping
  filenames.forEach((fname) => {
    fieldsByFile[fname] = [];
  });

  // Distribute fields to files
  editedFields.forEach((field, index) => {
    const fname = field.filename || filenames[0] || "document";
    if (!fieldsByFile[fname]) {
      fieldsByFile[fname] = [];
    }
    fieldsByFile[fname].push({ ...field, originalIndex: index });
  });

  const handleFieldChange = (originalIndex: number, val: string) => {
    setEditedFields((prev) => {
      const list = [...prev];
      list[originalIndex] = { ...list[originalIndex], value: val };
      return list;
    });
  };

  const handleApprove = async () => {
    if (!record) return;
    setIsSaving(true);
    try {
      // 1. Update the record fields and mark as approved
      await updateRecord(record.id, {
        fields: editedFields,
        status: "approved",
      });

      // 2. Resolve the review state
      if (review) {
        await updateReviewState(review.id, {
          status: "resolved",
          decisions: [
            ...(review.decisions || []),
            { action: "approved", actor: "user", at: new Date().toISOString() },
          ],
        });
      }

      // 3. Update the document run status to approved
      await updateDocumentRun(run.id, {
        status: "approved",
      });

      // 4. Invalidate caches and show toast
      queryClient.invalidateQueries({ queryKey: ["documentRuns"] });
      queryClient.invalidateQueries({ queryKey: ["records"] });
      queryClient.invalidateQueries({ queryKey: ["reviewStates"] });

      setToastMessage({ message: "Document bundle successfully approved and published!", type: "success" });
      onClose();
    } catch (err: any) {
      setToastMessage({ message: err.message || "Failed to approve run.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryDocumentRun(run.id);
      queryClient.invalidateQueries({ queryKey: ["documentRuns"] });
      queryClient.invalidateQueries({ queryKey: ["records"] });
      queryClient.invalidateQueries({ queryKey: ["reviewStates"] });

      setToastMessage({ message: "Reprocessing initiated successfully.", type: "success" });
      onClose();
    } catch (err: any) {
      setToastMessage({ message: err.message || "Failed to retry document run.", type: "error" });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDocumentRun(run.id);
      queryClient.invalidateQueries({ queryKey: ["documentRuns"] });
      queryClient.invalidateQueries({ queryKey: ["records"] });
      queryClient.invalidateQueries({ queryKey: ["reviewStates"] });

      setToastMessage({ message: "Document run removed from workspace view.", type: "success" });
      onClose();
    } catch (err: any) {
      setToastMessage({ message: err.message || "Failed to delete run.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleOcrText = async (fname: string) => {
    const currentlyExpanded = ocrExpanded[fname];
    setOcrExpanded((prev) => ({ ...prev, [fname]: !currentlyExpanded }));

    // If expanding and don't have text yet, fetch it
    if (!currentlyExpanded && !ocrTexts[fname]) {
      const ocrArtifact = run.artifacts?.find(
        (art: any) => art.kind === "ocr_text" && art.filename === fname
      );
      if (!ocrArtifact) return;
      const key = ocrArtifact.key;
      if (typeof key !== "string") return;

      setLoadingOcr((prev) => ({ ...prev, [fname]: true }));
      try {
        const text = await getDocumentArtifact(key);
        setOcrTexts((prev) => ({ ...prev, [fname]: text }));
      } catch (err) {
        console.error("Failed to load OCR text", err);
        setOcrTexts((prev) => ({ ...prev, [fname]: "Could not retrieve OCR text." }));
      } finally {
        setLoadingOcr((prev) => ({ ...prev, [fname]: false }));
      }
    }
  };

  const copyShareLink = () => {
    const reportUrl = `${window.location.origin}${window.location.pathname}#/report/${run.id}`;
    navigator.clipboard.writeText(reportUrl);
    setToastMessage({ message: "View-only report URL copied to clipboard!", type: "success" });
  };

  const isLowConfidence = (confidence: any) => {
    const conf = parseFloat(confidence);
    return !isNaN(conf) && conf < 0.82;
  };

  return (
    <div className="document-run-workspace-view">
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete this document run?"
        description={`"${run.document_name}" and all its extracted data will be permanently removed.`}
        confirmLabel="Yes, delete"
        cancelLabel="Keep it"
        variant="danger"
        onConfirm={() => { setShowDeleteConfirm(false); handleDelete(); }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      <div className="workspace-detail-header">
        <button className="back-btn" onClick={onClose}>
          <ArrowLeft size={16} /> Back to Runs
        </button>
        <div className="header-main">
          <div>
            <span className="app-kicker">
              {workflow?.name || "Workflow"} · {run.document_type}
            </span>
            <h2>{run.document_name}</h2>
            <span className="date-label">Ingested: {new Date(run.created_at).toLocaleString()}</span>
          </div>
          <div className="status-badge-container">
            <span className="status-badge" data-status={isApproved ? "approved" : run.status}>
              {(isApproved ? "approved" : run.status).replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      <div className="workspace-detail-body">
        <div className="detail-main-content">
          {run.status === "failed" ? (
            <div className="error-card">
              <AlertCircle size={20} className="error-icon" />
              <div>
                <h4>System Processing Error</h4>
                <p>{run.error || "A system-level error prevented OCR or field extraction from completing."}</p>
              </div>
            </div>
          ) : null}

          {filenames.map((fname) => {
            const fileFields = fieldsByFile[fname] || [];
            const hasOcrArtifact = run.artifacts?.some(
              (art: any) => art.kind === "ocr_text" && art.filename === fname
            );

            return (
              <div key={fname} className="file-section-card">
                <div className="file-section-header">
                  <FileText size={18} />
                  <h4>{fname}</h4>
                </div>

                <div className="fields-grid">
                  {fileFields.length === 0 && run.status !== "failed" ? (
                    <p className="no-fields-text">No fields extracted for this document.</p>
                  ) : (
                    fileFields.map((field) => {
                      const lowConf = isLowConfidence(field.confidence);
                      if (isApproved) {
                        return (
                          <div key={field.name} className="field-read-group">
                            <div className="field-label-row">
                              <span className="field-read-label">{field.name}</span>
                              {field.confidence !== undefined && (
                                <span className={`confidence-tag ${lowConf ? "warning" : "success"}`}>
                                  {Math.round(field.confidence * 100)}% conf
                                </span>
                              )}
                            </div>
                            <div className="field-read-value">
                              {field.value || <span className="empty-value">Empty</span>}
                            </div>
                            {field.evidence && (
                              <span className="field-evidence" title={field.evidence}>
                                Evidence: &ldquo;{field.evidence}&rdquo;
                              </span>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div key={field.name} className="field-input-group" data-low-confidence={lowConf}>
                          <div className="field-label-row">
                            <label>{field.name}</label>
                            {field.confidence !== undefined && (
                              <span className={`confidence-tag ${lowConf ? "warning" : "success"}`}>
                                {lowConf && <AlertCircle size={10} />}
                                {Math.round(field.confidence * 100)}% conf
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={field.value || ""}
                            onChange={(e) => handleFieldChange(field.originalIndex, e.target.value)}
                            disabled={isApproved}
                            placeholder="Enter value..."
                          />
                          {field.evidence && (
                            <span className="field-evidence" title={field.evidence}>
                              Evidence: &ldquo;{field.evidence}&rdquo;
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {hasOcrArtifact && (
                  <div className="ocr-accordion-wrapper">
                    <button
                      type="button"
                      className="ocr-accordion-toggle"
                      onClick={() => toggleOcrText(fname)}
                    >
                      <span>Raw OCR text (Advanced Debugging)</span>
                      {ocrExpanded[fname] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {ocrExpanded[fname] && (
                      <div className="ocr-accordion-content">
                        {loadingOcr[fname] ? (
                          <div className="loading-spinner-small">Loading OCR Text...</div>
                        ) : (
                          <pre>{ocrTexts[fname]}</pre>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="detail-sidebar">
          <div className="sidebar-sticky-card">
            <h4>Workspace Panel</h4>
            <p className="sidebar-desc">
              Correct low-confidence values and resolve issues. Once approved, the document becomes shareable via a view-only report.
            </p>

            <div className="sidebar-stats">
              <div className="stat-row">
                <span>Total Files</span>
                <strong>{filenames.length}</strong>
              </div>
              <div className="stat-row">
                <span>Fields Extracted</span>
                <strong>{editedFields.length}</strong>
              </div>
              {record?.confidence !== null && (
                <div className="stat-row">
                  <span>Confidence Score</span>
                  <strong>{Math.round((record?.confidence || 0) * 100)}%</strong>
                </div>
              )}
              {run.metadata?.attempts !== undefined && (
                <div className="stat-row">
                  <span>Processing Attempts</span>
                  <strong>{String(run.metadata.attempts)}</strong>
                </div>
              )}
            </div>

            <div className="action-buttons-stack">
              {!isApproved && run.status !== "failed" && (
                <button
                  type="button"
                  className="app-primary-action approve-btn"
                  onClick={handleApprove}
                  disabled={isSaving}
                >
                  <CheckCircle2 size={16} />
                  {isSaving ? "Approving..." : "Save & Approve"}
                </button>
              )}

              {run.status === "failed" && (
                <button
                  type="button"
                  className="app-primary-action retry-btn"
                  onClick={handleRetry}
                  disabled={isRetrying}
                >
                  <Play size={16} />
                  {isRetrying ? "Retrying..." : "Rerun / Retry Job"}
                </button>
              )}

              {!isApproved && (
                <button
                  type="button"
                  className="app-secondary-action delete-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                >
                  <Trash2 size={16} />
                  {isDeleting ? "Deleting..." : "Delete Run"}
                </button>
              )}

              {isApproved && (
                <>
                  <button
                    type="button"
                    className="app-primary-action share-btn"
                    onClick={copyShareLink}
                  >
                    <Copy size={16} /> Copy Shareable Link
                  </button>
                  <a
                    href={`#/report/${run.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="app-secondary-action view-btn text-center"
                  >
                    <ExternalLink size={16} /> Open Shared Report
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
