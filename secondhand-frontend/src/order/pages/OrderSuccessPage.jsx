import PageContainer from '@/common/components/layout/PageContainer';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { orderService } from '../services/orderService.js';
import { ORDER_QUERY_KEYS } from '../orderConstants.js';
import OrderSuccessModal from '../components/OrderSuccessModal.jsx';

const resolveOrderId = payload => payload?.id || payload?.orderId || null;
const resolveOrderNumber = payload => payload?.orderNumber || payload?.orderNo || null;

const OrderSuccessPage = () => {
  const { state } = useLocation();
  const navOrder = state?.order || null;
  const navOrderId = resolveOrderId(navOrder) || state?.orderId || null;
  const navOrderNumber = resolveOrderNumber(navOrder) || state?.orderNumber || null;

  // Navigation state may carry only totals; load the full order when its items are missing.
  const { data: fetchedOrder, isLoading } = useQuery({
    queryKey: navOrderId ? ORDER_QUERY_KEYS.detail(navOrderId, false) : ORDER_QUERY_KEYS.byNumber(navOrderNumber),
    queryFn: () => (navOrderId ? orderService.getById(navOrderId) : orderService.getByOrderNumber(navOrderNumber)),
    enabled: !!(navOrderId || navOrderNumber) && !Array.isArray(navOrder?.orderItems),
  });

  const order = fetchedOrder || navOrder;
  const orderNumber = resolveOrderNumber(order) || navOrderNumber;
  const currency = order?.currency || 'TRY';
  const totalAmount = Number(order?.totalAmount ?? state?.totalAmount ?? 0);
  const orderDate = order?.createdAt || state?.createdAt || new Date().toISOString();
  const shippingAddress = order?.shippingAddress || state?.shippingAddress || null;
  const deliveryMethod = order?.deliveryMethod || state?.deliveryMethod || 'CARGO';
  const meetupLocation = order?.meetupLocation || state?.meetupLocation || '';
  const orderItems = order?.orderItems || [];

  return (
    <div className="min-h-screen bg-background-secondary py-10">
      <PageContainer className="max-w-3xl mx-auto">
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
          itemsLoading={isLoading}
          isModal={false}
        />
      </PageContainer>
    </div>
  );
};

export default OrderSuccessPage;