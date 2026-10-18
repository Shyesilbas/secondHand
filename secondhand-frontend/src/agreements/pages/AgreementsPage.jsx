import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useMemo, useState } from 'react';
import AgreementsList from './AgreementsList.jsx';
import { useAgreements, useRequiredAgreements, useUserAgreements } from '../hooks/useAgreements.js';
import { FileText, UserCheck, CreditCard } from 'lucide-react';
const CATEGORIES = [{
 key: 'registration',
 label: 'Registration',
 icon: UserCheck,
 description: 'Account & privacy agreements'
}, {
 key: 'payment',
 label: 'Payment',
 icon: CreditCard,
 description: 'Transaction & payment terms'
}];
const AgreementsPage = () => {
 const {
 t
 } = useTranslation();
 const [filter, setFilter] = useState('all');
 const [category, setCategory] = useState('registration');
 const {
 agreements,
 isLoading: agreementsLoading
 } = useAgreements();
 const {
 userAgreements,
 isLoading: userAgreementsLoading,
 refetch: refetchUserAgreements
 } = useUserAgreements();
 const { requiredAgreements: requiredRegisterAgreements, isLoading: registerLoading } = useRequiredAgreements('REGISTER');
 const { requiredAgreements: requiredPaymentAgreements, isLoading: paymentLoading } = useRequiredAgreements('ONLINE_PAYMENT');
 const loading = agreementsLoading || userAgreementsLoading || registerLoading || paymentLoading;
 const requiredIds = useMemo(() => {
 const list = category === 'registration' ? requiredRegisterAgreements : requiredPaymentAgreements;
 return new Set((list || []).map(a => a?.agreementId).filter(Boolean));
 }, [category, requiredRegisterAgreements, requiredPaymentAgreements]);
 const filteredAgreements = useMemo(() => {
 if (!agreements?.length) return [];
 if (requiredIds.size === 0) return [];
 return agreements.filter(a => requiredIds.has(a.agreementId));
 }, [agreements, requiredIds]);
 const activeCat = CATEGORIES.find(c => c.key === category);
 return <div className="min-h-screen bg-background-secondary">
 {/* ── Page Header ─────────────────────────────────── */}
 <div className="bg-background-primary border-b border-border-light">
 <PageContainer className="py-8">
 <div className="flex items-center gap-4">
 <FileText className="h-5 w-5 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 <div>
 <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{t("legal_agreements")}</h1>
 <p className="text-sm text-text-muted mt-0.5">{t("review_and_accept_required_legal_documen")}</p>
 </div>
 </div>
 </PageContainer>
 </div>

 <PageContainer className="py-8">
 <div className="flex flex-col lg:flex-row gap-6">

 {/* ── Left: Category Sidebar ──────────────── */}
 <div className="lg:w-64 shrink-0">
 <nav className="bg-background-primary rounded-md border border-border-light overflow-hidden lg:sticky lg:top-6">
 <div className="px-4 py-3 border-b border-border-light">
 <span className="text-xs font-semibold text-text-muted">{t("category")}</span>
 </div>
 <div className="p-2">
 {CATEGORIES.map(cat => {
 const Icon = cat.icon;
 const isActive = category === cat.key;
 return <button key={cat.key} type="button" onClick={() => {
 setCategory(cat.key);
 setFilter('all');
 }} className={`w-full flex items-center gap-3 px-3 py-3 rounded text-left transition-all duration-200 ${isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary'}`}>
 <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${isActive ? 'bg-primary/20 text-primary' : 'bg-background-secondary text-text-muted'}`}>
 <Icon className="w-4 h-4" />
 </div>
 <div className="min-w-0">
 <div className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-text-primary'}`}>
 {cat.label}
 </div>
 <div className={`text-xs truncate mt-0.5 ${isActive ? 'text-primary/80' : 'text-text-muted'}`}>
 {cat.description}
 </div>
 </div>
 </button>;
 })}
 </div>
 </nav>
 </div>

 {/* ── Right: Content Panel ────────────────── */}
 <div className="flex-1 min-w-0">
 <div className="bg-background-primary rounded-md border border-border-light overflow-hidden">
 <div className="px-6 py-5 border-b border-border-light">
 <div className="flex items-center gap-3">
 {activeCat && <activeCat.icon className="h-5 w-5 shrink-0 text-text-secondary" strokeWidth={1.5} aria-hidden />}
 <div>
 <h2 className="text-lg font-semibold text-text-primary">{activeCat?.label} {t("agreements")}</h2>
 <p className="text-xs text-text-muted mt-0.5">{activeCat?.description}</p>
 </div>
 </div>
 </div>

 <div className="p-6">
 {!loading && requiredIds.size === 0 ? <div className="py-12 text-center">
 <FileText className="mx-auto mb-4 block h-5 w-5 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
 <p className="text-sm font-semibold text-text-primary">{t("no_required_agreements")}</p>
 <p className="text-sm text-text-muted mt-1">{t("this_section_has_no_required_agreements_")}</p>
 </div> : <AgreementsList agreements={filteredAgreements} userAgreements={userAgreements} loading={loading} filter={filter} setFilter={setFilter} onAccepted={() => {
 if (refetchUserAgreements) refetchUserAgreements();
 }} />}
 </div>
 </div>
 </div>
 </div>
 </PageContainer>
 </div>;
};

export default AgreementsPage;