import { type ReactNode } from "react";
import { X } from "lucide-react";

type ModalShellProps = {
  className?: string;
  closeAria: string;
  kicker: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function ModalShell({ className, closeAria, kicker, title, onClose, children }: ModalShellProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className={["field-modal", className].filter(Boolean).join(" ")} role="dialog" aria-modal="true" aria-labelledby="modal-shell-title">
        <div className="modal-header">
          <div>
            <p className="app-kicker">{kicker}</p>
            <h2 id="modal-shell-title">{title}</h2>
          </div>
          <button className="icon-action" type="button" aria-label={closeAria} onClick={onClose}>
            <X size={17} aria-hidden="true" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default ModalShell;
