import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useEnums} from '../../common/hooks/useEnums.js';
import { OrdersListLayout } from '../components/shared';
import {useOrderFlow, usePendingEscrowAmount} from '../hooks/useOrderFlow.js';
import {ROUTES} from '../../common/constants/routes.js';

const ISoldPage = () => {
  const { enums } = useEnums();
  const flow = useOrderFlow({ viewMode: 'seller', initialPage: 0, initialSize: 5 });
  const navigate = useNavigate();

  return (
    <OrdersListLayout
      title="I Sold"
      stickyHeader
      onAnalytics={() => navigate(ROUTES.SELLER_DASHBOARD)}
      analyticsLabel="Analytics"
      flow={flow}
      enums={enums}
      viewMode="seller"
      emptyText="No sales yet"
    />
  );
};

export default ISoldPage;

