import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { formatDateTime } from '../../common/formatters.js';
import {
  X,
  Clock,
  MapPin,
  Monitor,
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check
} from 'lucide-react';

const LogDetailModal = ({
  selectedLog,
  setSelectedLog,
  getEventTypeDisplay,
  getBrowserInfo
}) => {
  const { t } = useTranslation();
  const [copiedIp, setCopiedIp] = useState(false);

  if (!selectedLog) {
    return null;
  }

  const handleCopyIp = () => {
    if (selectedLog.ipAddress && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(selectedLog.ipAddress);
      setCopiedIp(true);
      setTimeout(() => setCopiedIp(false), 2000);
    }
  };

  const isSuccess = selectedLog.eventStatus === 'SUCCESS';
  const isFailure = selectedLog.eventStatus === 'FAILURE' || selectedLog.eventType?.includes('FAILURE');

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => setSelectedLog(null)}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xs border ${
              isFailure
                ? 'bg-rose-50 border-rose-100 text-rose-600'
                : 'bg-indigo-50 border-indigo-100 text-indigo-600'
            }`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                {t("event_details", "Güvenlik Hareketi Detayı")}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {t("security_activity_information", "Aktivite kaydı ve teknik sistem bilgileri")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedLog(null)}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label={t("close", "Kapat")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Top Status & Type Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                {t("event_type", "Olay Türü")}
              </label>
              <p className="text-sm font-black text-slate-900">
                {getEventTypeDisplay(selectedLog.eventType)}
              </p>
            </div>
            <div className="text-right">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                {t("status", "Durum")}
              </label>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border shadow-2xs ${
                isSuccess
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isFailure
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {isSuccess ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isFailure ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                <span>{selectedLog.eventStatus}</span>
              </span>
            </div>
          </div>

          {/* Details Row (if exists) */}
          {selectedLog.details && (
            <div className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200/60">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                {t("details", "Açıklama / Mesaj")}
              </label>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {selectedLog.details}
              </p>
            </div>
          )}

          {/* Key-Value Technical Grid */}
          <div className="space-y-2.5">
            {/* Timestamp */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-100 text-xs">
              <span className="flex items-center gap-2 font-bold text-slate-500">
                <Clock className="w-4 h-4 text-slate-400" />
                {t("date_time", "Tarih ve Saat")}
              </span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {formatDateTime(selectedLog.createdAt)}
              </span>
            </div>

            {/* IP Address */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-100 text-xs">
              <span className="flex items-center gap-2 font-bold text-slate-500">
                <MapPin className="w-4 h-4 text-slate-400" />
                {t("ip_address", "IP Adresi")}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900">
                  {selectedLog.ipAddress || 'Bilinmiyor'}
                </span>
                {selectedLog.ipAddress && (
                  <button
                    type="button"
                    onClick={handleCopyIp}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="IP Adresini Kopyala"
                  >
                    {copiedIp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Device & Browser */}
            <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white border border-slate-100 text-xs">
              <span className="flex items-center gap-2 font-bold text-slate-500 shrink-0">
                <Monitor className="w-4 h-4 text-slate-400" />
                {t("device_browser", "Cihaz & Tarayıcı")}
              </span>
              <span className="font-medium text-slate-900 text-right">
                {getBrowserInfo(selectedLog.userAgent)}
              </span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedLog(null)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-95"
          >
            {t("close", "Kapat")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogDetailModal;