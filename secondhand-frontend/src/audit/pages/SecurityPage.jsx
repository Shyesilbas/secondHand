import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditLogsPagination } from '../hooks/useAuditLogsPagination.js';
import { useAuth, useAuthState } from '../../auth/AuthContext.jsx';
import { authService } from '../../auth/services/authService.js';
import {
  ArrowLeft,
  LogOut,
  SlidersHorizontal,
  Activity,
} from 'lucide-react';
import SecuritySummary from '../components/SecuritySummary.jsx';
import SecurityDevices from '../components/SecurityDevices.jsx';
import SecurityFilters from '../components/SecurityFilters.jsx';
import SecurityActivityList from '../components/SecurityActivityList.jsx';
import PaginationControls from '../components/PaginationControls.jsx';
import LogDetailModal from '../components/LogDetailModal.jsx';
import RevokeSessionsModal from '../components/RevokeSessionsModal.jsx';
import Alert from '../../common/components/ui/Alert.jsx';
import Button from '../../common/components/ui/Button.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import logger from '../../common/utils/logger.js';
import { ROUTES } from '@/common/constants/routes';

const SecurityPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthState();
  const { logout } = useAuth();
  const [selectedLog, setSelectedLog] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const {
    auditLogs,
    rawAuditLogs,
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
    auditEnums,
  } = useAuditLogsPagination(user?.email, 10);

  const handleRevokeAllSessions = async () => {
    setIsRevoking(true);
    try {
      await authService.revokeAllSessions();
      setShowRevokeModal(false);
      await logout();
      navigate(ROUTES.LOGIN);
    } catch (err) {
      logger.error('Failed to revoke sessions:', err);
    } finally {
      setIsRevoking(false);
    }
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-background-secondary pb-20 text-text-primary">
      <PageContainer className="py-6 sm:py-10">
        <div className="mb-4">
          <Button variant="ghost" size="sm" className="-ml-3" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            <span>{t('back', 'Geri Dön')}</span>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
              {t('security_privacy', 'Hesap Güvenliği & Denetim Günlüğü')}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-text-secondary">
              {t(
                'keep_track_of_where_you_ve_signed_in_and',
                'Hesabınıza gerçekleştirilen oturum açma, parola değişikliği ve güvenlik aktivitelerini takip edin.'
              )}
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowRevokeModal(true)}
            className="shrink-0 text-status-error-text hover:text-status-error-text"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            <span>{t('revoke_all_sessions', 'Tüm Oturumları Kapat')}</span>
          </Button>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} />
          </div>
        )}

        {/* Key Metrics Summary */}
        <SecuritySummary totalElements={totalElements} auditLogs={rawAuditLogs || auditLogs} />

        {/* Recognized Devices & Current Session */}
        <SecurityDevices
          auditLogs={rawAuditLogs || auditLogs}
          activeUserAgentFilter={filters.userAgent}
          onFilterByDevice={(ua) => updateFilter('userAgent', ua)}
        />

        {/* Main Activity Feed Container */}
        <div className="overflow-hidden rounded border border-border bg-background-primary">
          {/* Card Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-light px-5 py-4">
            <div className="flex items-center gap-2.5">
              <Activity className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
              <h2 className="text-sm font-semibold text-text-primary">
                {t('login_activity', 'Güvenlik Hareketleri')}
              </h2>
              <span className="rounded-sm border border-border-light bg-background-secondary px-2 py-0.5 text-xs font-medium tabular-nums text-text-secondary">
                {totalElements} {t('events', 'kayıt')}
              </span>
            </div>

            <Button
              variant={showFilters || hasActiveFilters ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              <span>{showFilters ? t('hide_filters', 'Filtreleri Gizle') : t('filter_activity', 'Filtrele')}</span>
              {hasActiveFilters && (
                <span className="h-1.5 w-1.5 rounded-full bg-status-warning" aria-hidden />
              )}
            </Button>
          </div>

          {/* Collapsible Filter Panel */}
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
            <div className="border-t border-border-light bg-background-secondary/50 p-4">
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

      {/* Modals */}
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
  <div className="min-h-screen bg-background-secondary pb-20">
    <PageContainer className="space-y-6 py-6 sm:py-10">
      <Skeleton className="h-6 w-24" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-96 w-full" />
    </PageContainer>
  </div>
);

export default SecurityPage;
