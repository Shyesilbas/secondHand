import React from 'react';
import { orderService } from '../services/orderService.js';
import { paymentService } from '../../payments/services/paymentService.js';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import PaymentReceiptModal from '../../common/components/modals/PaymentReceiptModal.jsx';
import { ReviewButton } from '../../reviews/index.js';
import { formatDateTime, formatCurrency } from '../../common/formatters.js';

const MyOrdersPage = () => {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [receiptOpen, setReceiptOpen] = React.useState(false);
  const [receiptPayment, setReceiptPayment] = React.useState(null);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [orderModalOpen, setOrderModalOpen] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await orderService.myOrders(0, 20);
        if (mounted) setOrders(data.content || data);
      } catch (e) {
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const openReceipt = async (paymentReference) => {
    try {
      const payments = await paymentService.getMyPayments(0, 100);
      const list = payments.content || [];
      const payment = list.find(p => String(p.paymentId) === String(paymentReference));
      if (payment) {
        setReceiptPayment(payment);
        setReceiptOpen(true);
      }
    } catch (e) {}
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setOrderModalOpen(true);
  };
  const closeOrderModal = () => {
    setOrderModalOpen(false);
    setSelectedOrder(null);
  };

  // Helper function to calculate estimated delivery time
  const getEstimatedDeliveryTime = (createdAt, shippingStatus) => {
    if (shippingStatus === 'DELIVERED' || shippingStatus === 'CANCELLED') {
      return null;
    }

    const orderDate = new Date(createdAt);
    const now = new Date();
    const hoursPassed = (now - orderDate) / (1000 * 60 * 60);

    if (hoursPassed < 3) {
      const remainingHours = Math.ceil(3 - hoursPassed);
      return `Estimated delivery in ${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
    } else if (hoursPassed < 24) {
      const remainingHours = Math.ceil(24 - hoursPassed);
      return `Estimated delivery in ${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
    } else {
      return 'Estimated delivery: Any time now';
    }
  };

  if (loading) {
    return (
      <div className="p-6"><LoadingIndicator /></div>
    );
  }

  if (!orders.length) {
    return (
      <div className="p-6 text-gray-600">No orders yet.</div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(o => (
        <div key={o.id} className="border rounded-xl p-4 bg-white hover:shadow-md transition cursor-pointer" onClick={() => openOrderModal(o)}>
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold text-text-primary">Order #{o.orderNumber}</div>
              <div className="text-xs text-text-muted">{formatDateTime(o.createdAt)}</div>
              <div className="mt-2 text-sm">
                <span className="text-text-secondary">Status:</span> <span className="font-medium">{o.status}</span>
                <span className="ml-3 text-text-secondary">Payment:</span> <span className="font-medium">{o.paymentStatus}</span>
                <span className="ml-3 text-text-secondary">Shipping:</span> <span className="font-medium">{o.shippingStatus}</span>
              </div>
              {getEstimatedDeliveryTime(o.createdAt, o.shippingStatus) && (
                <div className="mt-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-md inline-block">
                  <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {getEstimatedDeliveryTime(o.createdAt, o.shippingStatus)}
                </div>
              )}
              {o.shippingStatus !== 'DELIVERED' && o.shippingStatus !== 'CANCELLED' && (
                <div className="mt-2 flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  You can review each product after your package arrives
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatCurrency(o.totalAmount, o.currency)}</div>
              {o.paymentReference && (
                <button className="mt-2 text-sm text-blue-600 hover:underline" onClick={(e) => { e.stopPropagation(); openReceipt(o.paymentReference); }}>
                  View receipt
                </button>
              )}
            </div>
          </div>
          {o.orderItems && o.orderItems.length > 0 && (
            <div className="mt-3 text-sm text-text-secondary">
              {o.orderItems.slice(0,3).map((it, idx) => (
                <div key={idx}>{it.listing?.title || it.listing?.listingNo || it.listing?.id} ×{it.quantity} — {formatCurrency(it.totalPrice, o.currency)}</div>
              ))}
              {o.orderItems.length > 3 && <div>+{o.orderItems.length - 3} more</div>}
            </div>
          )}
        </div>
      ))}

      <PaymentReceiptModal isOpen={receiptOpen} onClose={() => setReceiptOpen(false)} payment={receiptPayment} />

      {orderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeOrderModal} />
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Order #{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-text-muted">Created: {formatDateTime(selectedOrder.createdAt)}</p>
              </div>
              <button className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200" onClick={closeOrderModal}>Close</button>
            </div>
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-text-muted">Status</p>
                  <p className="font-semibold">{selectedOrder.status}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-text-muted">Payment Status</p>
                  <p className="font-semibold">{selectedOrder.paymentStatus}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-text-muted">Shipping Status</p>
                  <p className="font-semibold">{selectedOrder.shippingStatus}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl text-right md:text-left">
                  <p className="text-xs text-text-muted">Total</p>
                  <p className="font-semibold">{formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}</p>
                </div>
              </div>

              {getEstimatedDeliveryTime(selectedOrder.createdAt, selectedOrder.shippingStatus) && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-orange-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-orange-800">Estimated Delivery Time</p>
                      <p className="text-xs text-orange-600 mt-1">{getEstimatedDeliveryTime(selectedOrder.createdAt, selectedOrder.shippingStatus)}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedOrder.shippingStatus !== 'DELIVERED' && selectedOrder.shippingStatus !== 'CANCELLED' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Review Available Soon</p>
                      <p className="text-xs text-blue-600 mt-1">You can review each product after your package arrives. Review buttons will appear when shipping status becomes "DELIVERED".</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-xl p-4">
                  <h4 className="font-semibold text-text-primary mb-2">Shipping Address</h4>
                  {selectedOrder.shippingAddress ? (
                    <div className="text-sm text-text-secondary">
                      <div>{selectedOrder.shippingAddress.addressLine}</div>
                      <div>{selectedOrder.shippingAddress.city} {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</div>
                      <div>{selectedOrder.shippingAddress.country}</div>
                    </div>
                  ) : <div className="text-sm text-text-muted">Not provided</div>}
                </div>
                <div className="border rounded-xl p-4">
                  <h4 className="font-semibold text-text-primary mb-2">Billing Address</h4>
                  {selectedOrder.billingAddress ? (
                    <div className="text-sm text-text-secondary">
                      <div>{selectedOrder.billingAddress.addressLine}</div>
                      <div>{selectedOrder.billingAddress.city} {selectedOrder.billingAddress.state} {selectedOrder.billingAddress.postalCode}</div>
                      <div>{selectedOrder.billingAddress.country}</div>
                    </div>
                  ) : <div className="text-sm text-text-muted">Same as shipping</div>}
                </div>
              </div>

              <div className="border rounded-xl">
                <div className="p-4 border-b font-semibold">Items</div>
                <div className="divide-y">
                  {(selectedOrder.orderItems || []).map((it, idx) => (
                    <div key={idx} className="p-4 grid grid-cols-12 gap-3 text-sm items-center">
                      <div className="col-span-4">
                        <div className="font-medium text-text-primary">{it.listing?.title || it.listing?.listingNo || it.listing?.id}</div>
                        <div className="text-text-muted text-xs">{it.listing?.listingNo || it.listing?.id}</div>
                      </div>
                      <div className="col-span-2 text-center">×{it.quantity}</div>
                      <div className="col-span-2 text-right">{formatCurrency(it.unitPrice, selectedOrder.currency)}</div>
                      <div className="col-span-2 text-right font-semibold">{formatCurrency(it.totalPrice, selectedOrder.currency)}</div>
                      <div className="col-span-2 text-right">
                        <ReviewButton
                          orderItem={it}
                          onReviewCreated={() => {
                            // Optionally refresh the order data
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-xl p-4">
                  <h4 className="font-semibold text-text-primary mb-2">Notes</h4>
                  <div className="text-sm text-text-secondary">{selectedOrder.notes || '—'}</div>
                </div>
                <div className="border rounded-xl p-4">
                  <h4 className="font-semibold text-text-primary mb-2">Payment Reference</h4>
                  <div className="text-sm font-mono">{selectedOrder.paymentReference || '—'}</div>
                  {selectedOrder.paymentReference && (
                    <button className="mt-2 text-sm text-blue-600 hover:underline" onClick={() => openReceipt(selectedOrder.paymentReference)}>
                      View receipt
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;


