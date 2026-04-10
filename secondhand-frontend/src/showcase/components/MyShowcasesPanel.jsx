import React, { useMemo, useState } from 'react';
import { CalendarDays, Coins, Package } from 'lucide-react';
import { formatCurrency, formatDate } from '../../common/formatters.js';
import { useMyShowcases } from '../hooks/useMyShowcases.js';

const MyShowcasesPanel = ({ userId }) => {
  const [extendDays, setExtendDays] = useState({});
  const [localError, setLocalError] = useState(null);
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

  const showcaseRows = useMemo(
    () =>
      showcases.map((showcase) => ({
        id: showcase.id,
        title: showcase.listing?.title || 'Listing',
        price: formatCurrency(showcase.totalCost, 'TRY'),
        startDate: formatDate(showcase.startDate),
        endDate: formatDate(showcase.endDate),
      })),
    [showcases]
  );

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

  const handleCancel = async (showcaseId) => {
    try {
      setLocalError(null);
      await cancelShowcase(showcaseId);
    } catch (err) {
      setLocalError(err?.response?.data?.message || err?.message || 'Cancel failed');
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-gray-200 p-6 lg:p-8 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">My Showcases</h2>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : showcaseRows.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No active showcases.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden">
          {showcaseRows.map((row) => (
            <div key={row.id} className="p-4 lg:p-5 bg-white">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm lg:text-base font-semibold text-gray-900 truncate">{row.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-emerald-600" />
                      Paid: <strong className="text-gray-900">{row.price}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
                      {row.startDate} - {row.endDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={extendDays[row.id] ?? 7}
                    onChange={(e) => setExtendDays((prev) => ({ ...prev, [row.id]: e.target.value }))}
                    className="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleExtend(row.id)}
                    disabled={isMutating}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Extend
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancel(row.id)}
                    disabled={isMutating}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-gray-500">
        Cancel only ends visibility. Refund process is handled in backend flow.
      </p>
    </div>
  );
};

export default MyShowcasesPanel;

