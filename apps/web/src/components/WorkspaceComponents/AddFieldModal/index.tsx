import { type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { addFieldModalLabels } from "./labels";

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
            <p className="app-kicker">{addFieldModalLabels.kicker}</p>
            <h2 id="field-modal-title">{addFieldModalLabels.title}</h2>
          </div>
          <button className="icon-action" type="button" aria-label={addFieldModalLabels.closeAria} onClick={onClose}>
            <X size={17} aria-hidden="true" />
          </button>
        </div>

        <form className="field-modal-form" onSubmit={onSubmit}>
          <label>
            {addFieldModalLabels.fields.name.label}
            <input name="fieldName" type="text" placeholder={addFieldModalLabels.fields.name.placeholder} required />
          </label>
          <label>
            {addFieldModalLabels.fields.type.label}
            <select name="fieldType" defaultValue={addFieldModalLabels.fields.type.options[2]}>
              {addFieldModalLabels.fields.type.options.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </label>
          <label>
            {addFieldModalLabels.fields.rule.label}
            <select name="reviewRule" defaultValue="">
              <option value="" disabled>Select review rule...</option>
              {addFieldModalLabels.fields.rule.options.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </label>

          <label className="wide-field">
            {addFieldModalLabels.fields.instruction.label}
            <textarea name="instruction" placeholder={addFieldModalLabels.fields.instruction.placeholder} />
          </label>
          <div className="modal-actions">
            <button className="app-secondary-action" type="button" onClick={onClose}>
              {addFieldModalLabels.actions.cancel}
            </button>
            <button className="app-primary-action" type="submit">
              <Plus size={16} aria-hidden="true" />
              {addFieldModalLabels.actions.submit}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AddFieldModal;
