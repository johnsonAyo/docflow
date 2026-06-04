import { type FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { WorkflowDefinition, WorkflowSaveState } from "@/types";

type DocumentUploadPanelProps = {
  runWorkflowId: string;
  savedWorkflows: WorkflowDefinition[];
  setRunWorkflowId: (id: string) => void;
  onUploadDocument: (formData: FormData) => void;
  onSelectedFilesChange?: (hasFiles: boolean) => void;
  isUploadingDocument: boolean;
  uploadState: WorkflowSaveState;
};

export function DocumentUploadPanel({
  runWorkflowId,
  savedWorkflows,
  setRunWorkflowId,
  onUploadDocument,
  onSelectedFilesChange,
  isUploadingDocument,
  uploadState,
}: DocumentUploadPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousUploadingRef = useRef(false);
  const selectedWorkflow = savedWorkflows.find((workflow) => workflow.id === runWorkflowId) || null;

  useEffect(() => {
    onSelectedFilesChange?.(Boolean(selectedFile));
  }, [selectedFile, onSelectedFilesChange]);

  useEffect(() => {
    if (!runWorkflowId && savedWorkflows.length > 0) {
      setRunWorkflowId(savedWorkflows[0].id);
    }
  }, [runWorkflowId, savedWorkflows, setRunWorkflowId]);

  useEffect(() => {
    const wasUploading = previousUploadingRef.current;
    previousUploadingRef.current = isUploadingDocument;

    if (wasUploading && !isUploadingDocument && uploadState.status === "saved") {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isUploadingDocument, uploadState.status]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] || null);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile || isUploadingDocument) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("workflow_id", runWorkflowId);
    formData.append("document_type", selectedWorkflow?.document_type || "Document");

    onUploadDocument(formData);
  };

  return (
    <form className={`document-upload-panel${isUploadingDocument ? " is-uploading" : ""}`} onSubmit={handleSubmit}>
      <div>
        <p className="app-kicker">Ingest & process document</p>
        <h3>Upload Document</h3>
        <p className="panel-desc">Select one PDF or scanned image to run through the extraction workflow.</p>
        {isUploadingDocument ? (
          <div className="upload-inline-status" aria-live="polite">
            <Loader2 size={15} className="animate-spin" />
            <span>{uploadState.message || "Upload in progress. We are sending the file and preparing OCR."}</span>
          </div>
        ) : null}
      </div>

      <label className="form-label">
        Workflow Target
        <select
          name="workflow_id"
          disabled={savedWorkflows.length === 0 || isUploadingDocument}
          value={runWorkflowId}
          onChange={(event) => setRunWorkflowId(event.target.value)}
        >
          {savedWorkflows.length === 0 ? <option value="">Publish a workflow first</option> : null}
          {savedWorkflows.map((workflow) => <option key={workflow.id} value={workflow.id}>{workflow.name}</option>)}
        </select>
      </label>

      <label className="form-label">
        Add PDF or scanned image
        <input
          ref={fileInputRef}
          name="file_input"
          type="file"
          accept="application/pdf,image/*"
          disabled={savedWorkflows.length === 0 || !runWorkflowId || isUploadingDocument}
          onChange={handleFileChange}
        />
      </label>

      <button className="app-primary-action" type="submit" disabled={savedWorkflows.length === 0 || !runWorkflowId || !selectedFile || isUploadingDocument}>
        {isUploadingDocument ? "Uploading..." : "Process Document"}
      </button>

      {selectedFile ? (
        <div className="selected-document-card">
          <span className="selected-document-name" title={selectedFile.name}>{selectedFile.name}</span>
          <button
            type="button"
            className="delete"
            onClick={removeFile}
            disabled={isUploadingDocument}
            aria-label="Remove selected file"
            title="Remove selected file"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : null}
    </form>
  );
}
