import {useNavigate} from 'react-router-dom';
import {useEnums} from '../../common/hooks/useEnums.js';
import {OrdersListLayout} from '../components/shared';
import {useOrderFlow} from '../hooks/useOrderFlow.js';
import {ROUTES} from '../../common/constants/routes.js';

const MyOrdersPage = () => {
  const { enums } = useEnums();
  const flow = useOrderFlow({ viewMode: 'buyer', initialPage: 0, initialSize: 5 });
  const navigate = useNavigate();

  return (
    <OrdersListLayout
      title="Orders"
      stickyHeader
      onAnalytics={() => navigate(ROUTES.BUYER_DASHBOARD)}
      analyticsLabel="Analytics"
      flow={flow}
      enums={enums}
      viewMode="buyer"
      emptyText="No orders yet"
      emptyAction={() => navigate(ROUTES.LISTINGS)}
    />
  );
};

export default MyOrdersPage;