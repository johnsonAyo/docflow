import { ArrowRight, Eye } from "lucide-react";
import { WorkspaceItem } from "@/types";
import { WorkspaceSectionTitle } from "@/components/WorkspaceComponents/WorkspaceSectionView/workspaceSectionTypes";

export function EmptyWorkspaceState({ title }: { title: WorkspaceSectionTitle }) {
  return (
    <div className="empty-workflow-state">
      <strong>{emptyTitle(title)}</strong>
      <p>{emptyMessage(title)}</p>
    </div>
  );
}

export function WorkspaceItems({
  items,
  onOpenReviewItem,
  title,
}: {
  items: WorkspaceItem[];
  onOpenReviewItem: (reviewId: string) => void;
  title: WorkspaceSectionTitle;
}) {
  return (
    <>
      {items.map((item) => (
        <article className="workspace-item-row" key={item.id}>
          <div><strong>{item.title}</strong><span>{item.meta}</span></div>
          <p>{item.detail}</p>
          <b data-status={item.status}>{item.status}</b>
          {title === "Review queue" ? (
            <button
              className="icon-row-action"
              type="button"
              aria-label={`Review ${item.title}`}
              onClick={() => onOpenReviewItem(item.id)}
            >
              <Eye size={16} aria-hidden="true" />
            </button>
          ) : (
            <button className="icon-row-action" type="button" aria-label={`Open ${item.title}`}>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}
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
