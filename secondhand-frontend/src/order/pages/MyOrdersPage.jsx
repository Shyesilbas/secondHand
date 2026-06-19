import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEnums } from '../../common/hooks/useEnums.js';
import { OrdersListLayout } from '../components/shared';
import { useOrderFlow } from '../hooks/useOrderFlow.js';
import { ROUTES } from '../../common/constants/routes.js';
import { ORDER_DEFAULTS, ORDER_VIEW_MODES } from '../constants/orderUiConstants.js';
const MyOrdersPage = () => {
  const {
    t
  } = useTranslation();
  const {
    enums
  } = useEnums();
  const flow = useOrderFlow({
    viewMode: ORDER_VIEW_MODES.BUYER,
    initialPage: ORDER_DEFAULTS.INITIAL_PAGE,
    initialSize: ORDER_DEFAULTS.INITIAL_PAGE_SIZE
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightOrderId = searchParams.get('orderId');
  return <OrdersListLayout title={t("orders")} subtitle="Track your purchases and delivery progress" stickyHeader onAnalytics={() => navigate(ROUTES.BUYER_DASHBOARD)} analyticsLabel="Analytics" highlightOrderId={highlightOrderId} flow={flow} enums={enums} viewMode={ORDER_VIEW_MODES.BUYER} emptyText="No orders yet" emptyAction={() => navigate(ROUTES.LISTINGS)} />;
};
export default MyOrdersPage;