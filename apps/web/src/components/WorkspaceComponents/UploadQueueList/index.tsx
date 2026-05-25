import { AlertCircle, CheckCircle2, Loader2, Upload, XCircle } from "lucide-react";
import { UploadJob, UploadJobStatus } from "@/hooks/useUploadQueue";

type UploadQueueListProps = {
  queue: {
    jobs: UploadJob[];
    removeJob: (id: string) => void;
    clearCompleted: () => void;
  };
};

export function UploadQueueList({ queue }: UploadQueueListProps) {
  if (queue.jobs.length === 0) return null;

  return (
    <div className="upload-queue" style={{ marginTop: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h4>Upload Queue ({queue.jobs.length})</h4>
        <button className="app-secondary-action compact" type="button" onClick={queue.clearCompleted}>Clear Completed</button>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {queue.jobs.map((job) => (
          <li key={job.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", background: "#f9f9f9", borderRadius: "6px", border: "1px solid #eee" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
              {statusIcon(job.status)}
              <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <span style={{ fontWeight: 500, fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.file.name}</span>
                <span style={{ fontSize: "0.8rem", color: "#666" }}>{job.progressMessage}</span>
              </div>
            </div>
            <button className="icon-row-action danger" type="button" aria-label={`Remove ${job.file.name}`} onClick={() => queue.removeJob(job.id)}><XCircle size={16} aria-hidden="true" /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function statusIcon(status: UploadJobStatus) {
  if (status === "pending") return <Loader2 size={16} className="animate-spin text-gray-400" />;
  if (status === "uploading") return <Upload size={16} className="text-blue-500" />;
  if (status === "processing") return <Loader2 size={16} className="animate-spin text-blue-500" />;
  if (status === "completed") return <CheckCircle2 size={16} className="text-green-500" />;
  return <AlertCircle size={16} className="text-red-500" />;
}
