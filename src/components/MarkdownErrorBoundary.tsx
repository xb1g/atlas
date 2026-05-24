import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackText?: string;
}

interface State {
  hasError: boolean;
}

export class MarkdownErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("MarkdownErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // If we failed to parse/render markdown, fall back to rendering the raw text
      // We assume children's ReactMarkdown has a string fallback, but here we can just show
      // a simple text message or the fallbackText if provided.
      return (
        <div className="whitespace-pre-wrap font-sans text-xs">
          {this.props.fallbackText || "Error rendering markdown."}
        </div>
      );
    }

    return this.props.children;
  }
}
