import { useTranslation } from 'react-i18next';
import { Card } from '../../common/components/ui/index.js';

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
      <Card shadow={false}>
        <div>
          <p className="text-sm font-medium text-text-tertiary">
            {t('total_events', 'Toplam Hareket')}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">
            {totalElements}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {t('recorded_security_events', 'Kayıtlı hesap aktivitesi')}
          </p>
        </div>
      </Card>

      {/* 2. Failed / Suspicious Attempts */}
      <Card shadow={false}>
        <div>
          <p className="text-sm font-medium text-text-tertiary">
            {t('failed_attempts', 'Son Şüpheli Denemeler')}
          </p>
          <p
            className={`mt-1 text-2xl font-semibold tabular-nums ${failedAttempts > 0 ? 'text-status-error-text' : 'text-text-primary'
              }`}
          >
            {failedAttempts}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {failedAttempts > 0
              ? t('attention_required', 'Bu sayfadaki kayıtlarda başarısız giriş denemesi var')
              : t('no_failed_attempts', 'Son hareketlerde şüpheli deneme yok')}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SecuritySummary;
