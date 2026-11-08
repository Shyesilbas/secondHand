import { useTranslation } from 'react-i18next';
import { Activity, AlertTriangle } from 'lucide-react';

const SecuritySummary = ({
  totalElements = 0,
  auditLogs = [],
}) => {
  const { t } = useTranslation();

  const failedAttempts = auditLogs.filter(
    (log) => log.eventType === 'LOGIN_FAILURE' || log.eventStatus === 'FAILURE'
  ).length;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* 1. Total Security Events */}
      <div className="flex items-start justify-between gap-4 rounded border border-border bg-background-primary p-5">
        <div>
          <p className="text-xs font-medium text-text-tertiary">
            {t('total_events', 'Toplam Hareket')}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">
            {totalElements}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {t('recorded_security_events', 'Kayıtlı hesap aktivitesi')}
          </p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border-light bg-background-secondary text-text-secondary">
          <Activity className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        </div>
      </div>

      {/* 2. Failed / Suspicious Attempts */}
      <div className="flex items-start justify-between gap-4 rounded border border-border bg-background-primary p-5">
        <div>
          <p className="text-xs font-medium text-text-tertiary">
            {t('failed_attempts', 'Son Şüpheli Denemeler')}
          </p>
          <p
            className={`mt-1 text-2xl font-semibold tabular-nums ${
              failedAttempts > 0 ? 'text-status-error-text' : 'text-text-primary'
            }`}
          >
            {failedAttempts}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {failedAttempts > 0
              ? t('attention_required', 'Bu sayfadaki kayıtlarda başarısız giriş denemesi var')
              : t('no_failed_attempts', 'Son hareketlerde şüpheli deneme yok')}
          </p>
        </div>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded border ${
            failedAttempts > 0
              ? 'border-status-error-border bg-background-secondary text-status-error-text'
              : 'border-border-light bg-background-secondary text-text-tertiary'
          }`}
        >
          <AlertTriangle className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        </div>
      </div>
    </div>
  );
};

export default SecuritySummary;
