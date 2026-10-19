import PageContainer from '@/common/components/layout/PageContainer';
import { useQuery } from '@tanstack/react-query';
import { Navigate, useLocation } from 'react-router-dom';
import { orderService } from '../services/orderService.js';
import { ORDER_QUERY_KEYS } from '../orderConstants.js';
import OrderSuccessModal from '../components/OrderSuccessModal.jsx';
import { ROUTES } from '../../common/constants/routes.js';

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

  // Opened directly or after a refresh there is no checkout state: nothing true to show, so leave.
  if (!state) return <Navigate to={ROUTES.MY_ORDERS} replace />;

  const order = fetchedOrder || navOrder || (navOrderId ? { id: navOrderId } : null);
  const orderNumber = resolveOrderNumber(order) || navOrderNumber;
  const currency = order?.currency || 'TRY';
  const totalAmount = order?.totalAmount ?? state?.totalAmount ?? null;
  const orderDate = order?.createdAt || state?.createdAt || null;
  const shippingAddress = order?.shippingAddress || state?.shippingAddress || null;
  const deliveryMethod = order?.deliveryMethod || state?.deliveryMethod || null;
  const meetupLocation = order?.meetupLocation || state?.meetupLocation || '';
  const orderItems = order?.orderItems || [];

  return (
    <div className="min-h-screen bg-background-secondary py-10">
      <PageContainer narrow>
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
        />
      </PageContainer>
    </div>
  );
};

export default OrderSuccessPage;