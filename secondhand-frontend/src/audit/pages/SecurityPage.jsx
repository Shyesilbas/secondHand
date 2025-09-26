import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ShieldCheckIcon, 
    ExclamationTriangleIcon,
    ClockIcon,
    MapPinIcon,
    ComputerDesktopIcon,
    ArrowLeftIcon,
    FunnelIcon,
    XMarkIcon,
    NoSymbolIcon
} from '@heroicons/react/24/outline';
import { useAuditLogs } from '../hooks/useAuditLogs.js';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import { formatDateTime } from '../../common/formatters.js';
import { ROUTES } from '../../common/constants/routes.js';
import { authService } from '../../auth/services/authService.js';
import RevokeSessionsModal from '../components/RevokeSessionsModal.jsx';

const SecurityPage = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        eventType: 'ALL',
        eventStatus: 'ALL',
        startDate: '',
        endDate: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [isRevoking, setIsRevoking] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    
    const { 
        auditLogs, 
        auditEnums, 
        pagination,
        isLoading, 
        error, 
        getEventTypeDisplay, 
        getEventStatusColor, 
        getEventTypeIcon,
        getLastPasswordChangeDate,
        getPasswordAgeStatus
    } = useAuditLogs(filters, currentPage, pageSize);
    
    const [selectedLog, setSelectedLog] = useState(null);

    const formatTime = (timestamp) => {
        return formatDateTime(timestamp);
    };

    const getBrowserInfo = (userAgent) => {
        if (!userAgent) return 'Unknown Browser';
        
                if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown Browser';
    };

    const getLocationFromIP = (ipAddress) => {
                        return ipAddress || 'Unknown Location';
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            eventType: 'ALL',
            eventStatus: 'ALL',
            startDate: '',
            endDate: ''
        });
    };

    const hasActiveFilters = () => {
        return filters.eventType !== 'ALL' ||
               filters.eventStatus !== 'ALL' ||
               filters.startDate ||
               filters.endDate;
    };

    const handleRevokeAllSessions = async () => {
        setIsRevoking(true);
        try {
            await authService.revokeAllSessions();
            setShowRevokeModal(false);
                        alert('All sessions have been revoked successfully. You will be redirected to login.');
                        window.location.href = '/login';
        } catch (error) {
            console.error('Failed to revoke sessions:', error);
            alert('Failed to revoke sessions. Please try again.');
        } finally {
            setIsRevoking(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-10">
                <div className="flex items-center justify-center h-64">
                    <LoadingIndicator />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-10">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error Loading Security Logs</h3>
                            <p className="mt-1 text-sm text-red-700">{error.message}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Security</h1>
                        <p className="text-gray-600 mt-1">Monitor your account security and login activity</p>
                    </div>
                </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                        showFilters || hasActiveFilters()
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <FunnelIcon className="w-4 h-4" />
                                    <span>Filters</span>
                                    {hasActiveFilters() && (
                                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                            {[filters.eventType !== 'ALL', filters.eventStatus !== 'ALL', filters.startDate, filters.endDate].filter(Boolean).length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowRevokeModal(true)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                                >
                                    <NoSymbolIcon className="w-4 h-4" />
                                    <span>Revoke All Sessions</span>
                                </button>
                                <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
                                    <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-medium text-green-800">Account Secure</span>
                                </div>
                            </div>
            </div>

            {/* Security Recommendation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-blue-800 mb-1">Security Recommendation</h3>
                        <p className="text-sm text-blue-700">
                            For your security, we recommend changing your password at least every 6 months.{' '}
                            <button
                                onClick={() => navigate('/change-password')}
                                className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
                            >
                                Change your password
                            </button>
                        </p>
                        
                        {/* Password Age Info */}
                        <p className="text-sm text-blue-700 mt-2">
                            Your password was last changed{' '}
                            <span className={`font-semibold ${
                                getPasswordAgeStatus().color === 'green' ? 'text-green-600' :
                                getPasswordAgeStatus().color === 'yellow' ? 'text-yellow-600' :
                                getPasswordAgeStatus().color === 'orange' ? 'text-orange-600' :
                                getPasswordAgeStatus().color === 'red' ? 'text-red-600' :
                                'text-gray-600'
                            }`}>
                                {getPasswordAgeStatus().message}
                            </span>
                            {getLastPasswordChangeDate() && (
                                <span className="text-blue-600 ml-1">
                                    ({formatTime(getLastPasswordChangeDate())})
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Filter Security Events</h3>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                        >
                            <XMarkIcon className="w-4 h-4" />
                            <span>Clear All</span>
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Event Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                            <select
                                value={filters.eventType}
                                onChange={(e) => handleFilterChange('eventType', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="ALL">All Event Types</option>
                                {auditEnums.eventTypes.map((eventType) => (
                                    <option key={eventType.value} value={eventType.value}>
                                        {eventType.displayName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Event Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Event Status</label>
                            <select
                                value={filters.eventStatus}
                                onChange={(e) => handleFilterChange('eventStatus', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="ALL">All Statuses</option>
                                {auditEnums.eventStatuses.map((eventStatus) => (
                                    <option key={eventStatus.value} value={eventStatus.value}>
                                        {eventStatus.displayName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Start Date Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* End Date Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Security Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Events</p>
                            <p className="text-2xl font-bold text-gray-900">{auditLogs.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Successful Logins</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {auditLogs.filter(log => log.eventType === 'LOGIN_SUCCESS').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Failed Attempts</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {auditLogs.filter(log => log.eventType === 'LOGIN_FAILURE').length}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Security Logs */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Security Activity</h2>
                    <p className="text-sm text-gray-600 mt-1">Recent security events for your account</p>
                </div>

                <div className="divide-y divide-gray-200">
                    {auditLogs.length === 0 ? (
                        <div className="p-8">
                            <EmptyState
                                icon={ShieldCheckIcon}
                                title="No Security Events"
                                description="No security events found for your account"
                            />
                        </div>
                    ) : (
                        auditLogs.map((log) => (
                            <div
                                key={log.id}
                                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => setSelectedLog(log)}
                            >
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
                        ))
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            <span className="text-sm text-gray-700">
                                Page {currentPage + 1} of {pagination.totalPages}
                            </span>

                            <button
                                onClick={() => setCurrentPage(Math.min(pagination.totalPages - 1, currentPage + 1))}
                                disabled={currentPage >= pagination.totalPages - 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-700">
                                Showing {pagination.totalElements === 0 ? 0 : currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, pagination.totalElements)} of {pagination.totalElements} results
                            </div>
                            <div className="flex items-center space-x-2">
                                <label htmlFor="pageSize" className="text-sm text-gray-700">Per page:</label>
                                <select
                                    id="pageSize"
                                    className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={pageSize}
                                    onChange={(e) => { setCurrentPage(0); setPageSize(Number(e.target.value)); }}
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Log Detail Modal */}
            {selectedLog && (
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
            )}

            {/* Revoke Sessions Modal */}
            <RevokeSessionsModal
                isOpen={showRevokeModal}
                onClose={() => setShowRevokeModal(false)}
                onConfirm={handleRevokeAllSessions}
                isLoading={isRevoking}
            />
        </div>
    );
};

export default SecurityPage;
