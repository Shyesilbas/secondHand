import {useNavigate} from 'react-router-dom';
import {useEnums} from '../../common/hooks/useEnums.js';
import {OrdersListLayout} from '../components/shared';
import {useOrderFlow} from '../hooks/useOrderFlow.js';
import {ROUTES} from '../../common/constants/routes.js';
import { ORDER_DEFAULTS, ORDER_VIEW_MODES } from '../constants/orderUiConstants.js';

const MyOrdersPage = () => {
  const { enums } = useEnums();
  const flow = useOrderFlow({
    viewMode: ORDER_VIEW_MODES.BUYER,
    initialPage: ORDER_DEFAULTS.INITIAL_PAGE,
    initialSize: ORDER_DEFAULTS.INITIAL_PAGE_SIZE,
  });
  const navigate = useNavigate();

  return (
    <OrdersListLayout
      title="Orders"
      subtitle="Track your purchases and delivery progress"
      stickyHeader
      onAnalytics={() => navigate(ROUTES.BUYER_DASHBOARD)}
      analyticsLabel="Analytics"
      flow={flow}
      enums={enums}
      viewMode={ORDER_VIEW_MODES.BUYER}
      emptyText="No orders yet"
      emptyAction={() => navigate(ROUTES.LISTINGS)}
    />
  );
};

export default MyOrdersPage;