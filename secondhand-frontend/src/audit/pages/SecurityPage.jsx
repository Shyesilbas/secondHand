import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuditLogsPagination} from '../hooks/useAuditLogsPagination.js';
import {useAuthState} from '../../auth/AuthContext.jsx';
import {authService} from '../../auth/services/authService.js';
import {ArrowLeft, LogOut, Settings2, ShieldAlert, ShieldCheck} from 'lucide-react';

import SecurityFilters from '../components/SecurityFilters.jsx';
import SecurityActivityList from '../components/SecurityActivityList.jsx';
import PaginationControls from '../components/PaginationControls.jsx';
import LogDetailModal from '../components/LogDetailModal.jsx';
import RevokeSessionsModal from '../components/RevokeSessionsModal.jsx';

const SecurityPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthState();

    const [selectedLog, setSelectedLog] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [isRevoking, setIsRevoking] = useState(false);

    const {
        auditLogs, totalElements, totalPages, currentPage, pageSize,
        isLoading, error, filters, hasActiveFilters,
        goToPage, goToNextPage, goToPreviousPage, changePageSize,
        updateFilter, clearFilters, shouldShowPagination, startIndex,
        endIndex, getEventTypeDisplay, getEventStatusColor, getEventTypeIcon,
        getBrowserInfo, getLocationFromIP, auditEnums
    } = useAuditLogsPagination(user?.email, 10);

    const handleRevokeAllSessions = async () => {
        setIsRevoking(true);
        try {
            await authService.revokeAllSessions();
            setShowRevokeModal(false);
            window.location.href = '/login';
        } catch (error) {
            console.error('Failed to revoke sessions:', error);
        } finally {
            setIsRevoking(false);
        }
    };

    if (isLoading) return <LoadingSkeleton />;

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A]">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <span>Account Settings</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">System Secure</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold mb-2">
                            <ShieldCheck size={14} />
                            Privacy Protection
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Security & Privacy</h1>
                        <p className="text-gray-500 max-w-lg">
                            Keep track of where you've signed in and monitor any changes to your account security.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowRevokeModal(true)}
                        className="flex items-center justify-center gap-2 bg-white border border-red-100 text-red-600 px-5 py-3 rounded-xl font-semibold text-sm hover:bg-red-50 hover:border-red-200 transition-all shadow-sm active:scale-95"
                    >
                        <LogOut size={18} />
                        Revoke All Sessions
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
                        <ShieldAlert className="shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="grid grid-cols-1 gap-8">
                    {/* Activity Section */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                Login Activity
                                <span className="text-xs font-normal text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                                    {totalElements} Events
                                </span>
                            </h3>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    showFilters ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <Settings2 size={16} />
                                {showFilters ? 'Hide Filters' : 'Filter Activity'}
                            </button>
                        </div>

                        <SecurityFilters
                            filters={filters}
                            hasActiveFilters={hasActiveFilters}
                            showFilters={showFilters}
                            setShowFilters={setShowFilters}
                            updateFilter={updateFilter}
                            clearFilters={clearFilters}
                            auditEnums={auditEnums}
                            totalElements={totalElements}
                        />

                        <SecurityActivityList
                            auditLogs={auditLogs}
                            setSelectedLog={setSelectedLog}
                            getEventTypeDisplay={getEventTypeDisplay}
                            getEventStatusColor={getEventStatusColor}
                            getEventTypeIcon={getEventTypeIcon}
                            getBrowserInfo={getBrowserInfo}
                            getLocationFromIP={getLocationFromIP}
                        />

                        <div className="p-6 border-t border-gray-50 bg-gray-50/30">
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
                        </div>
                    </div>
                </div>
            </div>

            <LogDetailModal
                selectedLog={selectedLog}
                setSelectedLog={setSelectedLog}
                getEventTypeDisplay={getEventTypeDisplay}
                getEventStatusColor={getEventStatusColor}
                getBrowserInfo={getBrowserInfo}
            />

            <RevokeSessionsModal
                isOpen={showRevokeModal}
                onClose={() => setShowRevokeModal(false)}
                onConfirm={handleRevokeAllSessions}
                isLoading={isRevoking}
            />
        </div>
    );
};

const LoadingSkeleton = () => (
    <div className="min-h-screen bg-white p-12 space-y-8 animate-pulse">
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-12 w-1/3 bg-gray-100 rounded" />
            <div className="grid grid-cols-3 gap-6">
                {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-50 rounded-3xl" />)}
            </div>
            <div className="h-96 bg-gray-50 rounded-3xl" />
        </div>
    </div>
);

export default SecurityPage;