"use client";

import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class WeatherErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[WeatherErrorBoundary]", error, info.componentStack);
  }

  handleRetry = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="bg-slate-800 rounded-2xl p-8 border border-red-800/50 text-center">
          <p className="text-red-400 text-2xl mb-3">⚠</p>
          <p className="text-white font-medium mb-1">Something went wrong</p>
          <p className="text-slate-400 text-sm mb-4 font-mono break-all">
            {this.state.error.message}
          </p>
          <button
            onClick={this.handleRetry}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
