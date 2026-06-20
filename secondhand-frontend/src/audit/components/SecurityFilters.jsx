import { useTranslation } from "react-i18next";
const SecurityFilters = ({
  filters,
  hasActiveFilters,
  showFilters,
  setShowFilters,
  updateFilter,
  clearFilters,
  auditEnums,
  totalElements,
  onRevokeSessions
}) => {
  const {
    t
  } = useTranslation();
  return <div className="mb-10 bg-background-primary rounded-2xl border border-border-light shadow-sm overflow-hidden">
            <div className="px-6 py-5 bg-secondary border-b border-border-light">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-text-primary">{t("filters")}</h3>
                            <p className="text-sm text-text-secondary">{t("filter_your_security_events")}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        {hasActiveFilters && <button onClick={clearFilters} className="flex items-center px-4 py-2 text-sm font-medium text-text-secondary bg-tertiary rounded-xl hover:bg-tertiary transition-colors">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>{t("clear")}</button>}
                        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                            </svg>
                            {showFilters ? 'Hide' : 'Show'}{t("filters")}</button>
                        <button onClick={onRevokeSessions} className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>{t("revoke_sessions")}</button>
                    </div>
                </div>
            </div>

            {showFilters && <div className="p-6 bg-background-primary">
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-text-primary mb-4">{t("quick_filters")}</h4>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => updateFilter('eventType', 'LOGIN_SUCCESS')} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${filters.eventType === 'LOGIN_SUCCESS' ? 'bg-gray-900 text-white' : 'bg-tertiary text-text-secondary hover:bg-tertiary'}`}>{t("successful_logins")}</button>
                            <button onClick={() => updateFilter('eventType', 'LOGIN_FAILURE')} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${filters.eventType === 'LOGIN_FAILURE' ? 'bg-gray-900 text-white' : 'bg-tertiary text-text-secondary hover:bg-tertiary'}`}>{t("failed_logins")}</button>
                            <button onClick={() => updateFilter('eventType', 'PASSWORD_CHANGE_SUCCESS')} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${filters.eventType === 'PASSWORD_CHANGE_SUCCESS' ? 'bg-gray-900 text-white' : 'bg-tertiary text-text-secondary hover:bg-tertiary'}`}>{t("password_changes")}</button>
                            <button onClick={() => updateFilter('eventStatus', 'SUCCESS')} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${filters.eventStatus === 'SUCCESS' ? 'bg-gray-900 text-white' : 'bg-tertiary text-text-secondary hover:bg-tertiary'}`}>{t("success_events")}</button>
                        </div>
                    </div>

                    {/* Advanced Filters Grid */}
                    <div className="space-y-6">
                        {/* Row 1: Event Type & Event Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-text-secondary">
                                    <svg className="w-4 h-4 mr-2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>{t("event_type")}</label>
                                <select value={filters.eventType} onChange={e => updateFilter('eventType', e.target.value)} className="w-full px-4 py-2.5 border border-border-DEFAULT rounded-xl bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all">
                                    <option value="">{t("all_event_types")}</option>
                                    {auditEnums?.eventTypes?.map(eventType => <option key={eventType.value} value={eventType.value}>
                                            {eventType.displayName}
                                        </option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-text-secondary">
                                    <svg className="w-4 h-4 mr-2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>{t("event_status")}</label>
                                <select value={filters.eventStatus} onChange={e => updateFilter('eventStatus', e.target.value)} className="w-full px-4 py-2.5 border border-border-DEFAULT rounded-xl bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all">
                                    <option value="">{t("all_statuses")}</option>
                                    {auditEnums?.eventStatuses?.map(eventStatus => <option key={eventStatus.value} value={eventStatus.value}>
                                            {eventStatus.displayName}
                                        </option>)}
                                </select>
                            </div>
                        </div>

                        {/* Row 2: Date Range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-text-secondary">
                                    <svg className="w-4 h-4 mr-2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>{t("from_date")}</label>
                                <input type="date" value={filters.dateFrom} onChange={e => updateFilter('dateFrom', e.target.value)} className="w-full px-4 py-2.5 border border-border-DEFAULT rounded-xl bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-text-secondary">
                                    <svg className="w-4 h-4 mr-2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>{t("to_date")}</label>
                                <input type="date" value={filters.dateTo} onChange={e => updateFilter('dateTo', e.target.value)} className="w-full px-4 py-2.5 border border-border-DEFAULT rounded-xl bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" />
                            </div>
                        </div>

                        {/* Row 3: IP Address & User Agent */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-text-secondary">
                                    <svg className="w-4 h-4 mr-2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>{t("ip_address")}</label>
                                <div className="relative">
                                    <input type="text" placeholder={t("search_ip_address")} value={filters.ipAddress} onChange={e => updateFilter('ipAddress', e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-border-DEFAULT rounded-xl bg-background-primary text-text-primary placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" />
                                    <svg className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-text-secondary">
                                    <svg className="w-4 h-4 mr-2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>{t("browser_device")}</label>
                                <div className="relative">
                                    <input type="text" placeholder={t("search_browser")} value={filters.userAgent} onChange={e => updateFilter('userAgent', e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-border-DEFAULT rounded-xl bg-background-primary text-text-primary placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" />
                                    <svg className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {hasActiveFilters && <div className="mt-6 p-4 bg-secondary border border-border-light rounded-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span className="text-sm font-medium text-text-primary">{t("filter_results")}</span>
                                </div>
                                <span className="text-sm font-semibold text-text-primary">
                                    {totalElements}{t("events")}</span>
                            </div>
                        </div>}
                </div>}
        </div>;
};
export default SecurityFilters;