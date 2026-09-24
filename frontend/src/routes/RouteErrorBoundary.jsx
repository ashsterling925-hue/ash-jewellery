import React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

/**
 * Error boundary for catching lazy chunk loading failures and route crashes.
 * When network drops or new deployment updates asset hashes, dynamic imports can fail.
 * This boundary prevents full white-screen crashes and provides instant recovery actions.
 */
export default class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Route chunk loading error caught by boundary:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-6 text-center bg-[#fffdf9]">
          <div className="w-14 h-14 rounded-full bg-[#fcedeb] text-[#d9534f] flex items-center justify-center mb-4 shadow-xs">
            <AlertCircle size={28} />
          </div>

          <p className="font-serif text-[11px] tracking-[0.25em] text-[#b99657] uppercase mb-1">
            ASH JEWELLERY
          </p>

          <h2 className="font-serif text-xl sm:text-2xl tracking-wide text-[#1e1c19] mb-2 font-normal">
            Temporarily Unable to Load Page
          </h2>

          <p className="text-xs sm:text-sm text-[#716b62] max-w-md mb-6 leading-relaxed">
            The page module could not be loaded. This typically happens if the website was recently updated or due to a momentary network interruption.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#10233f] text-white text-xs tracking-wider uppercase font-medium rounded-xs hover:bg-[#1a365d] transition-colors cursor-pointer"
            >
              <RefreshCw size={14} /> Reload Page
            </button>
            <button
              onClick={this.handleGoHome}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#d8cfc4] text-[#1e1c19] text-xs tracking-wider uppercase font-medium rounded-xs hover:bg-[#f6f2ea] transition-colors cursor-pointer"
            >
              <Home size={14} /> Back to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
