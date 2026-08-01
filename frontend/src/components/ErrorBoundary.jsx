import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SENTINEL UI Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-12 bg-[#0f1420] border border-rose-500/40 rounded-2xl shadow-cyber-glow font-mono text-xs space-y-6">
          <div className="flex items-center gap-3 text-rose-400">
            <AlertOctagon className="w-8 h-8 shrink-0" />
            <div>
              <h2 className="text-lg font-bold">FORENSIC WORKBENCH ERROR DETECTED</h2>
              <p className="text-slate-400 text-[11px]">AN UNEXPECTED RUNTIME EXCEPTION OCCURRED DURING ANALYSIS</p>
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-rose-300 overflow-x-auto">
            {this.state.error?.toString() || 'Unknown UI Error'}
          </div>

          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded shadow-cyber-glow transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            RELOAD FORENSIC WORKBENCH
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
