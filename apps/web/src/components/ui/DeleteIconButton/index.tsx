import { Trash2 } from "lucide-react";

type DeleteIconButtonProps = {
  disabled?: boolean;
  label: string;
  onClick: () => void;
};

export function DeleteIconButton({ disabled = false, label, onClick }: DeleteIconButtonProps) {
  return (
    <button
      className="icon-row-action danger"
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <Trash2 size={15} aria-hidden="true" />
    </button>
  );
}
