import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {offerService} from '../services/offerService.js';
import {formatCurrency, formatDateTime} from '../../common/formatters.js';
import {ROUTES} from '../../common/constants/routes.js';
import {useNotification} from '../../notification/NotificationContext.jsx';
import CounterOfferModal from '../components/CounterOfferModal.jsx';
import {RefreshCw, CheckCircle2, XCircle, Clock, ShoppingCart} from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-sm font-semibold text-gray-900">Offers</h1>
            {items.length > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                {activeTab === 'made' ? 'Offers you made' : 'Offers you received'} • {items.length} total
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refresh}
              disabled={isLoading}
              className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('made')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${
              activeTab === 'made' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Made ({made.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('received')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${
              activeTab === 'received' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Received ({received.length})
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-white border border-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border border-red-200 rounded-lg p-4">
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-xs text-gray-600">No {activeTab === 'made' ? 'offers made' : 'offers received'} yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Listing</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Quantity</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Unit Price</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">{activeTab === 'made' ? 'Seller' : 'Buyer'}</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Created</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Expires</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((o) => {
                  const currency = 'TRY';
                  const isExpired = o.status === 'EXPIRED';
                  const canActAsSeller = !isExpired && activeTab === 'received' && o.status === 'PENDING';
                  const canCheckout = !isExpired && activeTab === 'made' && o.status === 'ACCEPTED';
                  const personName = activeTab === 'made' 
                    ? `${o.sellerName || ''} ${o.sellerSurname || ''}`.trim() || '—'
                    : `${o.buyerName || ''} ${o.buyerSurname || ''}`.trim() || '—';

                  return (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-medium text-gray-900">{o.listingTitle || 'Listing'}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${statusBadge(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-gray-600">{o.quantity}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-gray-600">{formatCurrency(o.listingUnitPrice, currency)}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-semibold text-gray-900">{formatCurrency(o.totalPrice, currency)}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-gray-600">{personName}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-gray-600">{o.createdAt ? formatDateTime(o.createdAt) : '—'}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs ${isExpired ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {o.expiresAt ? formatDateTime(o.expiresAt) : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          {isExpired ? (
                            <span className="text-[10px] text-amber-600 font-medium">Expired</span>
                          ) : canCheckout ? (
                            <button
                              type="button"
                              onClick={() => handleCheckout(o.id)}
                              className="px-2 py-1 text-[10px] font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-1"
                            >
                              <ShoppingCart className="w-3 h-3" />
                              Checkout
                            </button>
                          ) : canActAsSeller ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setCounterTarget(o)}
                                className="px-2 py-1 text-[10px] font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                              >
                                Counter
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(o.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Reject"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAccept(o.id)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Accept"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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

