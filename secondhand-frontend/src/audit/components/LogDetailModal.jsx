import { formatDateTime } from '../../common/formatters.js';
import { X, Clock, MapPin, Monitor, AlertCircle, Shield, CheckCircle, XCircle } from 'lucide-react';

const LogDetailModal = ({ 
    selectedLog, 
    setSelectedLog,
    getEventTypeDisplay,
    getEventStatusColor,
    getBrowserInfo
}) => {
    const formatTime = (timestamp) => {
        return formatDateTime(timestamp);
    };

    if (!selectedLog) {
        return null;
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'SUCCESS':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'FAILURE':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-600" />;
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedLog(null)}
        >
            <div 
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Event Details</h3>
                            <p className="text-xs text-gray-500">Security activity information</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedLog(null)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Event Type</label>
                            <p className="text-base font-semibold text-gray-900">{getEventTypeDisplay(selectedLog.eventType)}</p>
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(selectedLog.eventStatus)}
                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${getEventStatusColor(selectedLog.eventStatus)}`}>
                                    {selectedLog.eventStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-200"></div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                            <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Date & Time</label>
                                <p className="text-sm font-medium text-gray-900">{formatTime(selectedLog.createdAt)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">IP Address</label>
                                <p className="text-sm font-medium text-gray-900 font-mono">{selectedLog.ipAddress || 'Unknown'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                            <Monitor className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Device & Browser</label>
                                <p className="text-sm font-medium text-gray-900">{getBrowserInfo(selectedLog.userAgent)}</p>
                            </div>
                        </div>
                    </div>

                    {selectedLog.details && (
                        <>
                            <div className="h-px bg-gray-200"></div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Details</label>
                                <p className="text-sm text-gray-700 leading-relaxed">{selectedLog.details}</p>
                            </div>
                        </>
                    )}
                    
                    {selectedLog.errorMessage && (
                        <>
                            <div className="h-px bg-gray-200"></div>
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <label className="text-xs font-semibold text-red-600 uppercase tracking-wide block mb-1">Error Message</label>
                                        <p className="text-sm text-red-800 font-medium">{selectedLog.errorMessage}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl flex justify-end">
                    <button
                        onClick={() => setSelectedLog(null)}
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogDetailModal;
