import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div style={{ padding: "2rem", border: "1px solid #ffcccc", borderRadius: "8px", background: "#fff5f5", color: "#cc0000", margin: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <AlertCircle size={24} />
            <h2 style={{ margin: 0, fontSize: "var(--font-size-lg)" }}>Something went wrong</h2>
          </div>
          <p style={{ margin: 0, fontSize: "var(--font-size-md)", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
            {this.state.error?.toString()}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
