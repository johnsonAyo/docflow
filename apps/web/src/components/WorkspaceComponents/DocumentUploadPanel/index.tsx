import { type FormEvent, useState, useRef, useEffect } from "react";
import { ArrowUp, ArrowDown, Trash2, Layers } from "lucide-react";
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
  onUploadDocument: (formData: FormData) => void;
  onSelectedFilesChange?: (hasFiles: boolean) => void;
};

type GroupedFile = {
  id: string;
  file: File;
};

export function DocumentUploadPanel({
  queue,
  runWorkflowId,
  savedWorkflows,
  setRunWorkflowId,
  onUploadDocument,
  onSelectedFilesChange,
}: DocumentUploadPanelProps) {
  const [selectedFiles, setSelectedFiles] = useState<GroupedFile[]>([]);
  const [bundleTitle, setBundleTitle] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedWorkflow = savedWorkflows.find((workflow) => workflow.id === runWorkflowId) || null;

  useEffect(() => {
    onSelectedFilesChange?.(selectedFiles.length > 0);
  }, [selectedFiles.length, onSelectedFilesChange]);

  useEffect(() => {
    if (!runWorkflowId && savedWorkflows.length > 0) {
      setRunWorkflowId(savedWorkflows[0].id);
    }
  }, [runWorkflowId, savedWorkflows, setRunWorkflowId]);

  const handleFileDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleFileDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setSelectedFiles((prev) => {
      const list = [...prev];
      const draggedItem = list[draggedIndex];
      list.splice(draggedIndex, 1);
      list.splice(index, 0, draggedItem);
      return list;
    });
    setDraggedIndex(index);
  };

  const handleFileDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: crypto.randomUUID(),
        file,
      }));
      setSelectedFiles((prev) => {
        const next = [...prev, ...newFiles];
        // Automatically default bundle title to the first file's name (without extension) if empty
        if (!bundleTitle && next.length > 0) {
          const first = next[0].file.name;
          const extIndex = first.lastIndexOf(".");
          setBundleTitle(extIndex > 0 ? first.substring(0, extIndex) : first);
        }
        return next;
      });
      // Clear file input value to allow selecting same files
      e.target.value = "";
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach((sf) => {
      formData.append("files", sf.file);
    });
    formData.append("workflow_id", runWorkflowId);
    formData.append("document_type", selectedWorkflow?.document_type || "Document");
    if (selectedFiles.length > 1) {
      formData.append("bundle_title", bundleTitle || "New Bundle");
    }

    onUploadDocument(formData);

    // Clear state
    setSelectedFiles([]);
    setBundleTitle("");
  };

  return (
    <>
      <form className="document-upload-panel" onSubmit={handleSubmit}>
        <div>
          <p className="app-kicker">Ingest & process documents</p>
          <h3>{selectedFiles.length > 1 ? "Assemble Document Bundle" : "Upload Document"}</h3>
          <p className="panel-desc">
            {selectedFiles.length > 1
              ? "Select one or more files to process as a single chronological document bundle."
              : "Select a file to run the extraction workflow."}
          </p>
        </div>
        
        <label className="form-label">
          Workflow Target
          <select name="workflow_id" disabled={savedWorkflows.length === 0} value={runWorkflowId} onChange={(event) => setRunWorkflowId(event.target.value)}>
            {savedWorkflows.length === 0 ? <option value="">Publish a workflow first</option> : null}
            {savedWorkflows.map((workflow) => <option key={workflow.id} value={workflow.id}>{workflow.name}</option>)}
          </select>
        </label>
        
        <label className="form-label">
          Add PDF or Scanned Files
          <input 
            ref={fileInputRef}
            name="file_input" 
            type="file" 
            multiple 
            accept="application/pdf,image/*" 
            disabled={savedWorkflows.length === 0 || !runWorkflowId} 
            onChange={handleFileChange}
          />
        </label>

        <button className="app-primary-action" type="submit" disabled={savedWorkflows.length === 0 || !runWorkflowId || selectedFiles.length === 0}>
          {selectedFiles.length > 1 ? "Process Bundle" : "Process Document"}
        </button>

        {selectedFiles.length > 0 ? (
          <div className="bundle-composition-section">
            {selectedFiles.length > 1 ? (
              <>
                <label className="form-label">
                  Bundle Title
                  <input
                    type="text"
                    placeholder="E.g., Q2 Invoices Bundle"
                    value={bundleTitle}
                    onChange={(e) => setBundleTitle(e.target.value)}
                    required
                  />
                </label>

                <div className="grouped-files-list">
                  <span className="list-title"><Layers size={14} /> Grouped Files ({selectedFiles.length})</span>
                  {selectedFiles.map((sf, index) => (
                    <div 
                      key={sf.id} 
                      className={`grouped-file-item ${draggedIndex === index ? "dragging-item" : ""}`}
                      draggable
                      onDragStart={() => handleFileDragStart(index)}
                      onDragOver={(e) => handleFileDragOver(e, index)}
                      onDragEnd={handleFileDragEnd}
                      style={{ cursor: "grab" }}
                    >
                      <span className="file-index-badge">{index + 1}</span>
                      <span className="grouped-file-name" title={sf.file.name}>{sf.file.name}</span>
                      <div className="grouped-file-actions">
                        <button
                          type="button"
                          className="delete"
                          onClick={() => removeFile(sf.id)}
                          aria-label="Remove file"
                          title="Remove file"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="grouped-files-list">
                <div className="grouped-file-item">
                  <span className="grouped-file-name" title={selectedFiles[0].file.name}>{selectedFiles[0].file.name}</span>
                  <div className="grouped-file-actions">
                    <button
                      type="button"
                      className="delete"
                      onClick={() => removeFile(selectedFiles[0].id)}
                      aria-label="Remove file"
                      title="Remove file"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </form>

      <UploadQueueList queue={queue} />
    </>
  );
}
