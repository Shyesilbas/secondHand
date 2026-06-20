import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Wallet as WalletIcon } from 'lucide-react';
import EWalletSection from '../components/payment-methods/EWalletSection.jsx';
const PaymentMethodsPage = () => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  return <div className="min-h-screen bg-slate-50 tracking-tight">
            <PageContainer className="py-10">

                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-200/80 group shrink-0">
                        <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                            <WalletIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{t("wallet")}</h1>
                            <p className="text-sm text-slate-500 mt-0.5">{t("manage_your_wallet_balance_and_limits")}</p>
                        </div>
                    </div>
                </div>

                <EWalletSection />

            </PageContainer>
        </div>;
};
export default PaymentMethodsPage;