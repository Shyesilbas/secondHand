import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { Wallet as WalletIcon } from 'lucide-react';
import BackButton from '../../common/components/ui/BackButton.jsx';
import PageHeader from '../../common/components/ui/PageHeader.jsx';
import EWalletSection from '../components/payment-methods/EWalletSection.jsx';
const PaymentMethodsPage = () => {
 const {
 t
 } = useTranslation();
 const navigate = useNavigate();
 return <div className="min-h-screen bg-background-secondary tracking-tight">
 <PageContainer className="py-10">

 <PageHeader
 back={<BackButton onClick={() => navigate(-1)} />}
 icon={WalletIcon}
 title={t("wallet")}
 subtitle={t("manage_your_wallet_balance_and_limits")}
 className="mb-8"
 />

 <EWalletSection />

 </PageContainer>
 </div>;
};
export default PaymentMethodsPage;