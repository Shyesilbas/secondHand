import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
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
    <div className="min-h-screen bg-slate-50/60 pb-24 text-slate-900 font-sans selection:bg-slate-200">
      
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs">
        <PageContainer className="max-w-[1280px] h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors px-2 py-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("back", "Geri Dön")}</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-extrabold shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] uppercase tracking-wider">{t("system_secure", "Sistem Koruması Aktif")}</span>
          </div>
        </PageContainer>
      </header>

      {/* ── Page Content ── */}
      <PageContainer className="max-w-[1280px] pt-8 sm:pt-10">
        
        {/* Header Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold">
              <ShieldCheck className="w-4 h-4" />
              <span>{t("privacy_protection", "Güvenlik & Gizlilik Merkezi")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t("security_privacy", "Hesap Güvenliği & Denetim Günlüğü")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-medium leading-relaxed">
              {t(
                "keep_track_of_where_you_ve_signed_in_and",
                "Hesabınıza gerçekleştirilen tüm oturum açma, parola değişikliği ve güvenlik aktivitelerini anlık takip edin."
              )}
            </p>
          </div>

          {/* Revoke All Sessions Primary Button */}
          <button
            onClick={() => setShowRevokeModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 px-4.5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>{t("revoke_all_sessions", "Tüm Oturumları Kapat")}</span>
          </button>
        </div>

        {/* Global Error Banner (if any) */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* ── Key Metrics Summary ── */}
        <SecuritySummary totalElements={totalElements} auditLogs={auditLogs} />

        {/* ── Main Activity Feed Container ── */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          
          {/* Card Controls Header */}
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-2xs">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-slate-900 tracking-tight">
                  {t("login_activity", "Güvenlik Hareketleri")}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-black tabular-nums border border-slate-200/60">
                  {totalElements} {t("events", "kayıt")}
                </span>
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                showFilters || hasActiveFilters
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              <span>{showFilters ? t("hide_filters", "Filtreleri Gizle") : t("filter_activity", "Filtrele")}</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
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
            <div className="p-5 border-t border-slate-100 bg-slate-50/50">
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
  <div className="min-h-screen bg-slate-50/60 p-6 sm:p-12 font-sans">
    <PageContainer className="max-w-[1280px] space-y-8 animate-pulse">
      <div className="h-6 w-32 bg-slate-200 rounded-lg" />
      <div className="h-10 w-2/5 bg-slate-200 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-white border border-slate-200/80 rounded-2xl" />
        ))}
      </div>
      <div className="h-96 bg-white border border-slate-200/80 rounded-3xl" />
    </PageContainer>
  </div>
);

export default SecurityPage;