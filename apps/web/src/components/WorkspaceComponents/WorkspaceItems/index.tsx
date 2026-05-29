import { useState } from "react";
import { ArrowRight, Eye, FolderOpen, Trash2 } from "lucide-react";
import { WorkspaceItem } from "@/types";
import { WorkspaceSectionTitle } from "@/components/WorkspaceComponents/WorkspaceSectionView/workspaceSectionTypes";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function EmptyWorkspaceState({ title }: { title: WorkspaceSectionTitle }) {
  return (
    <div className="empty-workflow-state">
      <FolderOpen size={48} className="empty-icon" style={{ strokeWidth: 1.25, color: "var(--faint)", marginBottom: "16px" }} />
      <strong>{emptyTitle(title)}</strong>
      <p>{emptyMessage(title)}</p>
    </div>
  );
}

export function WorkspaceItems({
  items,
  onOpenReviewItem,
  onOpenRun,
  onDeleteItem,
  title,
}: {
  items: WorkspaceItem[];
  onOpenReviewItem: (reviewId: string) => void;
  onOpenRun?: (runId: string) => void;
  onDeleteItem?: (itemId: string) => void;
  title: WorkspaceSectionTitle;
}) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingItem = items.find((i) => i.id === pendingDeleteId);

  const handleConfirmDelete = () => {
    if (pendingDeleteId) onDeleteItem?.(pendingDeleteId);
    setPendingDeleteId(null);
  };

  return (
    <>
      <ConfirmDialog
        isOpen={!!pendingDeleteId}
        title="Delete this item?"
        description={`"${pendingItem?.title ?? "This item"}" will be permanently removed. This action cannot be undone.`}
        confirmLabel="Yes, delete"
        cancelLabel="Keep it"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />

      {items.map((item) => (
        <article className="workspace-item-row" key={item.id}>
          <div><strong>{item.title}</strong><span>{item.meta}</span></div>
          <p>{item.detail}</p>
          <b data-status={item.status}>{item.status}</b>
          <div className="workspace-item-actions">
            {title === "Review queue" ? (
              <button
                className="icon-row-action"
                type="button"
                aria-label={`Review ${item.title}`}
                onClick={() => onOpenRun ? onOpenRun(item.id) : onOpenReviewItem(item.id)}
              >
                <Eye size={16} aria-hidden="true" />
              </button>
            ) : (
              <button
                className="icon-row-action"
                type="button"
                aria-label={`Open ${item.title}`}
                onClick={() => onOpenRun?.(item.id)}
              >
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            )}
            {onDeleteItem && (
              <button
                className="icon-row-action icon-row-action--danger"
                type="button"
                aria-label={`Delete ${item.title}`}
                onClick={() => setPendingDeleteId(item.id)}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </article>
      ))}
    </>
  );
}

function emptyTitle(title: WorkspaceSectionTitle) {
  if (title === "Process documents") return "No active document runs";
  if (title === "Review queue") return "Queue is empty";
  if (title === "Records") return "No records exported yet";
  if (title === "Integrations") return "No integrations configured";
  return "No items to display";
}

function emptyMessage(title: WorkspaceSectionTitle) {
  if (title === "Process documents") return "Active uploads will appear here while OCR and extraction are still running.";
  if (title === "Review queue") return "Review items will appear after extraction finds missing or low-confidence fields.";
  return "Extracted records will appear after documents are uploaded and processed.";
}
