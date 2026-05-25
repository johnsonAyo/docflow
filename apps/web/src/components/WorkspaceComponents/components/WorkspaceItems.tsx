import { ArrowRight } from "lucide-react";
import { WorkspaceItem } from "@/types";
import { WorkspaceSectionTitle } from "@/components/WorkspaceComponents/components/workspaceSectionTypes";

export function EmptyWorkspaceState({ title }: { title: WorkspaceSectionTitle }) {
  return (
    <div className="empty-workflow-state">
      <strong>{emptyTitle(title)}</strong>
      <p>{emptyMessage(title)}</p>
    </div>
  );
}

export function WorkspaceItems({ items, title }: { items: WorkspaceItem[]; title: WorkspaceSectionTitle }) {
  return (
    <>
      {items.map((item) => (
        <article className="workspace-item-row" key={`${title}-${item.title}`}>
          <div><strong>{item.title}</strong><span>{item.meta}</span></div>
          <p>{item.detail}</p>
          <b data-status={item.status}>{item.status}</b>
          <button className="icon-row-action" type="button" aria-label={`Open ${item.title}`}>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </article>
      ))}
    </>
  );
}

function emptyTitle(title: WorkspaceSectionTitle) {
  if (title === "Runs") return "No document runs yet";
  if (title === "Review queue") return "No review items yet";
  return "No records yet";
}

function emptyMessage(title: WorkspaceSectionTitle) {
  if (title === "Runs") return "Publish a workflow and upload your own document to create the first run.";
  if (title === "Review queue") return "Review items will appear after extraction finds missing or low-confidence fields.";
  return "Extracted records will appear after documents are uploaded and processed.";
}
