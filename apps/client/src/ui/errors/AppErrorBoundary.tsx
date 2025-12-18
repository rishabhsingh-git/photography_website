import React from "react";
import { Button } from "../primitives/Button";

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-4 bg-slate-950 text-slate-50">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Something went wrong</p>
          <h1 className="text-2xl font-semibold">We hit an unexpected error</h1>
          <Button onClick={this.handleRetry}>Retry</Button>
        </div>
      );
    }
    return this.props.children;
  }
}


