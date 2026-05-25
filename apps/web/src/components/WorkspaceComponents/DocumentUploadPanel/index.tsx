import { type FormEvent, useState, useRef, useEffect } from "react";
import { WorkflowDefinition } from "@/types";
import { UploadJob } from "@/hooks/useUploadQueue";
import { UploadQueueList } from "@/components/WorkspaceComponents/UploadQueueList";

type DocumentUploadPanelProps = {
  queue: {
    jobs: UploadJob[];
    queueFiles: (files: File[], workflowId: string, documentType: string) => void;
    removeJob: (id: string) => void;
    clearCompleted: () => void;
  };
  runWorkflowId: string;
  savedWorkflows: WorkflowDefinition[];
  setRunWorkflowId: (id: string) => void;
};

export function DocumentUploadPanel({
  queue,
  runWorkflowId,
  savedWorkflows,
  setRunWorkflowId,
}: DocumentUploadPanelProps) {
  const [hasFiles, setHasFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedWorkflow = savedWorkflows.find((workflow) => workflow.id === runWorkflowId) || null;

  useEffect(() => {
    if (!runWorkflowId && savedWorkflows.length > 0) {
      setRunWorkflowId(savedWorkflows[0].id);
    }
  }, [runWorkflowId, savedWorkflows, setRunWorkflowId]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
      const files = Array.from(fileInputRef.current.files);
      queue.queueFiles(files, runWorkflowId, selectedWorkflow?.document_type || "Document");
      fileInputRef.current.value = "";
      setHasFiles(false);
    }
  };

  return (
    <>
      <form className="document-upload-panel" onSubmit={handleSubmit}>
        <div>
          <p className="app-kicker">Upload documents</p>
          <h3>Create a document run</h3>
        </div>
        
        <label>
          Workflow
          <select name="workflow_id" disabled={savedWorkflows.length === 0} value={runWorkflowId} onChange={(event) => setRunWorkflowId(event.target.value)}>
            {savedWorkflows.length === 0 ? <option value="">Publish a workflow first</option> : null}
            {savedWorkflows.map((workflow) => <option key={workflow.id} value={workflow.id}>{workflow.name}</option>)}
          </select>
        </label>
        <div className="document-upload-meta">
          <span>Document type</span>
          <strong>{selectedWorkflow?.document_type || "Choose a workflow"}</strong>
        </div>

        <label>
          File
          <input 
            ref={fileInputRef}
            name="file" 
            type="file" 
            multiple 
            accept="application/pdf,image/*" 
            disabled={savedWorkflows.length === 0 || !runWorkflowId} 
            onChange={(e) => setHasFiles(!!e.target.files && e.target.files.length > 0)}
          />
        </label>

        <button className="app-primary-action" type="submit" disabled={savedWorkflows.length === 0 || !runWorkflowId || !hasFiles}>
          Upload
        </button>
      </form>

      <UploadQueueList queue={queue} />
    </>
  );
}
