import { useEffect } from "react";

export function useDismissToast(toastMessage: unknown, onDismiss: () => void) {
  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timer);
  }, [toastMessage, onDismiss]);
}
