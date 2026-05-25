import { DeleteIconButton } from "@/components/WorkspaceComponents/components/DeleteIconButton";
import { workspaceComponentsLabels } from "@/components/WorkspaceComponents/labels";
import { describeDeliveryAction, readable } from "@/lib/workflowItemDescriptions";
import { WorkflowDeliveryAction } from "@/types";

type DeliveryStageProps = {
  deliveryActions: WorkflowDeliveryAction[];
  onDeleteAction: (index: number) => void;
};

export function DeliveryStage({ deliveryActions, onDeleteAction }: DeliveryStageProps) {
  return (
    <>
      <div className="builder-title-row">
        <div>
          <p className="app-kicker">{workspaceComponentsLabels.builder.stages.delivery.kicker}</p>
          <h2>{workspaceComponentsLabels.builder.stages.delivery.title}</h2>
        </div>
      </div>

      <div className="rules-and-actions">
        {deliveryActions.length === 0 ? <EmptyActions /> : null}
        {deliveryActions.map((action, index) => (
          <article key={`${action.type}-${action.target}`}>
            <div className="builder-item-heading">
              <div>
                <p className="app-kicker">{readable(action.type)}</p>
                <h3>{readable(action.target)}</h3>
              </div>
              <DeleteIconButton label={`Delete ${action.target}`} onClick={() => onDeleteAction(index)} />
            </div>
            <ul>{describeDeliveryAction(action).map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        ))}
      </div>
    </>
  );
}

function EmptyActions() {
  return <div className="builder-empty-state">No delivery actions configured.</div>;
}

export default DeliveryStage;
