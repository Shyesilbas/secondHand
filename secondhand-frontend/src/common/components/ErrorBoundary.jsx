import React from 'react';
import i18n from '../../i18n.js';
import logger from '../utils/logger.js';
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }
  componentDidCatch(error, errorInfo) {
    logger.error('React Error Boundary caught:', error, errorInfo);
    this.setState({
      errorInfo
    });

    // Production'da error tracking service'e gönder
    if (import.meta.env.PROD) {
      // Sentry, LogRocket, etc.
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }
  handleRefresh = () => {
    window.location.reload();
  };
  handleGoHome = () => {
    window.location.href = '/';
  };
  render() {
    const t = i18n.t.bind(i18n);

    if (this.state.hasError) {
      return <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
          <div className="max-w-md w-full bg-background-primary shadow-lg rounded-lg p-6">
            {/* Error Icon */}
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-status-error-bg rounded-full">
              <svg className="w-6 h-6 text-status-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            {/* Error Title */}
            <h3 className="text-sm font-medium text-text-primary mt-4">{t("something_went_wrong")}</h3>

            {/* Error Message */}
            <p className="mt-2 text-sm text-text-muted text-center">{t("we_re_sorry_for_the_inconvenience_please")}</p>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button onClick={this.handleRefresh} className="flex-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary transition-colors">{t("refresh_page")}</button>
              <button onClick={this.handleGoHome} className="flex-1 bg-tertiary text-text-secondary px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">{t("go_home")}</button>
            </div>

            {/* Development Error Details */}
            {import.meta.env.DEV && this.state.error && <details className="mt-4">
                <summary className="text-sm text-text-secondary cursor-pointer hover:text-gray-800">{t("error_details_development_only")}</summary>
                <div className="mt-2 space-y-2">
                  <pre className="text-xs bg-tertiary p-2 rounded overflow-auto max-h-40">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && <pre className="text-xs bg-tertiary p-2 rounded overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>}
                </div>
              </details>}
          </div>
        </div>;
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
