import React from 'react';
import { useTranslation } from "react-i18next";
import {
  Calendar,
  CheckCircle2,
  Globe,
  Monitor,
  RotateCcw,
  Shield,
  X
} from 'lucide-react';

const SecurityFilters = ({
  filters,
  hasActiveFilters,
  showFilters,
  setShowFilters,
  updateFilter,
  clearFilters,
  auditEnums
}) => {
  const { t } = useTranslation();

  if (!showFilters) {
    return null;
  }

  return (
    <div className="border-b border-slate-100 bg-slate-50/70 p-5 sm:p-6 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
      
      {/* Quick Filter Chips */}
      <div className="mb-5">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            {t("quick_filters", "Hızlı Filtreler")}
          </span>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t("clear_all_filters", "Filtreleri Temizle")}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title={t("close", "Kapat")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateFilter('eventType', 'LOGIN_SUCCESS')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filters.eventType === 'LOGIN_SUCCESS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t("successful_logins", "Başarılı Girişler")}</span>
          </button>

          <button
            type="button"
            onClick={() => updateFilter('eventType', 'LOGIN_FAILURE')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filters.eventType === 'LOGIN_FAILURE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-rose-500" />
            <span>{t("failed_logins", "Başarısız Girişler")}</span>
          </button>

          <button
            type="button"
            onClick={() => updateFilter('eventType', 'PASSWORD_CHANGE_SUCCESS')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filters.eventType === 'PASSWORD_CHANGE_SUCCESS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t("password_changes", "Şifre Değişiklikleri")}</span>
          </button>

          <button
            type="button"
            onClick={() => updateFilter('eventStatus', 'SUCCESS')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filters.eventStatus === 'SUCCESS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t("success_events", "Tüm Başarılı Olaylar")}</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-200/70">
        
        {/* Event Type Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>{t("event_type", "Olay Türü")}</span>
          </label>
          <select
            value={filters.eventType}
            onChange={(e) => updateFilter('eventType', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all cursor-pointer shadow-2xs"
          >
            <option value="">{t("all_event_types", "Tüm Olay Türleri")}</option>
            {auditEnums?.eventTypes?.map((eventType) => (
              <option key={eventType.value} value={eventType.value}>
                {eventType.displayName}
              </option>
            ))}
          </select>
        </div>

        {/* Event Status Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{t("event_status", "Olay Durumu")}</span>
          </label>
          <select
            value={filters.eventStatus}
            onChange={(e) => updateFilter('eventStatus', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all cursor-pointer shadow-2xs"
          >
            <option value="">{t("all_statuses", "Tüm Durumlar")}</option>
            {auditEnums?.eventStatuses?.map((eventStatus) => (
              <option key={eventStatus.value} value={eventStatus.value}>
                {eventStatus.displayName}
              </option>
            ))}
          </select>
        </div>

        {/* IP Address Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{t("ip_address", "IP Adresi")}</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={t("search_ip_address", "örn. 192.168.1.1")}
              value={filters.ipAddress}
              onChange={(e) => updateFilter('ipAddress', e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-2xs"
            />
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Date From */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{t("from_date", "Başlangıç Tarihi")}</span>
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter('dateFrom', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-2xs"
          >
          </input>
        </div>

        {/* Date To */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{t("to_date", "Bitiş Tarihi")}</span>
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => updateFilter('dateTo', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-2xs"
          >
          </input>
        </div>

        {/* User Agent / Device Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-slate-400" />
            <span>{t("device_browser", "Cihaz / Tarayıcı")}</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={t("search_browser_device", "örn. Chrome, Mac, Windows")}
              value={filters.userAgent}
              onChange={(e) => updateFilter('userAgent', e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-2xs"
            />
            <Monitor className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default SecurityFilters;