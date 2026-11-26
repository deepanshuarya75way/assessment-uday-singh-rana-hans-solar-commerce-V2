import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Section error (${this.props.name}):`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 px-5 py-6 text-center">
            <AlertTriangle className="mx-auto h-6 w-6 text-amber-600" aria-hidden />
            <p className="mt-2 text-sm font-medium text-slate-700">
              {this.props.name
                ? `Unable to load ${this.props.name}.`
                : 'This section could not be loaded.'}
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;
