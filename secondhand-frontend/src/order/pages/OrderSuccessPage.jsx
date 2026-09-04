import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { orderService } from '../services/orderService.js';
import OrderSuccessModal from '../components/OrderSuccessModal.jsx';

const resolveOrderId = payload => payload?.id || payload?.orderId || null;
const resolveOrderNumber = payload => payload?.orderNumber || payload?.orderNo || null;

const OrderSuccessPage = () => {
  const { t } = useTranslation();
  const { state } = useLocation();
  const [order, setOrder] = useState(state?.order || null);
  const [loading, setLoading] = useState(false);

  const orderId = resolveOrderId(order) || state?.orderId || null;
  const orderNumber = resolveOrderNumber(order) || state?.orderNumber || null;
  const currency = order?.currency || 'TRY';
  const totalAmount = Number(order?.totalAmount ?? state?.totalAmount ?? 0);
  const orderDate = order?.createdAt || state?.createdAt || new Date().toISOString();
  const shippingAddress = order?.shippingAddress || state?.shippingAddress || null;
  const deliveryMethod = order?.deliveryMethod || state?.deliveryMethod || 'CARGO';
  const meetupLocation = order?.meetupLocation || state?.meetupLocation || '';
  const orderItems = order?.orderItems || [];

  const detailFetchDoneRef = useRef(false);

  useEffect(() => {
    detailFetchDoneRef.current = false;
  }, [orderId, orderNumber]);

  useEffect(() => {
    let isMounted = true;
    if (!orderId && !orderNumber) return undefined;
    if (order && Array.isArray(order.orderItems)) return undefined;
    if (detailFetchDoneRef.current) return undefined;
    detailFetchDoneRef.current = true;

    const loadOrder = async () => {
      setLoading(true);
      try {
        const fetched = orderId 
          ? await orderService.getById(orderId) 
          : await orderService.getByOrderNumber(orderNumber);
        if (isMounted) setOrder(fetched);
      } catch {
        // Keep fallback data from navigation state if lookup fails.
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [orderId, orderNumber, order]);

  return (
    <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden py-10 antialiased selection:bg-slate-900 selection:text-white">
      {/* Background ambient radial circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -right-24 h-[420px] w-[420px] rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-28 h-[380px] w-[380px] rounded-full bg-indigo-100/35 blur-3xl" />
      </div>

      <PageContainer className="relative z-10 max-w-3xl mx-auto">
        <OrderSuccessModal
          order={order}
          orderNumber={orderNumber}
          orderDate={orderDate}
          totalAmount={totalAmount}
          currency={currency}
          shippingAddress={shippingAddress}
          deliveryMethod={deliveryMethod}
          meetupLocation={meetupLocation}
          orderItems={orderItems}
          isModal={false}
        />
      </PageContainer>
    </div>
  );
};

export default OrderSuccessPage;