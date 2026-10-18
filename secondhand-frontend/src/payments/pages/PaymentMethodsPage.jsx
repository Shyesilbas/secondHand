import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Wallet as WalletIcon } from 'lucide-react';
import EWalletSection from '../components/payment-methods/EWalletSection.jsx';
const PaymentMethodsPage = () => {
 const {
 t
 } = useTranslation();
 const navigate = useNavigate();
 return <div className="min-h-screen bg-background-secondary tracking-tight">
 <PageContainer className="py-10">

 <div className="flex items-center gap-4 mb-8">
 <button onClick={() => navigate(-1)} className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-background-primary hover:bg-background-tertiary text-text-tertiary hover:text-text-primary transition-all border border-border-light/80 group shrink-0">
 <ArrowLeftIcon className="w-5 h-5 transition-transform" />
 </button>
 <div className="flex items-center gap-4">
 <WalletIcon className="shrink-0 h-5 w-5 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 <div>
 <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{t("wallet")}</h1>
 <p className="text-sm text-text-tertiary mt-0.5">{t("manage_your_wallet_balance_and_limits")}</p>
 </div>
 </div>
 </div>

 <EWalletSection />

 </PageContainer>
 </div>;
};
export default PaymentMethodsPage;