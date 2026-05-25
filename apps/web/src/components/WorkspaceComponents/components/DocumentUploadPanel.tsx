import { type FormEvent } from "react";
import { Upload } from "lucide-react";
import { WorkflowDefinition, WorkflowSaveState } from "@/types";

type DocumentUploadPanelProps = {
  isUploadingDocument: boolean;
  onUploadDocument: (event: FormEvent<HTMLFormElement>) => void;
  runWorkflowId: string;
  savedWorkflows: WorkflowDefinition[];
  setRunWorkflowId: (id: string) => void;
  uploadState: WorkflowSaveState;
};

export function DocumentUploadPanel({
  isUploadingDocument,
  onUploadDocument,
  runWorkflowId,
  savedWorkflows,
  setRunWorkflowId,
  uploadState,
}: DocumentUploadPanelProps) {
  return (
    <form className="document-upload-panel" onSubmit={onUploadDocument}>
      <div>
        <p className="app-kicker">Upload documents</p>
        <h3>Create a document run</h3>
        <span data-save-state={uploadState.status}>{uploadState.message}</span>
      </div>
      <label>
        Workflow
        <select name="workflow_id" disabled={savedWorkflows.length === 0 || isUploadingDocument} value={runWorkflowId} onChange={(event) => setRunWorkflowId(event.target.value)}>
          {savedWorkflows.length === 0 ? <option value="">Publish a workflow first</option> : null}
          {savedWorkflows.map((workflow) => <option key={workflow.id} value={workflow.id}>{workflow.name}</option>)}
        </select>
      </label>
      <label>
        Document type
        <select name="document_type" disabled={isUploadingDocument} defaultValue="Invoice">
          <option>Invoice</option><option>Contract</option><option>Vendor form</option><option>Custom document</option>
        </select>
      </label>
      <label>File<input name="file" type="file" accept="application/pdf,image/*" disabled={isUploadingDocument} /></label>
      <button className="app-primary-action" type="submit" disabled={savedWorkflows.length === 0 || isUploadingDocument}>
        <Upload size={16} aria-hidden="true" />{isUploadingDocument ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
