import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const SecuritySummary = ({
  totalElements = 0,
  auditLogs = []
}) => {
  const { t } = useTranslation();

  const successfulLogins = auditLogs.filter(log => log.eventType === 'LOGIN_SUCCESS').length;
  const failedAttempts = auditLogs.filter(log => log.eventType === 'LOGIN_FAILURE' || log.eventStatus === 'FAILURE').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {/* 1. Total Security Events */}
      <div className="bg-white rounded-md border border-border/80 p-5 hover:border-card-border-hover transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted mb-1">
              {t("total_events", "Toplam Hareket")}
            </p>
            <p className="text-2xl sm:text-3xl font-semibold text-text-primary tabular-nums">
              {totalElements}
            </p>
            <p className="text-xs text-text-tertiary font-medium mt-1">
              {t("recorded_security_events", "Kayıtlı hesap aktivitesi")}
            </p>
          </div>
          <ShieldCheck className="shrink-0 h-5 w-5 text-text-primary" strokeWidth={1.5} aria-hidden />
        </div>
      </div>

      {/* 2. Successful Logins */}
      <div className="bg-white rounded-md border border-border/80 p-5 hover:border-card-border-hover transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted mb-1">
              {t("successful_logins", "Başarılı Girişler")}
            </p>
            <p className="text-2xl sm:text-3xl font-semibold text-status-success-text tabular-nums">
              {successfulLogins}
            </p>
            <p className="text-xs text-text-tertiary font-medium mt-1">
              {t("verified_access_count", "Onaylı oturum açma")}
            </p>
          </div>
          <CheckCircle2 className="shrink-0 h-5 w-5 text-status-success-text" strokeWidth={1.5} aria-hidden />
        </div>
      </div>

      {/* 3. Failed / Suspicious Attempts */}
      <div className="bg-white rounded-md border border-border/80 p-5 hover:border-card-border-hover transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted mb-1">
              {t("failed_attempts", "Başarısız Denemeler")}
            </p>
            <p className={`text-2xl sm:text-3xl font-semibold tabular-nums ${failedAttempts > 0 ? 'text-status-error-text' : 'text-text-primary'}`}>
              {failedAttempts}
            </p>
            <p className="text-xs text-text-tertiary font-medium mt-1">
              {failedAttempts > 0
                ? t("attention_required", "İncelemeniz önerilir")
                : t("no_failed_attempts", "Şüpheli deneme yok")}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-md flex items-center justify-center shrink-0 ${
            failedAttempts > 0
              ? 'bg-background-secondary border border-border text-status-error-text'
              : 'bg-background-tertiary border border-border text-text-tertiary'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySummary;