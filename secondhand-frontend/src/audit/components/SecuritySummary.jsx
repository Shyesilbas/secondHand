import React from 'react';
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
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              {t("total_events", "Toplam Hareket")}
            </p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {totalElements}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {t("recorded_security_events", "Kayıtlı hesap aktivitesi")}
            </p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Successful Logins */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              {t("successful_logins", "Başarılı Girişler")}
            </p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 tabular-nums">
              {successfulLogins}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {t("verified_access_count", "Onaylı oturum açma")}
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Failed / Suspicious Attempts */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              {t("failed_attempts", "Başarısız Denemeler")}
            </p>
            <p className={`text-2xl sm:text-3xl font-black tabular-nums ${failedAttempts > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {failedAttempts}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {failedAttempts > 0
                ? t("attention_required", "İncelemeniz önerilir")
                : t("no_failed_attempts", "Şüpheli deneme yok")}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xs shrink-0 ${
            failedAttempts > 0
              ? 'bg-rose-50 border border-rose-100 text-rose-600'
              : 'bg-slate-100 border border-slate-200 text-slate-500'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySummary;