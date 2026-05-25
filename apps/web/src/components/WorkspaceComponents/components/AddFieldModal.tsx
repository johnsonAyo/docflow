import { type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { workspaceComponentsLabels } from "@/components/WorkspaceComponents/labels";

type AddFieldModalProps = {
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AddFieldModal({ onClose, onSubmit }: AddFieldModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="field-modal" role="dialog" aria-modal="true" aria-labelledby="field-modal-title">
        <div className="modal-header">
          <div>
            <p className="app-kicker">{workspaceComponentsLabels.addFieldModal.kicker}</p>
            <h2 id="field-modal-title">{workspaceComponentsLabels.addFieldModal.title}</h2>
          </div>
          <button className="icon-action" type="button" aria-label={workspaceComponentsLabels.addFieldModal.closeAria} onClick={onClose}>
            <X size={17} aria-hidden="true" />
          </button>
        </div>

        <form className="field-modal-form" onSubmit={onSubmit}>
          <label>
            {workspaceComponentsLabels.addFieldModal.fields.name.label}
            <input name="fieldName" type="text" placeholder={workspaceComponentsLabels.addFieldModal.fields.name.placeholder} required />
          </label>
          <label>
            {workspaceComponentsLabels.addFieldModal.fields.type.label}
            <select name="fieldType" defaultValue={workspaceComponentsLabels.addFieldModal.fields.type.options[2]}>
              {workspaceComponentsLabels.addFieldModal.fields.type.options.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </label>
          <label>
            {workspaceComponentsLabels.addFieldModal.fields.rule.label}
            <select name="reviewRule" defaultValue="">
              <option value="" disabled>Select review rule...</option>
              {workspaceComponentsLabels.addFieldModal.fields.rule.options.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </label>

          <label className="wide-field">
            {workspaceComponentsLabels.addFieldModal.fields.instruction.label}
            <textarea name="instruction" placeholder={workspaceComponentsLabels.addFieldModal.fields.instruction.placeholder} />
          </label>
          <div className="modal-actions">
            <button className="app-secondary-action" type="button" onClick={onClose}>
              {workspaceComponentsLabels.addFieldModal.actions.cancel}
            </button>
            <button className="app-primary-action" type="submit">
              <Plus size={16} aria-hidden="true" />
              {workspaceComponentsLabels.addFieldModal.actions.submit}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AddFieldModal;
