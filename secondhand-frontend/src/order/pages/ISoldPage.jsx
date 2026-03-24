import {useNavigate} from 'react-router-dom';
import {useEnums} from '../../common/hooks/useEnums.js';
import { OrdersListLayout } from '../components/shared';
import {useOrderFlow} from '../hooks/useOrderFlow.js';
import {ROUTES} from '../../common/constants/routes.js';
import { ORDER_DEFAULTS, ORDER_VIEW_MODES } from '../constants/orderUiConstants.js';

const ISoldPage = () => {
  const { enums } = useEnums();
  const flow = useOrderFlow({
    viewMode: ORDER_VIEW_MODES.SELLER,
    initialPage: ORDER_DEFAULTS.INITIAL_PAGE,
    initialSize: ORDER_DEFAULTS.INITIAL_PAGE_SIZE,
  });
  const navigate = useNavigate();

  return (
    <OrdersListLayout
      title="I Sold"
      subtitle="Monitor your sales lifecycle and escrow status"
      stickyHeader
      onAnalytics={() => navigate(ROUTES.SELLER_DASHBOARD)}
      analyticsLabel="Analytics"
      flow={flow}
      enums={enums}
      viewMode={ORDER_VIEW_MODES.SELLER}
      emptyText="No sales yet"
    />
  );
};

export default ISoldPage;

