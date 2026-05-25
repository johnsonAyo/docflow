import { Plus } from "lucide-react";
import { DeleteIconButton } from "@/components/ui/DeleteIconButton";
import { builderLabels } from "../WorkflowBuilder/labels";
import { AppField, WorkflowStage } from "@/types";

type FieldsStageProps = {
  fields: AppField[];
  onAddField: () => void;
  onChangeStage: (stage: WorkflowStage) => void;
  onDeleteField: (index: number) => void;
};

export function FieldsStage({ fields, onAddField, onChangeStage, onDeleteField }: FieldsStageProps) {
  return (
    <>
      <div className="builder-title-row">
        <div>
          <p className="app-kicker">{builderLabels.stages.fields.kicker}</p>
          <h2>{builderLabels.stages.fields.title}</h2>
        </div>
        <button className="app-secondary-action compact" type="button" onClick={onAddField}>
          <Plus size={15} aria-hidden="true" />
          {builderLabels.stages.fields.action}
        </button>
      </div>

      <div className="schema-table" role="table" aria-label="Extraction schema">
        <div className="schema-row schema-head" role="row">
          {builderLabels.stages.fields.tableHeaders.map((header) => (
            <span key={header}>{header}</span>
          ))}
        </div>
        {fields.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--muted)", fontSize: "0.9rem", background: "var(--surface-soft)", borderRadius: "0 0 var(--r-md) var(--r-md)" }}>
            No fields defined yet. Click "Add field" to build your extraction schema.
          </div>
        ) : (
          fields.map((field, index) => (
            <div className="schema-row" role="row" key={`${field.name}-${field.source}`}>
              <strong>{field.name}</strong>
              <span>{field.type}</span>
              <span>{field.confidence}</span>
              <span>{field.rule}</span>
              <DeleteIconButton label={`Delete ${field.name}`} onClick={() => onDeleteField(index)} />
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
        <button className="app-primary-action" type="button" onClick={() => onChangeStage("Review")}>
          Next: Review rules
        </button>
      </div>
    </>
  );
}

export default FieldsStage;
