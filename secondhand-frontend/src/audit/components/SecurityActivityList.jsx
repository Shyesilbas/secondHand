import { useTranslation } from 'react-i18next';
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
  ChevronRight,
} from 'lucide-react';
import { formatDateTime } from '../../common/formatters.js';
import EmptyState from '../../common/components/ui/EmptyState.jsx';

const renderEventIcon = (eventType, eventStatus) => {
  if (eventStatus === 'FAILURE' || eventType === 'LOGIN_FAILURE') {
    return <ShieldAlert className="h-4 w-4 text-status-error-text" strokeWidth={1.5} aria-hidden />;
  }
  switch (eventType) {
    case 'LOGIN_SUCCESS':
      return <LogIn className="h-4 w-4 text-status-success-text" strokeWidth={1.5} aria-hidden />;
    case 'LOGOUT':
      return <LogOut className="h-4 w-4 text-text-secondary" strokeWidth={1.5} aria-hidden />;
    case 'PASSWORD_CHANGE_SUCCESS':
      return <Key className="h-4 w-4 text-text-primary" strokeWidth={1.5} aria-hidden />;
    case 'PASSWORD_CHANGE_FAILURE':
      return <KeyRound className="h-4 w-4 text-status-error-text" strokeWidth={1.5} aria-hidden />;
    default:
      return <Shield className="h-4 w-4 text-text-secondary" strokeWidth={1.5} aria-hidden />;
  }
};

const renderDeviceIcon = (userAgent = '') => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('iphone') || ua.includes('android')) {
    return <Smartphone className="h-3.5 w-3.5 text-text-tertiary" strokeWidth={1.5} aria-hidden />;
  }
  if (ua.includes('ipad') || ua.includes('tablet')) {
    return <Tablet className="h-3.5 w-3.5 text-text-tertiary" strokeWidth={1.5} aria-hidden />;
  }
  if (ua.includes('macintosh') || ua.includes('mac os')) {
    return <Laptop className="h-3.5 w-3.5 text-text-tertiary" strokeWidth={1.5} aria-hidden />;
  }
  return <Monitor className="h-3.5 w-3.5 text-text-tertiary" strokeWidth={1.5} aria-hidden />;
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'SUCCESS':
      return {
        label: 'Başarılı',
        dotClass: 'bg-status-success',
        textClass: 'text-status-success-text',
      };
    case 'FAILURE':
      return {
        label: 'Başarısız',
        dotClass: 'bg-status-error',
        textClass: 'text-status-error-text',
      };
    case 'ATTEMPT':
      return {
        label: 'Deneme',
        dotClass: 'bg-status-warning',
        textClass: 'text-status-warning-text',
      };
    default:
      return {
        label: status || 'Bilinmiyor',
        dotClass: 'bg-text-muted',
        textClass: 'text-text-secondary',
      };
  }
};

const SecurityActivityList = ({
  auditLogs = [],
  setSelectedLog,
  getEventTypeDisplay,
  getBrowserInfo,
  getLocationFromIP,
}) => {
  const { t } = useTranslation();

  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          size="compact"
          icon={ShieldCheck}
          title={t('no_security_events_found', 'Güvenlik olayı bulunamadı')}
          description={t(
            'no_security_events_desc',
            'Seçili filtrelere uygun veya kayıtlı herhangi bir güvenlik hareketi bulunamadı.'
          )}
        />
      </div>
    );
  }

  return (
    <div className="divide-y divide-border-light bg-background-primary">
      {auditLogs.map((log, index) => {
        const statusBadge = getStatusBadge(log.eventStatus);
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
            className="group flex cursor-pointer items-center justify-between gap-4 px-5 py-3.5 transition-colors duration-150 hover:bg-background-secondary focus:outline-none focus-visible:bg-background-secondary"
          >
            <div className="flex min-w-0 flex-1 items-start gap-3.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border-light bg-background-secondary">
                {renderEventIcon(log.eventType, log.eventStatus)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <h4 className="text-sm font-medium text-text-primary">
                    {getEventTypeDisplay(log.eventType)}
                  </h4>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusBadge.textClass}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dotClass}`} aria-hidden />
                    {statusBadge.label}
                  </span>
                </div>

                {log.details && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-text-secondary">
                    {log.details}
                  </p>
                )}

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-tertiary">
                  <span className="inline-flex items-center gap-1.5 truncate">
                    {renderDeviceIcon(log.userAgent)}
                    <span className="truncate">{browserDetails}</span>
                  </span>
                  {locationDetails && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1 font-mono">
                        <MapPin className="h-3 w-3 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
                        <span>{locationDetails}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <span className="text-xs tabular-nums text-text-tertiary">
                {formatDateTime(log.createdAt)}
              </span>
              <ChevronRight
                className="h-4 w-4 text-text-muted opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                strokeWidth={1.5}
                aria-hidden
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SecurityActivityList;
