import {AlertTriangle, Clock, X, Zap} from 'lucide-react';
import {formatCurrency, formatDate} from '../../common/formatters.js';
import {useMyShowcases} from '../hooks/useMyShowcases.js';
import {AnimatePresence, motion} from 'framer-motion';
import { useState } from 'react';

const MyShowcasesPanel = ({ userId }) => {
  const [extendDays, setExtendDays] = useState({});
  const [localError, setLocalError] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  const {
    showcases,
    isLoading,
    error,
    extendShowcase,
    cancelShowcase,
    isMutating,
    extendError,
    cancelError,
  } = useMyShowcases(userId);

  const actionError = localError || extendError || cancelError || error;

  const handleExtend = async (showcaseId) => {
    const raw = extendDays[showcaseId];
    const parsed = Number.parseInt(raw, 10);
    const days = Number.isFinite(parsed) ? Math.min(30, Math.max(1, parsed)) : 7;
    try {
      setLocalError(null);
      await extendShowcase(showcaseId, days);
    } catch (err) {
      setLocalError(err?.response?.data?.message || err?.message || 'Extend failed');
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

  return (
    <div className="bg-white rounded-[32px] border border-gray-200/60 p-6 lg:p-8 mt-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            My Showcases
            <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full border border-indigo-100">
              {showcases.length}
            </span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage your active listing promotions.</p>
        </div>
      </div>

      {actionError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-red-100 bg-red-50/50 px-4 py-3 text-sm text-red-600 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="font-medium">{actionError}</p>
        </motion.div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-[24px] bg-gray-50 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : showcases.length === 0 ? (
        <div className="text-center py-16 bg-gray-50/50 rounded-[24px] border border-dashed border-gray-200">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
            <Zap className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-gray-900 font-bold mb-1">Boost Your Sales</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">Promote your listings to reach more buyers and sell faster.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {showcases.map((showcase) => {
            const remaining = calculateRemainingDays(showcase.endDate);
            const progress = Math.min(100, Math.max(0, (remaining / 30) * 100)); // assuming 30 days max
            
            return (
              <motion.div 
                key={showcase.id} 
                layout
                className="group relative bg-white rounded-[24px] border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden"
              >
                <div className="p-5 lg:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {showcase.listing?.title || 'Premium Listing'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Status</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Active</span>
                      </div>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                      <Zap className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Ends in</span>
                      </div>
                      <span className="font-bold text-gray-900">{remaining} days left</span>
                    </div>

                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${remaining < 3 ? 'bg-orange-500' : 'bg-indigo-500'}`}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">Investment</span>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(showcase.totalCost, 'TRY')}</span>
                      </div>
                      <div className="h-8 w-px bg-gray-100" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">Valid Until</span>
                        <span className="text-sm font-bold text-gray-600">{formatDate(showcase.endDate)}</span>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center gap-2 border-t border-gray-50">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={extendDays[showcase.id] ?? 7}
                          onChange={(e) => setExtendDays((prev) => ({ ...prev, [showcase.id]: e.target.value }))}
                          className="w-full h-10 bg-gray-50 border border-gray-100 rounded-xl px-3 text-sm font-bold text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">Days</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleExtend(showcase.id)}
                        disabled={isMutating}
                        className="h-10 px-5 rounded-xl bg-[#0f111a] text-white text-sm font-bold hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
                      >
                        Extend
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmCancelId(showcase.id)}
                        disabled={isMutating}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                        title="Cancel Showcase"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmCancelId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmCancelId(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <X className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Showcase?</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  Are you sure you want to end this showcase? This action will remove the listing from premium areas.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmCancelId(null)}
                    className="flex-1 h-12 rounded-2xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition-all"
                  >
                    No, stay
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 h-12 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                  >
                    Yes, cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-8 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 flex items-start gap-3">
        <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600 mt-0.5">
          <Zap className="w-4 h-4" />
        </div>
        <p className="text-xs text-indigo-900/70 leading-relaxed font-medium">
          <strong className="text-indigo-900 block mb-0.5 font-bold uppercase tracking-wider text-[10px]">Information</strong>
          Cancelling a showcase only ends visibility. The refund process follows the platform&apos;s standard billing cycle. Extend operations apply immediately upon success.
        </p>
      </div>
    </div>
  );
};

export default MyShowcasesPanel;
