import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {offerService} from '../services/offerService.js';
import {formatCurrency, formatDateTime} from '../../common/formatters.js';
import {ROUTES} from '../../common/constants/routes.js';
import {useNotification} from '../../notification/NotificationContext.jsx';
import CounterOfferModal from '../components/CounterOfferModal.jsx';

const statusBadge = (status) => {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'ACCEPTED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'REJECTED':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'EXPIRED':
      return 'bg-gray-50 text-gray-700 border-gray-200';
    case 'COMPLETED':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
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
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Offers</h1>
            <p className="text-gray-600 mt-1">Offers you made and offers you received.</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('made')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
              activeTab === 'made' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Offers I Made
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
              activeTab === 'received' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Offers I Received
          </button>
        </div>

        {isLoading && (
          <div className="text-sm text-gray-600">Loading…</div>
        )}

        {!isLoading && error && (
          <div className="text-sm text-red-600 font-semibold">{error}</div>
        )}

        {!isLoading && !error && items.length === 0 && (
          <div className="text-sm text-gray-600">No offers yet.</div>
        )}

        {!isLoading && !error && items.length > 0 && (
          <div className="space-y-3">
            {items.map((o) => {
              const currency = 'TRY';
              const isExpired = o.status === 'EXPIRED';
              const canActAsSeller = !isExpired && activeTab === 'received' && o.status === 'PENDING';
              const canCheckout = !isExpired && activeTab === 'made' && o.status === 'ACCEPTED';

              return (
                <div key={o.id} className="border border-gray-200 rounded-2xl p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-semibold text-gray-900 truncate">{o.listingTitle || 'Listing'}</div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusBadge(o.status)}`}>
                          {o.status}
                        </span>
                        {o.createdBy && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-gray-50 text-gray-700 border-gray-200">
                            {o.createdBy}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                        <div>
                          Quantity: <span className="font-semibold text-gray-900">{o.quantity}</span>
                        </div>
                        <div>
                          Unit Price: <span className="font-semibold text-gray-900">{formatCurrency(o.listingUnitPrice, currency)}</span>
                        </div>
                        <div>
                          Total: <span className="font-semibold text-gray-900">{formatCurrency(o.totalPrice, currency)}</span>
                        </div>
                        <div>
                          Created: <span className="font-semibold text-gray-900">{o.createdAt ? formatDateTime(o.createdAt) : '—'}</span>
                        </div>
                        <div>
                          Expires: <span className="font-semibold text-gray-900">{o.expiresAt ? formatDateTime(o.expiresAt) : '—'}</span>
                        </div>
                      </div>

                      {activeTab === 'received' && (o.buyerName || o.buyerSurname) && (
                        <div className="mt-2 text-sm text-gray-600">
                          Buyer: <span className="font-semibold text-gray-900">{`${o.buyerName || ''} ${o.buyerSurname || ''}`.trim()}</span>
                        </div>
                      )}
                      {activeTab === 'made' && (o.sellerName || o.sellerSurname) && (
                          <div className="mt-2 text-sm text-gray-600">
                            Seller: <span className="font-semibold text-gray-900">{`${o.sellerName || ''} ${o.sellerSurname || ''}`.trim()}</span>
                          </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isExpired ? (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className="text-sm font-semibold">This offer has expired!</span>
                        </div>
                      ) : (
                        <>
                          {canCheckout && (
                            <button
                              type="button"
                              onClick={() => handleCheckout(o.id)}
                              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                            >
                              Continue to Checkout
                            </button>
                          )}

                          {canActAsSeller && (
                            <>
                              <button
                                type="button"
                                onClick={() => setCounterTarget(o)}
                                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                              >
                                Counter
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(o.id)}
                                className="px-4 py-2 rounded-xl border border-red-200 text-red-700 text-sm font-semibold hover:bg-red-50"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAccept(o.id)}
                                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
                              >
                                Accept
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

