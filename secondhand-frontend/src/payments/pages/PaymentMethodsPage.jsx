import PageContainer from '@/common/components/layout/PageContainer';
import { useNavigate } from 'react-router-dom';

import BackButton from '../../common/components/ui/BackButton.jsx';
import EWalletSection from '../components/payment-methods/EWalletSection.jsx';

const PaymentMethodsPage = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-background-page">
      <PageContainer className="py-8">
        <EWalletSection back={<BackButton onClick={() => navigate(-1)} />} />
      </PageContainer>
    </div>
  );
};

export default PaymentMethodsPage;
