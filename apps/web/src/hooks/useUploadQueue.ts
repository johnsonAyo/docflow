import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { uploadDocument, API_V1_URL, parseJsonResponse } from "@/api";
import { DocumentRun } from "@/types";

export type UploadJobStatus = "pending" | "uploading" | "processing" | "completed" | "error";

export type UploadJob = {
  id: string;
  file: File;
  workflowId: string;
  documentType: string;
  status: UploadJobStatus;
  progressMessage: string;
  runId?: string;
};

export function useUploadQueue() {
  const queryClient = useQueryClient();
  const [jobs, setJobs] = useState<UploadJob[]>([]);

  const queueFiles = useCallback((files: File[], workflowId: string, documentType: string) => {
    const newJobs = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      workflowId,
      documentType,
      status: "pending" as UploadJobStatus,
      progressMessage: "Waiting in queue...",
    }));
    setJobs((prev) => [...prev, ...newJobs]);
  }, []);

  const removeJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setJobs((prev) => prev.filter((job) => job.status !== "completed" && job.status !== "error"));
  }, []);

  const updateJob = useCallback((id: string, updates: Partial<UploadJob>) => {
    setJobs((prev) => prev.map((job) => (job.id === id ? { ...job, ...updates } : job)));
  }, []);

  // Upload Loop: Pick the next pending job and upload it
  useEffect(() => {
    const nextJob = jobs.find((j) => j.status === "pending");
    if (!nextJob) return;

    const startUpload = async () => {
      updateJob(nextJob.id, { status: "uploading", progressMessage: "Uploading file..." });
      try {
        const formData = new FormData();
        formData.append("file", nextJob.file);
        formData.append("workflow_id", nextJob.workflowId);
        formData.append("document_type", nextJob.documentType);

        const result = await uploadDocument(formData);
        
        // Assume API returns { document_run: DocumentRun }
        const runId = result.document_run?.id;
        
        if (runId) {
          updateJob(nextJob.id, { 
            status: "processing", 
            progressMessage: "Processing document with OCR...",
            runId 
          });
        } else {
          updateJob(nextJob.id, { status: "error", progressMessage: "Upload failed: No run ID returned." });
        }
      } catch (error: unknown) {
        updateJob(nextJob.id, {
          status: "error",
          progressMessage: error instanceof Error ? error.message : "Upload failed.",
        });
      }
    };

    startUpload();
  }, [jobs, updateJob]);

  // Polling Loop: Check status of processing jobs
  useEffect(() => {
    const processingJobs = jobs.filter((j) => j.status === "processing" && j.runId);
    if (processingJobs.length === 0) return;

    const intervalId = setInterval(async () => {
      for (const job of processingJobs) {
        try {
          const response = await fetch(`${API_V1_URL}/document-runs/${job.runId}`);
          const run = await parseJsonResponse<DocumentRun>(response, "Failed to poll run status");
          
          if (run.status === "needs_review" || run.status === "approved") {
            updateJob(job.id, { status: "completed", progressMessage: "Processing complete!" });
            queryClient.invalidateQueries({ queryKey: ["documentRuns"] });
            queryClient.invalidateQueries({ queryKey: ["reviewStates"] });
            queryClient.invalidateQueries({ queryKey: ["records"] });
          } else if (run.status === "failed") {
            updateJob(job.id, { status: "error", progressMessage: run.error || "Processing failed." });
            queryClient.invalidateQueries({ queryKey: ["documentRuns"] });
            queryClient.invalidateQueries({ queryKey: ["reviewStates"] });
            queryClient.invalidateQueries({ queryKey: ["records"] });
          }
          // Otherwise it remains processing
        } catch (error) {
          console.error("Polling error for job", job.id, error);
        }
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(intervalId);
  }, [jobs, updateJob, queryClient]);

  return {
    jobs,
    queueFiles,
    removeJob,
    clearCompleted,
  };
}
