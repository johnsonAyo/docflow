import { Pencil } from "lucide-react";
import { type MouseEvent } from "react";
import { DeleteIconButton } from "@/components/ui/DeleteIconButton";
import { workspaceComponentsLabels } from "@/components/WorkspaceComponents/constants/labels";

type WorkflowRowProps = {
  documents: string;
  id: string;
  isDeleting: boolean;
  name: string;
  onDelete: (workflowId: string) => void;
  onEdit: (workflowId: string) => void;
  onRun: (workflowId: string) => void;
  owner: string;
  status: string;
  type: string;
};

export function WorkflowRow(props: WorkflowRowProps) {
  return (
    <article className="published-workflow-row" onClick={() => props.onRun(props.id)}>
      <div>
        <strong>{props.name}</strong>
        <span>{props.type} · {props.owner}</span>
      </div>
      <span data-status={props.status}>{props.status}</span>
      <b>{props.documents}</b>
      <div className="row-hover-actions">
        <button
          className="icon-row-action"
          type="button"
          aria-label={`${workspaceComponentsLabels.overview.publishedWorkflows.actionEdit} ${props.name}`}
          onClick={(event) => handleAction(event, () => props.onEdit(props.id))}
        >
          <Pencil size={15} aria-hidden="true" />
        </button>
        <DeleteIconButton
          label={`Delete ${props.name}`}
          onClick={() => props.onDelete(props.id)}
          disabled={props.isDeleting}
        />
      </div>
    </article>
  );
}

function handleAction(event: MouseEvent, action: () => void) {
  event.stopPropagation();
  action();
}
