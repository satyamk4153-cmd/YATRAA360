import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Yatra360 ErrorBoundary captured error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const title = this.props.fallbackTitle || 'Something went wrong in this section';
      const errorMessage = this.state.error?.message || 'An unexpected runtime error occurred.';

      return (
        <div className="max-w-xl mx-auto my-12 p-6 rounded-2xl bg-white border border-rose-200 shadow-sm text-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{title}</h2>
              <p className="text-xs text-slate-500">
                The application recovered gracefully without losing your active session.
              </p>
            </div>
          </div>

          <div className="p-3.5 mb-5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-2xs text-rose-700 break-all overflow-x-auto">
            {errorMessage}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>

            <button
              type="button"
              onClick={() => {
                this.handleReset();
                window.location.hash = '#dashboard';
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Dashboard</span>
            </button>

            <button
              type="button"
              onClick={this.handleReload}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center gap-1.5 cursor-pointer transition-colors ml-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
