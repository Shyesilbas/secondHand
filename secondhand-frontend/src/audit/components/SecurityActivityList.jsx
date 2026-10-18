import { useTranslation } from "react-i18next";
import {
  MapPin,
  LogIn,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Key,
  KeyRound,
  Shield,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  ChevronRight
} from 'lucide-react';
import { formatDateTime } from '../../common/formatters.js';

/* ── Helper: Render Event Icon ────────────────────────────── */

const renderEventIcon = (eventType, eventStatus) => {
  if (eventStatus === 'FAILURE' || eventType === 'LOGIN_FAILURE') {
    return <ShieldAlert className="w-5 h-5 text-status-error-text" />;
  }
  switch (eventType) {
    case 'LOGIN_SUCCESS':
      return <LogIn className="w-5 h-5 text-status-success-text" />;
    case 'LOGOUT':
      return <LogOut className="w-5 h-5 text-text-secondary" />;
    case 'PASSWORD_CHANGE_SUCCESS':
      return <Key className="w-5 h-5 text-text-primary" />;
    case 'PASSWORD_CHANGE_FAILURE':
      return <KeyRound className="w-5 h-5 text-status-error-text" />;
    default:
      return <Shield className="w-5 h-5 text-text-primary" />;
  }
};

/* ── Helper: Detect Device Icon ───────────────────────────── */

const renderDeviceIcon = (userAgent = '') => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('iphone') || ua.includes('android')) {
    return <Smartphone className="w-3.5 h-3.5 text-text-muted" />;
  }
  if (ua.includes('ipad') || ua.includes('tablet')) {
    return <Tablet className="w-3.5 h-3.5 text-text-muted" />;
  }
  if (ua.includes('macintosh') || ua.includes('mac os')) {
    return <Laptop className="w-3.5 h-3.5 text-text-muted" />;
  }
  return <Monitor className="w-3.5 h-3.5 text-text-muted" />;
};

/* ── Helper: Status Badge Styling ─────────────────────────── */

const getStatusBadge = (status) => {
  switch (status) {
    case 'SUCCESS':
      return {
        label: 'Başarılı',
        className: 'bg-background-secondary text-status-success-text border-border'
      };
    case 'FAILURE':
      return {
        label: 'Başarısız',
        className: 'bg-background-secondary text-status-error-text border-border'
      };
    case 'ATTEMPT':
      return {
        label: 'Deneme',
        className: 'bg-background-secondary text-status-warning-text border-border'
      };
    default:
      return {
        label: status || 'Bilinmiyor',
        className: 'bg-background-tertiary text-text-secondary border-border'
      };
  }
};

const SecurityActivityList = ({
  auditLogs = [],
  setSelectedLog,
  getEventTypeDisplay,
  getBrowserInfo,
  getLocationFromIP
}) => {
  const { t } = useTranslation();

  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="p-12 text-center bg-white flex flex-col items-center justify-center">
        <ShieldCheck className="mb-4 h-5 w-5 shrink-0 text-text-primary" strokeWidth={1.5} aria-hidden />
        <h3 className="text-base font-semibold text-text-primary mb-1">
          {t("no_security_events_found", "Güvenlik Olayı Bulunamadı")}
        </h3>
        <p className="text-xs text-text-tertiary max-w-sm leading-relaxed font-medium">
          {t("no_security_events_desc", "Seçili filtrelere uygun veya kayıtlı herhangi bir güvenlik hareketi bulunamadı.")}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border-light bg-white">
      {auditLogs.map((log, index) => {
        const statusBadge = getStatusBadge(log.eventStatus);
        const isFailure = log.eventStatus === 'FAILURE' || log.eventType?.includes('FAILURE');
        const browserDetails = getBrowserInfo(log.userAgent);
        const locationDetails = getLocationFromIP(log.ipAddress);

        return (
          <div
            key={log.id || index}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedLog(log)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedLog(log);
              }
            }}
            className={`group p-4 sm:p-5 hover:bg-background-secondary/80 transition-all cursor-pointer flex items-start gap-4 focus:outline-none focus-visible:bg-background-secondary ${
              isFailure ? 'bg-background-secondary/20' : ''
            }`}
          >
            {/* Event Icon Bubble */}
            <div
              className={`w-11 h-11 rounded-md flex items-center justify-center shrink-0 border transition-transform ${
                isFailure
                  ? 'bg-background-secondary border-border'
                  : 'bg-background-secondary border-border/80'
              }`}
            >
              {renderEventIcon(log.eventType, log.eventStatus)}
            </div>

            {/* Event Core Information */}
            <div className="flex-1 min-w-0">
              {/* Header Line: Title, Status, Timestamp */}
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-text-primary tracking-tight">
                    {getEventTypeDisplay(log.eventType)}
                  </h4>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${statusBadge.className}`}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                <span className="text-xs font-semibold text-text-muted tabular-nums shrink-0">
                  {formatDateTime(log.createdAt)}
                </span>
              </div>

              {/* Message / Details */}
              {log.details && (
                <p className="text-xs text-text-secondary font-medium mb-2.5 leading-relaxed line-clamp-2">
                  {log.details}
                </p>
              )}

              {/* Device & Network Meta Chips */}
              <div className="flex items-center flex-wrap gap-2 text-xs text-text-tertiary font-medium pt-0.5">
                {/* Device & Browser */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-background-tertiary text-text-secondary text-xs font-medium border border-border/60 max-w-72 truncate">
                  {renderDeviceIcon(log.userAgent)}
                  <span className="truncate">{browserDetails}</span>
                </div>

                {/* IP & Location */}
                {locationDetails && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-background-tertiary text-text-secondary text-xs font-mono border border-border/60">
                    <MapPin className="w-3 h-3 text-text-muted shrink-0" />
                    <span>{locationDetails}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Action Chevron */}
            <div className="self-center pl-2 text-secondary-300 group-hover:text-text-secondary transition-all shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SecurityActivityList;