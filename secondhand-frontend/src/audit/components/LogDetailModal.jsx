import React from 'react';
import { formatDateTime } from '../../common/formatters.js';

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

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Event Details</h3>
                        <button
                            onClick={() => setSelectedLog(null)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Event Type</label>
                            <p className="text-sm text-gray-900">{getEventTypeDisplay(selectedLog.eventType)}</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventStatusColor(selectedLog.eventStatus)}`}>
                                {selectedLog.eventStatus}
                            </span>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                            <p className="text-sm text-gray-900">{formatTime(selectedLog.createdAt)}</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">IP Address</label>
                            <p className="text-sm text-gray-900">{selectedLog.ipAddress || 'Unknown'}</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Browser</label>
                            <p className="text-sm text-gray-900">{getBrowserInfo(selectedLog.userAgent)}</p>
                        </div>
                        
                        {selectedLog.details && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Details</label>
                                <p className="text-sm text-gray-900">{selectedLog.details}</p>
                            </div>
                        )}
                        
                        {selectedLog.errorMessage && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Error Message</label>
                                <p className="text-sm text-red-600">{selectedLog.errorMessage}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setSelectedLog(null)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogDetailModal;
