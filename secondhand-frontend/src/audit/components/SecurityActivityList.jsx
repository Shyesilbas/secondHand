import React from 'react';
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
    return <ShieldAlert className="w-5 h-5 text-rose-600" />;
  }
  switch (eventType) {
    case 'LOGIN_SUCCESS':
      return <LogIn className="w-5 h-5 text-emerald-600" />;
    case 'LOGOUT':
      return <LogOut className="w-5 h-5 text-slate-600" />;
    case 'PASSWORD_CHANGE_SUCCESS':
      return <Key className="w-5 h-5 text-indigo-600" />;
    case 'PASSWORD_CHANGE_FAILURE':
      return <KeyRound className="w-5 h-5 text-rose-600" />;
    default:
      return <Shield className="w-5 h-5 text-indigo-600" />;
  }
};

/* ── Helper: Detect Device Icon ───────────────────────────── */

const renderDeviceIcon = (userAgent = '') => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('iphone') || ua.includes('android')) {
    return <Smartphone className="w-3.5 h-3.5 text-slate-400" />;
  }
  if (ua.includes('ipad') || ua.includes('tablet')) {
    return <Tablet className="w-3.5 h-3.5 text-slate-400" />;
  }
  if (ua.includes('macintosh') || ua.includes('mac os')) {
    return <Laptop className="w-3.5 h-3.5 text-slate-400" />;
  }
  return <Monitor className="w-3.5 h-3.5 text-slate-400" />;
};

/* ── Helper: Status Badge Styling ─────────────────────────── */

const getStatusBadge = (status) => {
  switch (status) {
    case 'SUCCESS':
      return {
        label: 'Başarılı',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    case 'FAILURE':
      return {
        label: 'Başarısız',
        className: 'bg-rose-50 text-rose-700 border-rose-200'
      };
    case 'ATTEMPT':
      return {
        label: 'Deneme',
        className: 'bg-amber-50 text-amber-700 border-amber-200'
      };
    default:
      return {
        label: status || 'Bilinmiyor',
        className: 'bg-slate-100 text-slate-700 border-slate-200'
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
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          {t("no_security_events_found", "Güvenlik Olayı Bulunamadı")}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed font-medium">
          {t("no_security_events_desc", "Seçili filtrelere uygun veya kayıtlı herhangi bir güvenlik hareketi bulunamadı.")}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 bg-white">
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
            className={`group p-4 sm:p-5 hover:bg-slate-50/80 transition-all cursor-pointer flex items-start gap-4 focus:outline-none focus-visible:bg-slate-50 ${
              isFailure ? 'bg-rose-50/20' : ''
            }`}
          >
            {/* Event Icon Bubble */}
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs transition-transform group-hover:scale-105 ${
                isFailure
                  ? 'bg-rose-50 border-rose-100'
                  : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              {renderEventIcon(log.eventType, log.eventStatus)}
            </div>

            {/* Event Core Information */}
            <div className="flex-1 min-w-0">
              {/* Header Line: Title, Status, Timestamp */}
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-black text-slate-900 tracking-tight">
                    {getEventTypeDisplay(log.eventType)}
                  </h4>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border shadow-2xs ${statusBadge.className}`}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-slate-400 tabular-nums shrink-0">
                  {formatDateTime(log.createdAt)}
                </span>
              </div>

              {/* Message / Details */}
              {log.details && (
                <p className="text-xs text-slate-600 font-medium mb-2.5 leading-relaxed line-clamp-2">
                  {log.details}
                </p>
              )}

              {/* Device & Network Meta Chips */}
              <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 font-medium pt-0.5">
                {/* Device & Browser */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60 max-w-[280px] truncate">
                  {renderDeviceIcon(log.userAgent)}
                  <span className="truncate">{browserDetails}</span>
                </div>

                {/* IP & Location */}
                {locationDetails && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-mono border border-slate-200/60">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{locationDetails}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Action Chevron */}
            <div className="self-center pl-2 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SecurityActivityList;