import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditLogsPagination } from '../hooks/useAuditLogsPagination.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { authService } from '../../auth/services/authService.js';
import {
  ArrowLeft,
  LogOut,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Activity
} from 'lucide-react';
import SecuritySummary from '../components/SecuritySummary.jsx';
import SecurityFilters from '../components/SecurityFilters.jsx';
import SecurityActivityList from '../components/SecurityActivityList.jsx';
import PaginationControls from '../components/PaginationControls.jsx';
import LogDetailModal from '../components/LogDetailModal.jsx';
import RevokeSessionsModal from '../components/RevokeSessionsModal.jsx';
import logger from '../../common/utils/logger.js';

const SecurityPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthState();
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
    } catch (err) {
      logger.error('Failed to revoke sessions:', err);
    } finally {
      setIsRevoking(false);
    }
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-background-secondary/60 pb-24 text-text-primary font-sans selection:bg-secondary-200">
      
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-30 bg-background-primary border-b border-border/80">
        <PageContainer className="max-w-7xl h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-semibold text-text-tertiary hover:text-text-primary transition-colors px-2 py-1.5 rounded hover:bg-background-tertiary cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("back", "Geri Dön")}</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-sm bg-background-secondary border border-border/80 text-status-success-text text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success"></span>
            </span>
            <span className="text-xs">{t("system_secure", "Sistem Koruması Aktif")}</span>
          </div>
        </PageContainer>
      </header>

      {/* ── Page Content ── */}
      <PageContainer className="max-w-7xl pt-8 sm:pt-10">
        
        {/* Header Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-background-secondary border border-border-light text-text-primary text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>{t("privacy_protection", "Güvenlik & Gizlilik Merkezi")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight">
              {t("security_privacy", "Hesap Güvenliği & Denetim Günlüğü")}
            </h1>
            <p className="text-xs sm:text-sm text-text-tertiary max-w-2xl font-medium leading-relaxed">
              {t(
                "keep_track_of_where_you_ve_signed_in_and",
                "Hesabınıza gerçekleştirilen tüm oturum açma, parola değişikliği ve güvenlik aktivitelerini anlık takip edin."
              )}
            </p>
          </div>

          {/* Revoke All Sessions Primary Button */}
          <button
            onClick={() => setShowRevokeModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-white border border-border text-status-error-text hover:bg-background-secondary hover:border-border px-4.5 py-2.5 rounded-md font-semibold text-xs transition-all cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>{t("revoke_all_sessions", "Tüm Oturumları Kapat")}</span>
          </button>
        </div>

        {/* Global Error Banner (if any) */}
        {error && (
          <div className="mb-6 p-4 bg-background-secondary border border-border rounded-md flex items-center gap-3 text-status-error-text text-xs font-semibold">
            <ShieldAlert className="w-5 h-5 text-status-error-text shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* ── Key Metrics Summary ── */}
        <SecuritySummary totalElements={totalElements} auditLogs={auditLogs} />

        {/* ── Main Activity Feed Container ── */}
        <div className="bg-white rounded-md border border-border/90 overflow-hidden">
          
          {/* Card Controls Header */}
          <div className="px-6 py-4.5 border-b border-border-light flex items-center justify-between gap-4 flex-wrap bg-white">
            <div className="flex items-center gap-2.5">
              <Activity className="h-5 w-5 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-text-primary tracking-tight">
                  {t("login_activity", "Güvenlik Hareketleri")}
                </h2>
                <span className="px-2 py-0.5 rounded-sm bg-background-tertiary text-text-secondary text-xs font-semibold tabular-nums border border-border/60">
                  {totalElements} {t("events", "kayıt")}
                </span>
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                showFilters || hasActiveFilters
                  ? 'bg-primary text-white'
                  : 'bg-background-tertiary text-text-secondary hover:bg-secondary-200 border border-border/60'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              <span>{showFilters ? t("hide_filters", "Filtreleri Gizle") : t("filter_activity", "Filtrele")}</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-secondary-300 animate-pulse" />
              )}
            </button>
          </div>

          {/* Collapsible Filter Drawer */}
          <SecurityFilters
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
            auditEnums={auditEnums}
          />

          {/* Activity Events List */}
          <SecurityActivityList
            auditLogs={auditLogs}
            totalElements={totalElements}
            setSelectedLog={setSelectedLog}
            getEventTypeDisplay={getEventTypeDisplay}
            getEventStatusColor={getEventStatusColor}
            getBrowserInfo={getBrowserInfo}
            getLocationFromIP={getLocationFromIP}
          />

          {/* Pagination Controls */}
          {shouldShowPagination && (
            <div className="p-5 border-t border-border-light bg-background-secondary/50">
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
          )}
        </div>

      </PageContainer>

      {/* ── Modals ── */}
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
  <div className="min-h-screen bg-background-secondary/60 p-6 sm:p-12 font-sans">
    <PageContainer className="max-w-7xl space-y-8 animate-pulse">
      <div className="h-6 w-32 bg-secondary-200 rounded" />
      <div className="h-10 w-2/5 bg-secondary-200 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-white border border-border/80 rounded-md" />
        ))}
      </div>
      <div className="h-96 bg-white border border-border/80 rounded-md" />
    </PageContainer>
  </div>
);

export default SecurityPage;