import React from 'react';
import { ClockIcon, MapPinIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { formatDateTime } from '../../common/formatters.js';

const SecurityActivityList = ({ 
    auditLogs, 
    totalElements, 
    setSelectedLog,
    getEventTypeDisplay,
    getEventStatusColor,
    getEventTypeIcon,
    getBrowserInfo,
    getLocationFromIP
}) => {
    const formatTime = (timestamp) => {
        return formatDateTime(timestamp);
    };

    if (auditLogs.length === 0) {
        return (
            <div className="bg-card-bg rounded-card shadow-card border p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                    No Security Events Found
                </h3>
                <p className="text-text-secondary mb-6">
                    You don't have any security events yet.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-card-bg rounded-card shadow-card border overflow-hidden">
            <div className="px-6 py-4 border-b border-sidebar-border">
                <h3 className="text-lg font-semibold text-text-primary">
                    Security Activity ({totalElements})
                </h3>
            </div>

            <div className="divide-y divide-gray-200">
                {auditLogs.map((log, index) => (
                    <div key={log.id || index} className="p-6 hover:bg-app-bg transition-colors cursor-pointer" onClick={() => setSelectedLog(log)}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getEventTypeIcon(log.eventType)} />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {getEventTypeDisplay(log.eventType)}
                                        </h3>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventStatusColor(log.eventStatus)}`}>
                                            {log.eventStatus}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                        <div className="flex items-center space-x-1">
                                            <ClockIcon className="w-4 h-4" />
                                            <span>{formatTime(log.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <MapPinIcon className="w-4 h-4" />
                                            <span>{getLocationFromIP(log.ipAddress)}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <ComputerDesktopIcon className="w-4 h-4" />
                                            <span>{getBrowserInfo(log.userAgent)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">{formatTime(log.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SecurityActivityList;
