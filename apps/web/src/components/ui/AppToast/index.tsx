import { X } from "lucide-react";

interface AppToastProps {
  message: string;
  type: "error" | "success";
  onClose: () => void;
}

export function AppToast({ message, type, onClose }: AppToastProps) {
  return (
    <div className={`app-toast ${type}`} role="alert" style={{
      position: "fixed",
      bottom: "24px",
      right: "24px",
      backgroundColor: type === "error" ? "var(--error-bg, #fee2e2)" : "var(--success-bg, #dcfce7)",
      color: type === "error" ? "var(--error-text, #991b1b)" : "var(--success-text, #166534)",
      padding: "12px 16px",
      borderRadius: "8px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      zIndex: 50,
      maxWidth: "400px",
      animation: "slideIn 0.3s ease-out forwards"
    }}>
      <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500 }}>{message}</p>
      <button
        onClick={onClose}
        style={{
          background: "none", border: "none", cursor: "pointer",
          padding: 0, color: "inherit", opacity: 0.7
        }}
        aria-label="Close"
      >
        <X size={16} />
      </button>
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default AppToast;
