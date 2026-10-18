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
    <div className="border-b border-border-light bg-background-secondary/70 p-5 sm:p-6 transition-all duration-200">
      
      {/* Quick Filter Chips */}
      <div className="mb-5">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-semibold text-text-muted">
            {t("quick_filters", "Hızlı Filtreler")}
          </span>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-status-error-text hover:text-status-error-text transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t("clear_all_filters", "Filtreleri Temizle")}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="p-1 rounded text-text-muted hover:text-text-secondary hover:bg-secondary-200/60 transition-colors cursor-pointer"
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
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
              filters.eventType === 'LOGIN_SUCCESS'
                ? 'bg-primary text-white'
                : 'bg-white border border-border text-text-secondary hover:bg-background-tertiary'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
            <span>{t("successful_logins", "Başarılı Girişler")}</span>
          </button>

          <button
            type="button"
            onClick={() => updateFilter('eventType', 'LOGIN_FAILURE')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
              filters.eventType === 'LOGIN_FAILURE'
                ? 'bg-primary text-white'
                : 'bg-white border border-border text-text-secondary hover:bg-background-tertiary'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-status-error" />
            <span>{t("failed_logins", "Başarısız Girişler")}</span>
          </button>

          <button
            type="button"
            onClick={() => updateFilter('eventType', 'PASSWORD_CHANGE_SUCCESS')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
              filters.eventType === 'PASSWORD_CHANGE_SUCCESS'
                ? 'bg-primary text-white'
                : 'bg-white border border-border text-text-secondary hover:bg-background-tertiary'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-text-primary" />
            <span>{t("password_changes", "Şifre Değişiklikleri")}</span>
          </button>

          <button
            type="button"
            onClick={() => updateFilter('eventStatus', 'SUCCESS')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
              filters.eventStatus === 'SUCCESS'
                ? 'bg-primary text-white'
                : 'bg-white border border-border text-text-secondary hover:bg-background-tertiary'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
            <span>{t("success_events", "Tüm Başarılı Olaylar")}</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-border/70">
        
        {/* Event Type Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-text-muted" />
            <span>{t("event_type", "Olay Türü")}</span>
          </label>
          <select
            value={filters.eventType}
            onChange={(e) => updateFilter('eventType', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium rounded border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer"
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
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-text-muted" />
            <span>{t("event_status", "Olay Durumu")}</span>
          </label>
          <select
            value={filters.eventStatus}
            onChange={(e) => updateFilter('eventStatus', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium rounded border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer"
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
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-text-muted" />
            <span>{t("ip_address", "IP Adresi")}</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={t("search_ip_address", "örn. 192.168.1.1")}
              value={filters.ipAddress}
              onChange={(e) => updateFilter('ipAddress', e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs font-medium rounded border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            />
            <Globe className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Date From */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-text-muted" />
            <span>{t("from_date", "Başlangıç Tarihi")}</span>
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter('dateFrom', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium rounded border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
          >
          </input>
        </div>

        {/* Date To */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-text-muted" />
            <span>{t("to_date", "Bitiş Tarihi")}</span>
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => updateFilter('dateTo', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium rounded border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
          >
          </input>
        </div>

        {/* User Agent / Device Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-text-muted" />
            <span>{t("device_browser", "Cihaz / Tarayıcı")}</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={t("search_browser_device", "örn. Chrome, Mac, Windows")}
              value={filters.userAgent}
              onChange={(e) => updateFilter('userAgent', e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs font-medium rounded border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            />
            <Monitor className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default SecurityFilters;