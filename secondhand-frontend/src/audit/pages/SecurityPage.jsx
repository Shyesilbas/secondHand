import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditLogsPagination } from '../hooks/useAuditLogsPagination.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { authService } from '../../auth/services/authService.js';
import SecuritySummary from '../components/SecuritySummary.jsx';
import SecurityFilters from '../components/SecurityFilters.jsx';
import SecurityActivityList from '../components/SecurityActivityList.jsx';
import PaginationControls from '../components/PaginationControls.jsx';
import LogDetailModal from '../components/LogDetailModal.jsx';
import RevokeSessionsModal from '../components/RevokeSessionsModal.jsx';

const SecurityPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [selectedLog, setSelectedLog] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [isRevoking, setIsRevoking] = useState(false);
    
    const {
        // Data
        auditLogs,
        totalElements,
        totalPages,
        currentPage,
        pageSize,
        
        // Loading & Error
        isLoading,
        error,
        
        // Filters
        filters,
        hasActiveFilters,
        
        // Controls
        goToPage,
        goToNextPage,
        goToPreviousPage,
        changePageSize,
        updateFilter,
        clearFilters,
        
        // Pagination Info
        shouldShowPagination,
        startIndex,
        endIndex,
        
        // Helper Functions
        getEventTypeDisplay,
        getEventStatusColor,
        getEventTypeIcon,
        getBrowserInfo,
        getLocationFromIP,
        
        // Enums
        auditEnums
    } = useAuditLogsPagination(user?.email, 10);

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
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-card-bg rounded-card shadow-card border p-6">
                                <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-text-secondary hover:text-text-primary transition-colors mb-4"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                <h1 className="text-3xl font-bold text-text-primary">
                    Security
                </h1>
                <p className="text-text-secondary mt-2">
                    Monitor your account security and login activity
                </p>
            </div>

            {/* Security Recommendation */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-blue-800 mb-1">
                            Security Recommendation
                        </h3>
                        <p className="text-sm text-blue-700">
                            For your security, we recommend changing your password at least every 6 months.{' '}
                            <button
                                onClick={() => navigate('/change-password')}
                                className="font-medium text-blue-800 hover:text-blue-900 underline transition-colors"
                            >
                                Change your password
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Filters */}
            <SecurityFilters
                filters={filters}
                hasActiveFilters={hasActiveFilters}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
                auditEnums={auditEnums}
                totalElements={totalElements}
                onRevokeSessions={() => setShowRevokeModal(true)}
            />

            {/* Security Summary */}
            <SecuritySummary
                totalElements={totalElements}
                auditLogs={auditLogs}
            />

            {/* Security Activity List */}
            <SecurityActivityList
                auditLogs={auditLogs}
                totalElements={totalElements}
                setSelectedLog={setSelectedLog}
                getEventTypeDisplay={getEventTypeDisplay}
                getEventStatusColor={getEventStatusColor}
                getEventTypeIcon={getEventTypeIcon}
                getBrowserInfo={getBrowserInfo}
                getLocationFromIP={getLocationFromIP}
            />

            {/* Pagination Controls */}
            <PaginationControls
                shouldShowPagination={shouldShowPagination}
                currentPage={currentPage}
                totalPages={totalPages}
                startIndex={startIndex}
                endIndex={endIndex}
                totalElements={totalElements}
                pageSize={pageSize}
                goToPreviousPage={goToPreviousPage}
                goToNextPage={goToNextPage}
                changePageSize={changePageSize}
            />

            {/* Log Detail Modal */}
            <LogDetailModal
                selectedLog={selectedLog}
                setSelectedLog={setSelectedLog}
                getEventTypeDisplay={getEventTypeDisplay}
                getEventStatusColor={getEventStatusColor}
                getBrowserInfo={getBrowserInfo}
            />

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