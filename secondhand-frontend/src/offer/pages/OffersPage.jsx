import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {offerService} from '../services/offerService.js';
import {formatCurrency, formatDateTime} from '../../common/formatters.js';
import {ROUTES} from '../../common/constants/routes.js';
import {useNotification} from '../../notification/NotificationContext.jsx';
import CounterOfferModal from '../components/CounterOfferModal.jsx';
import {RefreshCw, CheckCircle2, XCircle, Clock, ShoppingCart, Handshake} from 'lucide-react';

const statusBadge = (status) => {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50/60 text-amber-700 border-amber-200/60';
    case 'ACCEPTED':
      return 'bg-emerald-50/60 text-emerald-700 border-emerald-200/60';
    case 'REJECTED':
      return 'bg-red-50/60 text-red-700 border-red-200/60';
    case 'EXPIRED':
      return 'bg-slate-50/70 text-slate-600 border-slate-200/70';
    case 'COMPLETED':
      return 'bg-indigo-50/60 text-indigo-700 border-indigo-200/60';
    default:
      return 'bg-slate-50/60 text-slate-600 border-slate-200/60';
  }
};

const OffersPage = () => {
  const notification = useNotification();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('made');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [made, setMade] = useState([]);
  const [received, setReceived] = useState([]);
  const [counterTarget, setCounterTarget] = useState(null);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [m, r] = await Promise.all([offerService.listMade(), offerService.listReceived()]);
      setMade(Array.isArray(m) ? m : []);
      setReceived(Array.isArray(r) ? r : []);
    } catch (e) {
      setMade([]);
      setReceived([]);
      setError(e?.response?.data?.message || 'Failed to load offers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const items = useMemo(() => {
    return activeTab === 'received' ? received : made;
  }, [activeTab, made, received]);

  const handleAccept = async (offerId) => {
    try {
      await offerService.accept(offerId);
      notification?.showSuccess('Successful', 'Offer accepted');
      await refresh();
    } catch (e) {
      notification?.showError('Error', e?.response?.data?.message || 'Failed to accept offer');
    }
  };

  const handleReject = async (offerId) => {
    try {
      await offerService.reject(offerId);
      notification?.showSuccess('Successful', 'Offer rejected');
      await refresh();
    } catch (e) {
      notification?.showError('Error', e?.response?.data?.message || 'Failed to reject offer');
    }
  };

  const handleCheckout = (offerId) => {
    navigate(`${ROUTES.CHECKOUT}?offerId=${offerId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-sm sm:text-base font-semibold tracking-tight text-slate-900">Offers</h1>
            {items.length > 0 && (
              <p className="mt-0.5 text-[11px] text-slate-500 tracking-tight">
                {activeTab === 'made' ? 'Offers you made' : 'Offers you received'} • {items.length} total
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:border-slate-300 disabled:opacity-60"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="mb-5 rounded-3xl bg-white/80 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.05)] border border-slate-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('made')}
                className={`relative inline-flex items-center justify-center rounded-xl px-3.5 py-1.5 text-xs font-medium tracking-tight transition-all ${
                  activeTab === 'made'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-slate-400" />
                Made
                <span className="ml-1.5 text-[11px] text-slate-400">{made.length}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('received')}
                className={`relative inline-flex items-center justify-center rounded-xl px-3.5 py-1.5 text-xs font-medium tracking-tight transition-all ${
                  activeTab === 'received'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-slate-400" />
                Received
                <span className="ml-1.5 text-[11px] text-slate-400">{received.length}</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-500 tracking-tight">
              {activeTab === 'made'
                ? 'Track offers you send to other sellers.'
                : 'Review and respond to incoming offers.'}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white/90 p-4 sm:p-6 border border-slate-100 shadow-[0_22px_60px_rgba(15,23,42,0.05)]">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-slate-100/60 border border-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200/80 bg-red-50/70 px-4 py-3">
              <p className="text-xs font-medium text-red-700 tracking-tight">{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500/10 via-sky-500/10 to-emerald-500/10">
                <Handshake className="h-7 w-7 text-indigo-500" />
              </div>
              <h2 className="text-sm sm:text-base font-semibold tracking-tight text-slate-900">
                No {activeTab === 'made' ? 'offers made' : 'offers received'} yet
              </h2>
              <p className="mt-2 max-w-sm text-xs sm:text-sm text-slate-500 tracking-tight">
                Start negotiating prices to unlock better deals on high quality items.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((o) => {
                const currency = 'TRY';
                const isExpired = o.status === 'EXPIRED';
                const canActAsSeller = !isExpired && activeTab === 'received' && o.status === 'PENDING';
                const canCheckout = !isExpired && activeTab === 'made' && o.status === 'ACCEPTED';
                const personName = activeTab === 'made'
                  ? `${o.sellerName || ''} ${o.sellerSurname || ''}`.trim() || '—'
                  : `${o.buyerName || ''} ${o.buyerSurname || ''}`.trim() || '—';

                return (
                  <div
                    key={o.id}
                    className={`rounded-3xl border border-slate-200/60 bg-white px-4 py-4 sm:px-5 sm:py-4 shadow-sm transition-all hover:shadow-[0_24px_70px_rgba(15,23,42,0.07)] ${
                      isExpired ? 'opacity-60 grayscale' : ''
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold tracking-tight text-slate-900">
                              {o.listingTitle || 'Listing'}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500 tracking-tight">
                              {activeTab === 'made' ? 'To' : 'From'} {personName}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-tight ${statusBadge(
                              o.status
                            )}`}
                          >
                            <Clock className="h-3 w-3" />
                            {o.status}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                              Total offer
                            </div>
                            <div className="mt-1 flex items-baseline gap-1.5">
                              <span className="font-mono text-2xl font-black tracking-tighter text-indigo-600">
                                {formatCurrency(o.totalPrice, currency)}
                              </span>
                            </div>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                              Quantity and unit
                            </div>
                            <div className="mt-1 text-xs text-slate-600">
                              {o.quantity} × {formatCurrency(o.listingUnitPrice, currency)}
                            </div>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                              Timeline
                            </div>
                            <div className="mt-1 text-xs text-slate-600">
                              <span>
                                {o.createdAt ? formatDateTime(o.createdAt) : '—'}
                              </span>
                              <span className="mx-1 text-slate-400">→</span>
                              <span className={isExpired ? 'text-red-600 font-medium' : ''}>
                                {o.expiresAt ? formatDateTime(o.expiresAt) : '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 md:flex-col md:items-end md:gap-2">
                        {isExpired ? (
                          <span className="text-[11px] font-medium text-slate-500 tracking-tight">
                            Offer expired
                          </span>
                        ) : canCheckout ? (
                          <button
                            type="button"
                            onClick={() => handleCheckout(o.id)}
                            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold tracking-tight text-white shadow-sm hover:bg-indigo-700"
                          >
                            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                            Checkout
                          </button>
                        ) : canActAsSeller ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleAccept(o.id)}
                              className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold tracking-tight text-emerald-700 hover:bg-emerald-500/15"
                            >
                              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => setCounterTarget(o)}
                              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium tracking-tight text-slate-700 hover:border-slate-300"
                            >
                              Counter
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(o.id)}
                              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium tracking-tight text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <XCircle className="mr-1.5 h-3.5 w-3.5" />
                              Reject
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CounterOfferModal
        isOpen={!!counterTarget}
        onClose={() => setCounterTarget(null)}
        offer={counterTarget}
        onSuccess={refresh}
      />
    </div>
  );
};

export default OffersPage;

