import {Clock as ClockIcon, MapPin as MapPinIcon} from 'lucide-react';
import {formatDateTime} from '../../common/formatters.js';

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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center mb-10">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Security Events Found
                </h3>
                <p className="text-gray-600">
                    You don't have any security events yet.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-10">
            <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                    Security Activity ({totalElements})
                </h3>
            </div>

            <div className="divide-y divide-gray-200">
                {auditLogs.map((log, index) => (
                    <div key={log.id || index} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedLog(log)}>
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getEventTypeIcon(log.eventType)} />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        {getEventTypeDisplay(log.eventType)}
                                    </h3>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getEventStatusColor(log.eventStatus)}`}>
                                        {log.eventStatus}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <p className="text-sm text-gray-600">{log.details}</p>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-sm font-medium text-gray-700">{getBrowserInfo(log.userAgent)}</span>
                                </div>
                                <div className="flex items-center flex-wrap gap-4 text-xs text-gray-500">
                                    <div className="flex items-center space-x-1.5">
                                        <ClockIcon className="w-4 h-4" />
                                        <span>{formatTime(log.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1.5">
                                        <MapPinIcon className="w-4 h-4" />
                                        <span>{getLocationFromIP(log.ipAddress)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SecurityActivityList;
