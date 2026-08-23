import { useTranslation } from "react-i18next";
import { AlertTriangle, Clock, X, Zap, ShieldAlert, Sparkles, Image as ImageIcon, TrendingUp, Eye, Calendar, DollarSign, RotateCcw, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../../common/formatters.js';
import { useMyShowcases } from '../hooks/useMyShowcases.js';
import ShowcaseModal from './ShowcaseModal.jsx';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { SkeletonGrid, EmptyState } from '../../common/components/ui/index.js';
import { useState, useMemo } from 'react';

/* ───────── Circular Progress Ring ───────── */
const ProgressRing = ({ progress, size = 44, stroke = 3.5, isExpired, remaining }) => {
 const radius = (size - stroke) / 2;
 const circumference = 2 * Math.PI * radius;
 const offset = circumference - (progress / 100) * circumference;

 const gradientId = `ring-grad-${remaining}`;

 return (
 <div className="relative" style={{ width: size, height: size }}>
 <svg width={size} height={size} className="-rotate-90">
 <circle
 cx={size / 2} cy={size / 2} r={radius}
 fill="none" strokeWidth={stroke}
 className="stroke-slate-100"
 />
 <defs>
 <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
 {isExpired ? (
 <>
 <stop offset="0%" stopColor="#cbd5e1" />
 <stop offset="100%" stopColor="#94a3b8" />
 </>
 ) : remaining < 4 ? (
 <>
 <stop offset="0%" stopColor="#f97316" />
 <stop offset="100%" stopColor="#f59e0b" />
 </>
 ) : (
 <>
 <stop offset="0%" stopColor="#6366f1" />
 <stop offset="100%" stopColor="#8b5cf6" />
 </>
 )}
 </linearGradient>
 </defs>
 <motion.circle
 cx={size / 2} cy={size / 2} r={radius}
 fill="none" strokeWidth={stroke}
 stroke={`url(#${gradientId})`}
 strokeLinecap="round"
 strokeDasharray={circumference}
 initial={{ strokeDashoffset: circumference }}
 animate={{ strokeDashoffset: offset }}
 transition={{ duration: 1.2, ease: "easeOut" }}
 />
 </svg>
 <div className="absolute inset-0 flex items-center justify-center">
 <span className={`text-[11px] font-extrabold tabular-nums ${isExpired ? 'text-slate-400' : remaining < 4 ? 'text-orange-600' : 'text-slate-900'}`}>
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
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
 <Clock className="w-3 h-3" />
 {t("expired")}
 </span>
 );
 }

 if (remaining < 4) {
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-100">
 <AlertTriangle className="w-3 h-3" />
 {t("expiring_soon") || 'Expiring Soon'}
 </span>
 );
 }

 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-900 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
 <span className="relative flex h-2 w-2">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-600 opacity-75" />
 <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-800" />
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
 <div className="bg-background-primary rounded-3xl border border-slate-200/60 p-6 lg:p-8 mt-8 shadow-sm">

 {/* ─── Header ─── */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-7">
 <div>
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 rounded-2xl bg-slate-100 text-primary flex items-center justify-center border border-primary/10 shrink-0">
 <Zap className="w-5 h-5 fill-current" />
 </div>
 <div>
 <h2 className="text-base font-bold text-text-primary tracking-tight">{t("my_showcases")}</h2>
 <p className="text-xs text-slate-500 mt-0.5 font-medium">{t("manage_and_track_your_active_listing_pro")}</p>
 </div>
 </div>
 </div>

 {/* Stats pills */}
 <div className="flex items-center gap-2 shrink-0">
 <div className="flex items-center gap-1.5 bg-slate-100 text-slate-900 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-slate-200">
 <TrendingUp className="w-3.5 h-3.5" />
 <span>{counts.active} {t("active")}</span>
 </div>
 <div className="flex items-center gap-1.5 bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-slate-100">
 <Clock className="w-3.5 h-3.5" />
 <span>{counts.expired} {t("expired")}</span>
 </div>
 </div>
 </div>

 {/* ─── Tab Row ─── */}
 <div className="flex bg-slate-50/80 p-1 rounded-2xl border border-slate-100 mb-7 w-fit">
 {tabs.map(tab => {
 const Icon = tab.icon;
 const isActive = activeTab === tab.id;
 return (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-300 ${
 isActive
 ? 'text-text-primary shadow-sm'
 : 'text-slate-400 hover:text-slate-600'
 }`}
 >
 {isActive && (
 <motion.div
 layoutId="showcaseTabBg"
 className="absolute inset-0 bg-background-primary rounded-xl border border-slate-200/40"
 transition={{ type: 'spring', stiffness: 400, damping: 30 }}
 />
 )}
 <Icon className={`relative z-10 w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
 <span className="relative z-10">{tab.label}</span>
 <span className={`relative z-10 text-[9px] min-w-[18px] text-center px-1.5 py-0.5 rounded-md font-extrabold ${
 isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200/60 text-slate-400'
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
 className="mb-6 rounded-2xl border border-rose-100 bg-rose-50/50 px-5 py-4 text-sm text-rose-700 flex items-start gap-3 shadow-sm"
 >
 <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
 <div>
 <span className="font-bold block mb-0.5 text-xs uppercase tracking-wider">{t("operation_error")}</span>
 <p className="text-rose-600/90 font-medium text-xs">{actionError}</p>
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
 className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden ${
 showcase.isExpired
 ? 'bg-slate-50/40 border-slate-100 hover:border-slate-200'
 : 'bg-background-primary border-slate-200/60 hover:border-primary/40 hover:shadow-md'
 }`}
 >
 {/* ── Top: Image + Info Row ── */}
 <div className="flex gap-4 p-5">
 {/* Thumbnail */}
 <div className={`w-[72px] h-[72px] rounded-2xl overflow-hidden flex-shrink-0 border relative transition-transform duration-300 group-hover:scale-[1.03] ${
 showcase.isExpired
 ? 'bg-slate-100 border-slate-100 opacity-60'
 : 'bg-slate-50 border-slate-100 shadow-sm'
 }`}>
 {thumbUrl ? (
 <img
 src={thumbUrl}
 alt=""
 className={`w-full h-full object-cover ${showcase.isExpired ? 'grayscale' : ''}`}
 />
 ) : (
 <div className={`w-full h-full flex items-center justify-center ${
 showcase.isExpired ? 'text-slate-400' : 'text-primary bg-gradient-to-br from-indigo-50 to-violet-50'
 }`}>
 <ImageIcon className="w-6 h-6 opacity-50" />
 </div>
 )}
 {/* Boost badge */}
 {!showcase.isExpired && (
 <div className="absolute -top-0.5 -right-0.5 p-1 rounded-bl-lg bg-slate-900 shadow-sm">
 <Zap className="w-2.5 h-2.5 text-amber-400 fill-current" />
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
 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">
 {showcase.isExpired ? t("ended") : t("days")}
 </span>
 </div>
 </div>

 {/* ── Metrics Strip ── */}
 <div className={`mx-5 mb-4 grid grid-cols-2 gap-px rounded-xl overflow-hidden border ${
 showcase.isExpired ? 'border-slate-100' : 'border-slate-200/60'
 }`}>
 <div className={`flex items-center gap-2.5 px-3.5 py-3 ${
 showcase.isExpired ? 'bg-slate-50/60' : 'bg-slate-50/80'
 }`}>
 <DollarSign className={`w-3.5 h-3.5 shrink-0 ${showcase.isExpired ? 'text-slate-300' : 'text-slate-400'}`} />
 <div className="min-w-0">
 <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t("spent_cost")}</div>
 <div className={`text-xs font-bold mt-0.5 ${showcase.isExpired ? 'text-slate-500' : 'text-text-primary'}`}>
 {formatCurrency(showcase.totalCost, 'TRY')}
 </div>
 </div>
 </div>
 <div className={`flex items-center gap-2.5 px-3.5 py-3 border-l ${
 showcase.isExpired ? 'bg-slate-50/60 border-slate-100' : 'bg-slate-50/80 border-slate-200/60'
 }`}>
 <Calendar className={`w-3.5 h-3.5 shrink-0 ${showcase.isExpired ? 'text-slate-300' : 'text-slate-400'}`} />
 <div className="min-w-0">
 <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t("ended_on")}</div>
 <div className={`text-xs font-bold mt-0.5 ${showcase.isExpired ? 'text-slate-400' : 'text-slate-600'}`}>
 {formatDate(showcase.endDate)}
 </div>
 </div>
 </div>
 </div>

 {/* ── Action Row ── */}
 <div className="px-5 pb-5">
 <div className={`flex items-center gap-2 p-2 rounded-xl ${
 showcase.isExpired ? 'bg-slate-50/60 border border-slate-100' : 'bg-slate-50/50 border border-slate-100/60'
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
 className={`w-full h-10 rounded-xl pl-3 pr-14 text-sm font-bold outline-none transition-all border focus:border-primary focus:ring-2 focus:ring-primary/10 ${
 showcase.isExpired
 ? 'bg-background-primary border-slate-200 text-slate-600'
 : 'bg-background-primary border-slate-200/60 text-slate-900'
 }`}
 />
 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 uppercase tracking-wider select-none pointer-events-none">
 {t("days")}
 </span>
 </div>
 <button
 type="button"
 onClick={() => handleExtend(showcase.id)}
 disabled={isMutating}
 className={`h-10 px-5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 tracking-wide uppercase flex items-center gap-1.5 shrink-0 ${
 showcase.isExpired
 ? 'bg-primary text-white hover:bg-primary-hover shadow-sm shadow-slate-900/10'
 : 'bg-slate-900 text-white hover:bg-slate-800'
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
 className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200/60 text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all active:scale-90 shrink-0"
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

 {/* ─── Confirmation Modal ─── */}
 <AnimatePresence>
 {confirmCancelId && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setConfirmCancelId(null)}
 className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
 />
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="relative bg-background-primary rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden z-10 border border-slate-100"
 >
 <div className="p-8 text-center">
 <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-500 border border-rose-100/50">
 <ShieldAlert className="w-8 h-8" />
 </div>
 <h3 className="text-sm font-semibold text-text-primary mb-1.5 tracking-tight">{t("cancel_boosting")}</h3>
 <p className="text-slate-500 text-xs leading-relaxed mb-6">{t("are_you_sure_you_want_to_stop_boosting_t")}</p>
 <div className="flex gap-3">
 <button
 onClick={() => setConfirmCancelId(null)}
 className="flex-1 h-12 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold hover:bg-slate-100 transition-all uppercase tracking-wide border border-slate-100"
 >
 {t("no_stay")}
 </button>
 <button
 onClick={handleCancel}
 className="flex-1 h-12 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 uppercase tracking-wide"
 >
 {t("yes_cancel")}
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

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
 <div className="mt-7 p-4 rounded-2xl bg-slate-100/50 border border-primary/20 flex items-start gap-3">
 <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
 <Zap className="w-4 h-4 fill-current" />
 </div>
 <div className="min-w-0">
 <strong className="text-primary block font-bold uppercase tracking-wider text-[10px]">{t("showcase_operations_guidelines")}</strong>
 <p className="text-xs text-primary/70 leading-relaxed font-medium mt-0.5">{t("cancelling_active_promotions_stops_visib")}</p>
 </div>
 <ChevronRight className="w-4 h-4 text-primary/40 shrink-0 mt-1" />
 </div>
 </div>
 );
};

export default MyShowcasesPanel;