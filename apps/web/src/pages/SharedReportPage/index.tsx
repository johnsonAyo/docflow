import { useState, useEffect } from "react";
import { FileText, AlertCircle, Layers, CheckCircle2, ShieldAlert } from "lucide-react";
import { API_V1_URL, parseJsonResponse } from "@/api";
import { DocumentRun, ExtractedRecord } from "@/types";

export function SharedReportPage() {
  const [runId, setRunId] = useState<string | null>(null);
  const [run, setRun] = useState<DocumentRun | null>(null);
  const [record, setRecord] = useState<ExtractedRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract runId from hash path: e.g. #/report/uuid
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#\/report\/([^/?]+)/);
      if (match && match[1]) {
        setRunId(match[1]);
      } else {
        setError("Invalid report link format.");
        setLoading(false);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Fetch run and record details
  useEffect(() => {
    if (!runId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const runRes = await fetch(`${API_V1_URL}/document-runs/${runId}`);
        if (!runRes.ok) throw new Error("Document run not found or inaccessible.");
        const runData = await parseJsonResponse<DocumentRun>(runRes, "Failed to load run");

        // Fetch associated record
        let recordData: ExtractedRecord | null = null;
        const recordRes = await fetch(`${API_V1_URL}/records?document_run_id=${runId}`);
        if (recordRes.ok) {
          const records = await parseJsonResponse<ExtractedRecord[]>(recordRes, "Failed to load record");
          if (records.length > 0) {
            recordData = records[0];
          }
        }

        const isApproved = runData.status === "approved" || recordData?.status === "approved";
        if (!isApproved) {
          throw new Error("This report has not been approved and published yet.");
        }

        setRun(runData);
        if (recordData) {
          setRecord(recordData);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while loading the report.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [runId]);

  if (loading) {
    return (
      <main className="shared-report-container loading">
        <div className="report-card text-center">
          <div className="loading-spinner">Loading Live Report...</div>
        </div>
      </main>
    );
  }

  if (error || !run) {
    return (
      <main className="shared-report-container error">
        <div className="report-card text-center">
          <ShieldAlert size={48} className="error-icon" />
          <h2>Report Unavailable</h2>
          <p>{error || "This document run could not be loaded."}</p>
          <a href="/" className="app-secondary-action back-home-link">Go to Homepage</a>
        </div>
      </main>
    );
  }

  const originalArtifacts = run.artifacts?.filter((art: any) => art.kind === "original") || [];
  const filenames = originalArtifacts.map((art: any) => art.filename || "document");

  // Group fields by filename
  const fieldsByFile: Record<string, any[]> = {};
  filenames.forEach((fname) => {
    fieldsByFile[fname] = [];
  });

  if (record) {
    record.fields?.forEach((field: any) => {
      const fname = field.filename || filenames[0] || "document";
      if (!fieldsByFile[fname]) {
        fieldsByFile[fname] = [];
      }
      fieldsByFile[fname].push(field);
    });
  }

  const isLowConfidence = (confidence: any) => {
    const conf = parseFloat(confidence);
    return !isNaN(conf) && conf < 0.82;
  };

  const totalFields = record?.fields?.length || 0;
  const lowConfidenceFields = record?.fields?.filter((f: any) => isLowConfidence(f.confidence)).length || 0;
  const matchedFields = totalFields - lowConfidenceFields;

  return (
    <main className="shared-report-container">
      <header className="report-view-banner">
        <span><CheckCircle2 size={14} /> Official Verified Output</span>
        <p>This view-only report is generated from verified OCR extraction on DocFlow.</p>
      </header>

      <article className="report-card">
        {/* Summary Header */}
        <section className="report-summary-header">
          <div className="header-meta">
            <span className="app-kicker">Verified Document Bundle</span>
            <h2>{run.document_name}</h2>
            <div className="header-tags">
              <span className="tag badge-status-approved">
                <CheckCircle2 size={12} /> Approved & Verified
              </span>
              <span className="tag">
                <Layers size={12} /> {filenames.length} File{filenames.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
          
          <div className="summary-stats-box">
            <h4>Extraction Summary</h4>
            <div className="stats-grid">
              <div>
                <span>Total Fields</span>
                <strong>{totalFields}</strong>
              </div>
              <div>
                <span>Verified Match</span>
                <strong>{matchedFields}</strong>
              </div>
              {lowConfidenceFields > 0 && (
                <div>
                  <span className="warning-label">Uncertain Fields</span>
                  <strong className="warning-value">{lowConfidenceFields}</strong>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Grouped file sections */}
        <section className="report-sections-timeline">
          {filenames.map((fname, fileIndex) => {
            const fileFields = fieldsByFile[fname] || [];

            return (
              <div key={fname} className="report-file-section">
                <div className="report-file-header">
                  <span className="file-seq">{fileIndex + 1}</span>
                  <FileText size={16} />
                  <h3>{fname}</h3>
                </div>

                <div className="report-fields-table">
                  {fileFields.length === 0 ? (
                    <p className="no-fields-text">No verified fields for this file.</p>
                  ) : (
                    fileFields.map((field) => {
                      const lowConf = isLowConfidence(field.confidence);
                      return (
                        <div key={field.name} className="report-field-row" data-low-confidence={lowConf}>
                          <div className="field-label-cell">
                            <strong>{field.name}</strong>
                            {lowConf && (
                              <span className="low-confidence-indicator" title="Value processed with low machine confidence">
                                <AlertCircle size={12} /> Uncertain Value
                              </span>
                            )}
                          </div>
                          <div className="field-value-cell">
                            <span className="field-value-text">{field.value || "—"}</span>
                            {field.evidence && (
                              <p className="field-evidence-cite">Source text: &ldquo;{field.evidence}&rdquo;</p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </section>

        <footer className="report-footer text-center">
          <p>© {new Date().getFullYear()} DocFlow Single-User Operations workspace. All rights reserved.</p>
        </footer>
      </article>
    </main>
  );
}
