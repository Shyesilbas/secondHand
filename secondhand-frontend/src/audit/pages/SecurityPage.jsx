import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditLogsPagination } from '../hooks/useAuditLogsPagination.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { authService } from '../../auth/services/authService.js';
import { ArrowLeft, LogOut, Settings2, ShieldAlert, ShieldCheck } from 'lucide-react';
import SecurityFilters from '../components/SecurityFilters.jsx';
import SecurityActivityList from '../components/SecurityActivityList.jsx';
import PaginationControls from '../components/PaginationControls.jsx';
import LogDetailModal from '../components/LogDetailModal.jsx';
import RevokeSessionsModal from '../components/RevokeSessionsModal.jsx';
import logger from '../../common/utils/logger.js';
const SecurityPage = () => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const {
    user
  } = useAuthState();
  const [selectedLog, setSelectedLog] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const {
    auditLogs,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    isLoading,
    error,
    filters,
    hasActiveFilters,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
    updateFilter,
    clearFilters,
    shouldShowPagination,
    startIndex,
    endIndex,
    getEventTypeDisplay,
    getEventStatusColor,
    getEventTypeIcon,
    getBrowserInfo,
    getLocationFromIP,
    auditEnums
  } = useAuditLogsPagination(user?.email, 10);
  const handleRevokeAllSessions = async () => {
    setIsRevoking(true);
    try {
      await authService.revokeAllSessions();
      setShowRevokeModal(false);
      window.location.href = '/login';
    } catch (error) {
      logger.error('Failed to revoke sessions:', error);
    } finally {
      setIsRevoking(false);
    }
  };
  if (isLoading) return <LoadingSkeleton />;
  return <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A]">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-30 bg-background-primary/80 backdrop-blur-md border-b border-gray-100">
                <PageContainer narrow className="h-16 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-black transition-colors">
                        <ArrowLeft size={18} />
                        <span>{t("account_settings")}</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="h-2 w-2 bg-status-success-bg rounded-full animate-pulse" />
                        <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">{t("system_secure")}</span>
                    </div>
                </PageContainer>
            </nav>

            <PageContainer narrow className="py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-primary text-xs font-bold mb-2">
                            <ShieldCheck size={14} />{t("privacy_protection")}</div>
                        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{t("security_privacy")}</h1>
                        <p className="text-text-muted max-w-lg">{t("keep_track_of_where_you_ve_signed_in_and")}</p>
                    </div>

                    <button onClick={() => setShowRevokeModal(true)} className="flex items-center justify-center gap-2 bg-background-primary border border-red-100 text-status-error px-5 py-3 rounded-xl font-semibold text-sm hover:bg-status-error-bg hover:border-red-200 transition-all shadow-sm active:scale-95">
                        <LogOut size={18} />{t("revoke_all_sessions")}</button>
                </div>

                {error && <div className="mb-8 p-4 bg-status-error-bg border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
                        <ShieldAlert className="shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>}

                {/* Main Content Area */}
                <div className="grid grid-cols-1 gap-8">
                    {/* Activity Section */}
                    <div className="bg-background-primary rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-background-primary">
                            <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">{t("login_activity")}<span className="text-xs font-normal text-text-muted bg-secondary px-2 py-0.5 rounded-full">
                                    {totalElements}{t("events")}</span>
                            </h3>
                            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${showFilters ? 'bg-primary text-white' : 'bg-secondary text-text-secondary hover:bg-tertiary'}`}>
                                <Settings2 size={16} />
                                {showFilters ? 'Hide Filters' : 'Filter Activity'}
                            </button>
                        </div>

                        <SecurityFilters filters={filters} hasActiveFilters={hasActiveFilters} showFilters={showFilters} setShowFilters={setShowFilters} updateFilter={updateFilter} clearFilters={clearFilters} auditEnums={auditEnums} totalElements={totalElements} />

                        <SecurityActivityList auditLogs={auditLogs} setSelectedLog={setSelectedLog} getEventTypeDisplay={getEventTypeDisplay} getEventStatusColor={getEventStatusColor} getEventTypeIcon={getEventTypeIcon} getBrowserInfo={getBrowserInfo} getLocationFromIP={getLocationFromIP} />

                        <div className="p-6 border-t border-gray-50 bg-secondary/30">
                            <PaginationControls shouldShowPagination={shouldShowPagination} currentPage={currentPage} totalPages={totalPages} startIndex={startIndex} endIndex={endIndex} totalElements={totalElements} pageSize={pageSize} goToPreviousPage={goToPreviousPage} goToNextPage={goToNextPage} changePageSize={changePageSize} />
                        </div>
                    </div>
                </div>
            </PageContainer>

            <LogDetailModal selectedLog={selectedLog} setSelectedLog={setSelectedLog} getEventTypeDisplay={getEventTypeDisplay} getEventStatusColor={getEventStatusColor} getBrowserInfo={getBrowserInfo} />

            <RevokeSessionsModal isOpen={showRevokeModal} onClose={() => setShowRevokeModal(false)} onConfirm={handleRevokeAllSessions} isLoading={isRevoking} />
        </div>;
};
const LoadingSkeleton = () => <div className="min-h-screen bg-background-primary p-12 space-y-8 animate-pulse">
        <PageContainer narrow className="space-y-8">
            <div className="h-4 w-24 bg-tertiary rounded" />
            <div className="h-12 w-1/3 bg-tertiary rounded" />
            <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-secondary rounded-3xl" />)}
            </div>
            <div className="h-96 bg-secondary rounded-3xl" />
        </PageContainer>
    </div>;
export default SecurityPage;