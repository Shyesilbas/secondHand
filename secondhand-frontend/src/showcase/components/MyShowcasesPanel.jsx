import { useTranslation } from "react-i18next";
import { AlertTriangle, Clock, X, Zap, Sparkles, Image as ImageIcon, TrendingUp, Eye, Calendar, DollarSign, RotateCcw, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../../common/formatters.js';
import { useMyShowcases } from '../hooks/useMyShowcases.js';
import ShowcaseModal from './ShowcaseModal.jsx';
import { motion } from 'framer-motion';
import { Button, Modal, SkeletonGrid, EmptyState } from '../../common/components/ui/index.js';
import { useState, useMemo } from 'react';

/* ───────── Circular Progress Ring ───────── */
const ProgressRing = ({ progress, size = 44, stroke = 3.5, isExpired, remaining }) => {
 const radius = (size - stroke) / 2;
 const circumference = 2 * Math.PI * radius;
 const offset = circumference - (progress / 100) * circumference;


 return (
 <div className="relative" style={{ width: size, height: size }}>
 <svg width={size} height={size} className="-rotate-90">
 <circle
 cx={size / 2} cy={size / 2} r={radius}
 fill="none" strokeWidth={stroke}
 className="stroke-secondary-100"
 />
 <motion.circle
 cx={size / 2} cy={size / 2} r={radius}
 fill="none" strokeWidth={stroke}
 className={isExpired ? 'stroke-secondary-400' : remaining < 4 ? 'stroke-status-warning' : 'stroke-primary'}
 strokeLinecap="round"
 strokeDasharray={circumference}
 initial={{ strokeDashoffset: circumference }}
 animate={{ strokeDashoffset: offset }}
 transition={{ duration: 1.2, ease: "easeOut" }}
 />
 </svg>
 <div className="absolute inset-0 flex items-center justify-center">
 <span className={`text-xs font-semibold tabular-nums ${isExpired ? 'text-text-muted' : remaining < 4 ? 'text-status-warning-text' : 'text-text-primary'}`}>
 {isExpired ? '—' : remaining}
 </span>
 </div>
 </div>
 );
};

/* ───────── Status Pill ───────── */
const StatusPill = ({ isExpired, remaining, t }) => {
 if (isExpired) {
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-background-tertiary text-text-tertiary text-xs font-semibold">
 <Clock className="w-3 h-3" />
 {t("expired")}
 </span>
 );
 }

 if (remaining < 4) {
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-background-secondary text-status-warning-text text-xs font-semibold border border-border">
 <AlertTriangle className="w-3 h-3" />
 {t("expiring_soon") || 'Expiring Soon'}
 </span>
 );
 }

 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-background-tertiary text-text-primary text-xs font-semibold border border-border">
 <span className="relative flex h-2 w-2">
 <span className="absolute inline-flex h-full w-full rounded-full bg-secondary-600 opacity-75" />
 <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-hover" />
 </span>
 {t("live_boosting")}
 </span>
 );
};

/* ───────── Main Component ───────── */
const MyShowcasesPanel = ({ userId }) => {
 const { t } = useTranslation();
 const [activeTab, setActiveTab] = useState('all');
 const [extendDays, setExtendDays] = useState({});
 const [localError, setLocalError] = useState(null);
 const [confirmCancelId, setConfirmCancelId] = useState(null);
 const [activeExtendShowcase, setActiveExtendShowcase] = useState(null);

 const {
 showcases,
 isLoading,
 error,
 cancelShowcase,
 isMutating,
 cancelError,
 refresh
 } = useMyShowcases(userId);

 const actionError = localError || cancelError || error;

 const handleExtend = (showcaseId) => {
 const raw = extendDays[showcaseId];
 const parsed = Number.parseInt(raw, 10);
 const days = Number.isFinite(parsed) ? Math.min(30, Math.max(1, parsed)) : 7;
 const showcase = showcases.find(s => s.id === showcaseId);
 if (showcase) {
 setActiveExtendShowcase({
 id: showcaseId,
 listingId: showcase.listing?.id,
 listingTitle: showcase.listing?.title || '',
 days
 });
 }
 };

 const handleCancel = async () => {
 if (!confirmCancelId) return;
 try {
 setLocalError(null);
 await cancelShowcase(confirmCancelId);
 setConfirmCancelId(null);
 } catch (err) {
 setLocalError(err?.response?.data?.message || err?.message || 'Cancel failed');
 setConfirmCancelId(null);
 }
 };

 const calculateRemainingDays = (endDate) => {
 const end = new Date(endDate);
 const now = new Date();
 const diff = end - now;
 return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
 };

 const processedShowcases = useMemo(() => {
 const now = new Date();
 const items = showcases.map(item => {
 const remaining = calculateRemainingDays(item.endDate);
 const isExpired = new Date(item.endDate) < now || remaining === 0;
 return { ...item, remaining, isExpired };
 });

 return items.sort((a, b) => {
 if (a.isExpired && !b.isExpired) return 1;
 if (!a.isExpired && b.isExpired) return -1;
 if (!a.isExpired && !b.isExpired) return a.remaining - b.remaining;
 return new Date(b.endDate) - new Date(a.endDate);
 });
 }, [showcases]);

 const filteredShowcases = useMemo(() => {
 if (activeTab === 'active') return processedShowcases.filter(s => !s.isExpired);
 if (activeTab === 'expired') return processedShowcases.filter(s => s.isExpired);
 return processedShowcases;
 }, [processedShowcases, activeTab]);

 const counts = useMemo(() => {
 const active = processedShowcases.filter(s => !s.isExpired).length;
 const expired = processedShowcases.filter(s => s.isExpired).length;
 return { all: processedShowcases.length, active, expired };
 }, [processedShowcases]);

 /* ── Tab Configuration ── */
 const tabs = [
 { id: 'all', label: t('all') || 'All', count: counts.all, icon: Eye },
 { id: 'active', label: t('active_tab') || 'Active', count: counts.active, icon: TrendingUp },
 { id: 'expired', label: t('expired_tab') || 'Expired', count: counts.expired, icon: Clock },
 ];

 return (
 <div className="bg-background-primary rounded-md border border-border/60 p-6 lg:p-8 mt-8">

 {/* ─── Header ─── */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-7">
 <div>
 <div className="flex items-center gap-3">
 <Zap className="shrink-0 h-5 w-5 text-primary fill-current" strokeWidth={1.5} aria-hidden />
 <div>
 <h2 className="text-base font-semibold text-text-primary tracking-tight">{t("my_showcases")}</h2>
 <p className="text-xs text-text-tertiary mt-0.5 font-medium">{t("manage_and_track_your_active_listing_pro")}</p>
 </div>
 </div>
 </div>

 {/* Stats pills */}
 <div className="flex items-center gap-2 shrink-0">
 <div className="flex items-center gap-1.5 bg-background-tertiary text-text-primary px-3 py-1.5 rounded text-xs font-semibold border border-border">
 <TrendingUp className="w-3.5 h-3.5" />
 <span>{counts.active} {t("active")}</span>
 </div>
 <div className="flex items-center gap-1.5 bg-background-secondary text-text-tertiary px-3 py-1.5 rounded text-xs font-semibold border border-border-light">
 <Clock className="w-3.5 h-3.5" />
 <span>{counts.expired} {t("expired")}</span>
 </div>
 </div>
 </div>

 {/* ─── Tab Row ─── */}
 <div className="flex bg-background-secondary/80 p-1 rounded-md border border-border-light mb-7 w-fit">
 {tabs.map(tab => {
 const Icon = tab.icon;
 const isActive = activeTab === tab.id;
 return (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`relative flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold transition-all duration-300 ${
 isActive
 ? 'text-text-primary'
 : 'text-text-muted hover:text-text-secondary'
 }`}
 >
 {isActive && (
 <motion.div
 layoutId="showcaseTabBg"
 className="absolute inset-0 bg-background-primary rounded border border-border/40"
 transition={{ type: 'spring', stiffness: 400, damping: 30 }}
 />
 )}
 <Icon className={`relative z-10 w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
 <span className="relative z-10">{tab.label}</span>
 <span className={`relative z-10 text-xs min-w-4 text-center px-1.5 py-0.5 rounded-md font-semibold ${
 isActive ? 'bg-primary/10 text-primary' : 'bg-secondary-200/60 text-text-muted'
 }`}>
 {tab.count}
 </span>
 </button>
 );
 })}
 </div>

 {/* ─── Error Banner ─── */}
 {actionError && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className="mb-6 rounded-md border border-border bg-background-secondary/50 px-5 py-4 text-sm text-status-error-text flex items-start gap-3"
 >
 <AlertTriangle className="w-5 h-5 shrink-0 text-status-error mt-0.5" />
 <div>
 <span className="font-semibold block mb-0.5 text-xs">{t("operation_error")}</span>
 <p className="text-status-error-text/90 font-medium text-xs">{actionError}</p>
 </div>
 </motion.div>
 )}

 {/* ─── Content ─── */}
 {isLoading ? (
 <SkeletonGrid count={2} columns="grid-cols-1 md:grid-cols-2 gap-5" />
 ) : filteredShowcases.length === 0 ? (
 <EmptyState
 icon={Sparkles}
 title={t("no_showcases_found")}
 description={
 activeTab === 'expired'
 ? "You don't have any expired promotions. All your showcases are still working hard!"
 : activeTab === 'active'
 ? "You don't have any active promotions currently. Boost one of your listings to start selling faster!"
 : "Promote your items directly to the top rows and category frontpages. Sell up to 5x faster!"
 }
 />
 ) : (
 <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
 {filteredShowcases.map((showcase, idx) => {
 const progress = showcase.isExpired
 ? 0
 : Math.min(100, Math.max(0, (showcase.remaining / 30) * 100));
 const thumbUrl = showcase.listing?.imageUrl;

 return (
 <motion.div
 key={showcase.id}
 layout
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.06, duration: 0.35 }}
 className={`group relative rounded-md border transition-all duration-300 overflow-hidden ${
 showcase.isExpired
 ? 'bg-background-secondary/40 border-border-light hover:border-border'
 : 'bg-background-primary border-border/60 hover:border-primary/40'
 }`}
 >
 {/* ── Top: Image + Info Row ── */}
 <div className="flex gap-4 p-5">
 {/* Thumbnail */}
 <div className={`w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border relative transition-transform duration-300 ${
 showcase.isExpired
 ? 'bg-background-tertiary border-border-light opacity-60'
 : 'bg-background-secondary border-border-light'
 }`}>
 {thumbUrl ? (
 <img
 src={thumbUrl}
 alt=""
 className={`w-full h-full object-cover ${showcase.isExpired ? 'grayscale' : ''}`}
 />
 ) : (
 <div className={`w-full h-full flex items-center justify-center ${
 showcase.isExpired ? 'text-text-muted' : 'text-primary bg-background-secondary'
 }`}>
 <ImageIcon className="w-6 h-6 opacity-50" />
 </div>
 )}
 {/* Boost badge */}
 {!showcase.isExpired && (
 <div className="absolute -top-0.5 -right-0.5 p-1 rounded-bl bg-primary shadow-sm">
 <Zap className="w-2.5 h-2.5 text-status-warning fill-current" />
 </div>
 )}
 </div>

 {/* Middle: Title + Status */}
 <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
 <div>
 <h3
 className="text-sm font-semibold text-text-primary truncate"
 title={showcase.listing?.title}
 >
 {showcase.listing?.title || 'Premium Promoted Listing'}
 </h3>
 <div className="mt-1.5">
 <StatusPill isExpired={showcase.isExpired} remaining={showcase.remaining} t={t} />
 </div>
 </div>
 </div>

 {/* Right: Progress Ring */}
 <div className="flex flex-col items-center justify-center shrink-0">
 <ProgressRing
 progress={progress}
 isExpired={showcase.isExpired}
 remaining={showcase.remaining}
 />
 <span className="text-xs font-semibold text-text-muted mt-1">
 {showcase.isExpired ? t("ended") : t("days")}
 </span>
 </div>
 </div>

 {/* ── Metrics Strip ── */}
 <div className={`mx-5 mb-4 grid grid-cols-2 gap-px rounded overflow-hidden border ${
 showcase.isExpired ? 'border-border-light' : 'border-border/60'
 }`}>
 <div className={`flex items-center gap-2.5 px-3.5 py-3 ${
 showcase.isExpired ? 'bg-background-secondary/60' : 'bg-background-secondary/80'
 }`}>
 <DollarSign className={`w-3.5 h-3.5 shrink-0 ${showcase.isExpired ? 'text-secondary-300' : 'text-text-muted'}`} />
 <div className="min-w-0">
 <div className="text-xs font-semibold text-text-muted">{t("spent_cost")}</div>
 <div className={`text-xs font-semibold mt-0.5 ${showcase.isExpired ? 'text-text-tertiary' : 'text-text-primary'}`}>
 {formatCurrency(showcase.totalCost, 'TRY')}
 </div>
 </div>
 </div>
 <div className={`flex items-center gap-2.5 px-3.5 py-3 border-l ${
 showcase.isExpired ? 'bg-background-secondary/60 border-border-light' : 'bg-background-secondary/80 border-border/60'
 }`}>
 <Calendar className={`w-3.5 h-3.5 shrink-0 ${showcase.isExpired ? 'text-secondary-300' : 'text-text-muted'}`} />
 <div className="min-w-0">
 <div className="text-xs font-semibold text-text-muted">{t("ended_on")}</div>
 <div className={`text-xs font-semibold mt-0.5 ${showcase.isExpired ? 'text-text-muted' : 'text-text-secondary'}`}>
 {formatDate(showcase.endDate)}
 </div>
 </div>
 </div>
 </div>

 {/* ── Action Row ── */}
 <div className="px-5 pb-5">
 <div className={`flex items-center gap-2 p-2 rounded ${
 showcase.isExpired ? 'bg-background-secondary/60 border border-border-light' : 'bg-background-secondary/50 border border-border-light/60'
 }`}>
 <div className="relative flex-1">
 <input
 type="number"
 min={1}
 max={30}
 value={extendDays[showcase.id] ?? 7}
 onChange={e =>
 setExtendDays(prev => ({ ...prev, [showcase.id]: e.target.value }))
 }
 className={`w-full h-10 rounded pl-3 pr-14 text-sm font-semibold outline-none transition-all border focus:border-primary focus:ring-2 focus:ring-primary/10 ${
 showcase.isExpired
 ? 'bg-background-primary border-border text-text-secondary'
 : 'bg-background-primary border-border/60 text-text-primary'
 }`}
 />
 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted select-none pointer-events-none">
 {t("days")}
 </span>
 </div>
 <button
 type="button"
 onClick={() => handleExtend(showcase.id)}
 disabled={isMutating}
 className={`h-10 px-5 rounded text-xs font-semibold transition-all duration-200 disabled:opacity-50 flex items-center gap-1.5 shrink-0 ${
 showcase.isExpired
 ? 'bg-primary text-white hover:bg-primary-hover'
 : 'bg-primary text-white hover:bg-primary-hover'
 }`}
 >
 <RotateCcw className="w-3.5 h-3.5" />
 {showcase.isExpired ? t('re_boost') || 'Re-Boost' : t('extend') || 'Extend'}
 </button>
 {!showcase.isExpired && (
 <button
 type="button"
 onClick={() => setConfirmCancelId(showcase.id)}
 disabled={isMutating}
 className="h-10 w-10 flex items-center justify-center rounded border border-border/60 text-text-muted hover:bg-background-secondary hover:text-status-error hover:border-border transition-all shrink-0"
 title={t("cancel_showcase")}
 >
 <X className="w-4 h-4" />
 </button>
 )}
 </div>
 </div>
 </motion.div>
 );
 })}
 </div>
 )}

 <Modal isOpen={!!confirmCancelId} onClose={() => setConfirmCancelId(null)} title={t("cancel_boosting")} size="sm" footer={<>
 <Button variant="secondary" onClick={() => setConfirmCancelId(null)}>{t("no_stay")}</Button>
 <Button variant="danger" onClick={handleCancel}>{t("yes_cancel")}</Button>
 </>}>
 <p className="text-sm text-text-secondary">{t("are_you_sure_you_want_to_stop_boosting_t")}</p>
 </Modal>

 {/* ─── ShowcaseModal for Extend ─── */}
 {activeExtendShowcase && (
 <ShowcaseModal
 isOpen={!!activeExtendShowcase}
 onClose={() => setActiveExtendShowcase(null)}
 listingId={activeExtendShowcase.listingId}
 listingTitle={activeExtendShowcase.listingTitle}
 isExtension={true}
 showcaseId={activeExtendShowcase.id}
 initialDays={activeExtendShowcase.days}
 onSuccess={() => {
 setActiveExtendShowcase(null);
 refresh();
 }}
 />
 )}

 {/* ─── Info Banner ─── */}
 <div className="mt-7 p-4 rounded-md bg-background-tertiary/50 border border-primary/20 flex items-start gap-3">
 <div className="p-2 rounded bg-primary/10 text-primary shrink-0 mt-0.5">
 <Zap className="w-4 h-4 fill-current" />
 </div>
 <div className="min-w-0">
 <strong className="text-primary block font-semibold text-xs">{t("showcase_operations_guidelines")}</strong>
 <p className="text-xs text-primary/70 leading-relaxed font-medium mt-0.5">{t("cancelling_active_promotions_stops_visib")}</p>
 </div>
 <ChevronRight className="w-4 h-4 text-primary/40 shrink-0 mt-1" />
 </div>
 </div>
 );
};

export default MyShowcasesPanel;