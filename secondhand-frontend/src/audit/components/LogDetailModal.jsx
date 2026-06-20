import { useTranslation } from "react-i18next";
import { formatDateTime } from '../../common/formatters.js';
import { X, Clock, MapPin, Monitor, AlertCircle, Shield, CheckCircle, XCircle } from 'lucide-react';
const LogDetailModal = ({
  selectedLog,
  setSelectedLog,
  getEventTypeDisplay,
  getEventStatusColor,
  getBrowserInfo
}) => {
  const {
    t
  } = useTranslation();
  const formatTime = timestamp => {
    return formatDateTime(timestamp);
  };
  if (!selectedLog) {
    return null;
  }
  const getStatusIcon = status => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-status-success" />;
      case 'FAILURE':
        return <XCircle className="w-5 h-5 text-status-error" />;
      default:
        return <AlertCircle className="w-5 h-5 text-text-secondary" />;
    }
  };
  return <div className="fixed inset-0 bg-black/40 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
            <div className="relative bg-background-primary rounded-2xl shadow-2xl w-full max-w-2xl border border-border-light" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-background-primary border-b border-border-light px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-text-primary">{t("event_details")}</h3>
                            <p className="text-xs text-text-muted">{t("security_activity_information")}</p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedLog(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-tertiary transition-colors text-text-muted hover:text-text-primary">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">{t("event_type")}</label>
                            <p className="text-base font-semibold text-text-primary">{getEventTypeDisplay(selectedLog.eventType)}</p>
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">{t("status")}</label>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(selectedLog.eventStatus)}
                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${getEventStatusColor(selectedLog.eventStatus)}`}>
                                    {selectedLog.eventStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-tertiary"></div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-secondary rounded-xl">
                            <Clock className="w-5 h-5 text-text-muted mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wide block mb-1">{t("date_time")}</label>
                                <p className="text-sm font-medium text-text-primary">{formatTime(selectedLog.createdAt)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-secondary rounded-xl">
                            <MapPin className="w-5 h-5 text-text-muted mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wide block mb-1">{t("ip_address")}</label>
                                <p className="text-sm font-medium text-text-primary font-mono">{selectedLog.ipAddress || 'Unknown'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-secondary rounded-xl">
                            <Monitor className="w-5 h-5 text-text-muted mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wide block mb-1">{t("device_browser")}</label>
                                <p className="text-sm font-medium text-text-primary">{getBrowserInfo(selectedLog.userAgent)}</p>
                            </div>
                        </div>
                    </div>

                    {selectedLog.details && <>
                            <div className="h-px bg-tertiary"></div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">{t("details")}</label>
                                <p className="text-sm text-text-secondary leading-relaxed">{selectedLog.details}</p>
                            </div>
                        </>}
                    
                    {selectedLog.errorMessage && <>
                            <div className="h-px bg-tertiary"></div>
                            <div className="p-4 bg-status-error-bg border border-status-error-border rounded-xl">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-status-error flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <label className="text-xs font-semibold text-status-error uppercase tracking-wide block mb-1">{t("error_message")}</label>
                                        <p className="text-sm text-status-error-text font-medium">{selectedLog.errorMessage}</p>
                                    </div>
                                </div>
                            </div>
                        </>}
                </div>
                
                <div className="sticky bottom-0 bg-secondary border-t border-border-light px-6 py-4 rounded-b-2xl flex justify-end">
                    <button onClick={() => setSelectedLog(null)} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">{t("close")}</button>
                </div>
            </div>
        </div>;
};
export default LogDetailModal;