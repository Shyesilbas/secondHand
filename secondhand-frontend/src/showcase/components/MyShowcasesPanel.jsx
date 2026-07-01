import { useTranslation } from "react-i18next";
import { AlertTriangle, Clock, X, Zap, ShieldAlert, Sparkles, Image as ImageIcon, Filter } from 'lucide-react';
import { formatCurrency, formatDate } from '../../common/formatters.js';
import { useMyShowcases } from '../hooks/useMyShowcases.js';
import ShowcaseModal from './ShowcaseModal.jsx';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { SkeletonGrid, EmptyState } from '../../common/components/ui/index.js';
import { useState, useMemo } from 'react';
const MyShowcasesPanel = ({
  userId
}) => {
  const {
    t
  } = useTranslation();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'expired'
  const [extendDays, setExtendDays] = useState({});
  const [localError, setLocalError] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [activeExtendShowcase, setActiveExtendShowcase] = useState(null); // { id, listingId, listingTitle, days }
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
  const handleExtend = showcaseId => {
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
  const calculateRemainingDays = endDate => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Processed, sorted and categorized showcases
  const processedShowcases = useMemo(() => {
    const now = new Date();
    const items = showcases.map(item => {
      const remaining = calculateRemainingDays(item.endDate);
      const isExpired = new Date(item.endDate) < now || remaining === 0;
      return {
        ...item,
        remaining,
        isExpired
      };
    });

    // Sort: Active ones first (by remaining days ascending, i.e. expiring soonest), then expired ones (by end date descending)
    return items.sort((a, b) => {
      if (a.isExpired && !b.isExpired) return 1;
      if (!a.isExpired && b.isExpired) return -1;
      if (!a.isExpired && !b.isExpired) {
        return a.remaining - b.remaining;
      }
      return new Date(b.endDate) - new Date(a.endDate);
    });
  }, [showcases]);

  // Filtered list based on selected tab
  const filteredShowcases = useMemo(() => {
    if (activeTab === 'active') {
      return processedShowcases.filter(s => !s.isExpired);
    }
    if (activeTab === 'expired') {
      return processedShowcases.filter(s => s.isExpired);
    }
    return processedShowcases;
  }, [processedShowcases, activeTab]);
  const counts = useMemo(() => {
    const active = processedShowcases.filter(s => !s.isExpired).length;
    const expired = processedShowcases.filter(s => s.isExpired).length;
    return {
      all: processedShowcases.length,
      active,
      expired
    };
  }, [processedShowcases]);
  return <div className="bg-background-primary rounded-2xl border border-slate-100 p-6 lg:p-8 mt-8 shadow-sm">
      {/* Top Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("my_showcases")}</h2>
            <span className="inline-flex items-center justify-center bg-indigo-50 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full border border-primary/60 shadow-sm shadow-indigo-100/20">
              {counts.active} / {counts.all}{t("active")}</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{t("manage_and_track_your_active_listing_pro")}</p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 shrink-0 self-start md:self-center">
          {[{
          id: 'all',
          label: 'All',
          count: counts.all
        }, {
          id: 'active',
          label: 'Active',
          count: counts.active
        }, {
          id: 'expired',
          label: 'Expired',
          count: counts.expired
        }].map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-300 flex items-center gap-1.5 ${activeTab === tab.id ? 'text-slate-950 shadow-sm border border-border-light/40' : 'text-slate-400 hover:text-slate-600'}`}>
              {activeTab === tab.id && <motion.div layoutId="activeTabIndicator" className="absolute inset-0 bg-background-primary rounded-xl" transition={{
            type: 'spring',
            stiffness: 380,
            damping: 30
          }} />}
              <span className="relative z-10">{tab.label}</span>
              <span className={`relative z-10 text-[9px] px-1.5 py-0.2 rounded-md ${activeTab === tab.id ? 'bg-slate-100 text-slate-700' : 'bg-slate-200/50 text-slate-400'}`}>
                {tab.count}
              </span>
            </button>)}
        </div>
      </div>

      {actionError && <motion.div initial={{
      opacity: 0,
      y: -10
    }} animate={{
      opacity: 1,
      y: 0
    }} className="mb-6 rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-3.5 text-sm text-rose-700 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">{t("operation_error")}</span>
            <p className="text-rose-600/90 font-medium">{actionError}</p>
          </div>
        </motion.div>}

      {isLoading ? <SkeletonGrid count={2} columns="grid-cols-1 md:grid-cols-2 gap-5" /> : filteredShowcases.length === 0 ? <EmptyState
          icon={Sparkles}
          title={t("no_showcases_found")}
          description={activeTab === 'expired' ? "You don't have any expired promotions. All your showcases are still working hard!" : activeTab === 'active' ? "You don't have any active promotions currently. Boost one of your listings to start selling faster!" : "Promote your items directly to the top rows and category frontpages. Sell up to 5x faster!"}
        /> : <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filteredShowcases.map(showcase => {
        const progress = showcase.isExpired ? 0 : Math.min(100, Math.max(0, showcase.remaining / 30 * 100));
        const thumbUrl = showcase.listing?.imageUrl;
        return <motion.div key={showcase.id} layout className={`group relative bg-background-primary rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${showcase.isExpired ? 'border-slate-100 hover:border-slate-300/80 shadow-sm' : 'border-slate-100 hover:border-primary/80 hover:shadow-sm'}`}>
                {/* Header Section with Thumbnail and Title */}
                <div className="p-5 lg:p-6 flex gap-4">
                  {/* Thumbnail Image Container */}
                  <div className={`w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border relative group-hover:scale-[1.02] transition-transform duration-300 ${showcase.isExpired ? 'bg-slate-50 border-border-light/60 opacity-60' : 'bg-slate-100 border-slate-100'}`}>
                    {thumbUrl ? <img src={thumbUrl} alt="" className={`w-full h-full object-cover ${showcase.isExpired ? 'grayscale' : ''}`} /> : <div className={`w-full h-full flex items-center justify-center ${showcase.isExpired ? 'text-slate-400' : 'text-primary bg-gradient-to-br from-indigo-50 to-violet-50'}`}>
                        <ImageIcon className="w-7 h-7 opacity-60" />
                      </div>}
                    <div className={`absolute top-1 left-1 p-1 rounded-lg text-[9px] font-bold flex items-center justify-center shadow ${showcase.isExpired ? 'bg-text-muted text-white' : 'bg-[#0f111a] text-white'}`}>
                      <Zap className={`w-2.5 h-2.5 fill-current ${showcase.isExpired ? 'text-slate-100' : 'text-amber-400'}`} />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className={`text-sm font-medium text-text-primary truncate transition-colors ${showcase.isExpired ? ' group-' : ' group-'}`} title={showcase.listing?.title}>
                        {showcase.listing?.title || 'Premium Promoted Listing'}
                      </h3>
                      
                      <div className="flex items-center gap-2 mt-1">
                        {showcase.isExpired ? <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-caption font-bold uppercase tracking-wider border border-border-light/50">{t("expired")}</span> : <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-success-bg text-emerald-700 text-caption font-bold uppercase tracking-wider border border-emerald-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-status-success-bg animate-pulse" />{t("live_boosting")}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      {showcase.isExpired ? <span className="font-semibold text-slate-400">{t("ended")}</span> : <span>{t("ends_in")}<strong className="text-slate-950 font-bold">{showcase.remaining}{t("days")}</strong></span>}
                    </div>
                  </div>
                </div>

                {/* Progress bar and details */}
                <div className="px-5 lg:px-6 pb-5 space-y-4">
                  {/* Progress Line */}
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                    <motion.div initial={{
                width: 0
              }} animate={{
                width: `${progress}%`
              }} transition={{
                duration: 1,
                ease: "easeOut"
              }} className={`h-full rounded-full ${showcase.isExpired ? 'bg-slate-200' : showcase.remaining < 4 ? 'bg-gradient-to-r from-orange-500 to-amber-400' : 'bg-gradient-to-r from-indigo-600 to-violet-500'}`} />
                  </div>

                  {/* Financial Metrics */}
                  <div className={`grid grid-cols-2 gap-4 p-3 rounded-2xl border ${showcase.isExpired ? 'bg-slate-50/20 border-slate-100 text-slate-400' : 'bg-slate-50/50 border-slate-100/40'}`}>
                    <div className="flex flex-col">
                      <span className="text-caption uppercase font-bold text-slate-400 tracking-wider">{t("spent_cost")}</span>
                      <span className={`text-sm font-bold mt-0.5 ${showcase.isExpired ? 'text-slate-500' : 'text-text-primary'}`}>
                        {formatCurrency(showcase.totalCost, 'TRY')}
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-border-light/60 pl-4">
                      <span className="text-caption uppercase font-bold text-slate-400 tracking-wider">{t("ended_on")}</span>
                      <span className={`text-xs font-bold mt-1 ${showcase.isExpired ? 'text-slate-400' : 'text-slate-600'}`}>
                        {formatDate(showcase.endDate)}
                      </span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3.5 flex items-center gap-2 border-t border-slate-100">
                    <div className="relative flex-1">
                      <input type="number" min={1} max={30} value={extendDays[showcase.id] ?? 7} onChange={e => setExtendDays(prev => ({
                  ...prev,
                  [showcase.id]: e.target.value
                }))} className={`w-full h-11 border rounded-xl pl-3 pr-12 text-sm font-bold focus:bg-background-primary focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none ${showcase.isExpired ? 'bg-slate-50/40 border-border-light text-slate-600' : 'bg-slate-50 border-border-light/60 text-slate-950'}`} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 uppercase tracking-wider select-none">{t("days")}</span>
                    </div>
                    <button type="button" onClick={() => handleExtend(showcase.id)} disabled={isMutating} className={`h-11 px-5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 tracking-wide uppercase ${showcase.isExpired ? 'bg-primary text-white hover:bg-primary shadow-md shadow-indigo-600/10' : 'bg-slate-950 text-white hover:bg-primary'}`}>
                      {showcase.isExpired ? 'Re-Boost' : 'Extend'}
                    </button>
                    {!showcase.isExpired && <button type="button" onClick={() => setConfirmCancelId(showcase.id)} disabled={isMutating} className="h-11 w-11 flex items-center justify-center rounded-xl border border-border-light/60 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-90" title={t("cancel_showcase")}>
                        <X className="w-5 h-5" />
                      </button>}
                  </div>
                </div>
              </motion.div>;
      })}
        </div>}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmCancelId && <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} onClick={() => setConfirmCancelId(null)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
            <motion.div initial={{
          opacity: 0,
          scale: 0.95,
          y: 20
        }} animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }} exit={{
          opacity: 0,
          scale: 0.95,
          y: 20
        }} className="relative bg-background-primary rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10 border border-slate-100">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-500 border border-rose-100/50">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-medium text-text-primary mb-1.5 tracking-tight">{t("cancel_boosting")}</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-6">{t("are_you_sure_you_want_to_stop_boosting_t")}</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmCancelId(null)} className="flex-1 h-12 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold hover:bg-slate-100 transition-all uppercase tracking-wide border border-slate-100">{t("no_stay")}</button>
                  <button onClick={handleCancel} className="flex-1 h-12 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 uppercase tracking-wide">{t("yes_cancel")}</button>
                </div>
              </div>
            </motion.div>
          </div>}
      </AnimatePresence>

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

      <div className="mt-8 p-4 rounded-2xl bg-indigo-50/50 border border-primary/50 flex items-start gap-3">
        <div className="bg-primary-50/80 p-2 rounded-xl text-primary mt-0.5">
          <Zap className="w-4 h-4 fill-current" />
        </div>
        <div>
          <strong className="text-primary block font-bold uppercase tracking-wider text-caption">{t("showcase_operations_guidelines")}</strong>
          <p className="text-xs text-primary/70 leading-relaxed font-medium mt-0.5">{t("cancelling_active_promotions_stops_visib")}</p>
        </div>
      </div>
    </div>;
};
export default MyShowcasesPanel;