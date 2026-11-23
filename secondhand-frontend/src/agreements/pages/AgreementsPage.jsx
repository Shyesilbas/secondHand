import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { CreditCard, FileText, UserCheck } from 'lucide-react';
import AgreementsList from './AgreementsList.jsx';
import { useAgreements, useRequiredAgreements, useUserAgreements } from '../hooks/useAgreements.js';
import { EmptyState, ErrorState, Tabs } from '../../common/components/ui/index.js';

const AgreementsPage = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState('registration');

  const {
    agreements,
    isLoading: agreementsLoading,
    error: agreementsError,
    refetch: refetchAgreements
  } = useAgreements();
  const {
    userAgreements,
    isLoading: userAgreementsLoading,
    error: userAgreementsError,
    refetch: refetchUserAgreements
  } = useUserAgreements();
  const {
    requiredAgreements: requiredRegisterAgreements,
    isLoading: registerLoading,
    error: registerError,
    refetch: refetchRegister
  } = useRequiredAgreements('REGISTER');
  const {
    requiredAgreements: requiredPaymentAgreements,
    isLoading: paymentLoading,
    error: paymentError,
    refetch: refetchPayment
  } = useRequiredAgreements('ONLINE_PAYMENT');

  const loading = agreementsLoading || userAgreementsLoading || registerLoading || paymentLoading;
  const loadError = agreementsError || userAgreementsError || registerError || paymentError;

  const registerIds = useMemo(
    () => new Set((requiredRegisterAgreements || []).map((a) => a?.agreementId).filter(Boolean)),
    [requiredRegisterAgreements]
  );
  const paymentIds = useMemo(
    () => new Set((requiredPaymentAgreements || []).map((a) => a?.agreementId).filter(Boolean)),
    [requiredPaymentAgreements]
  );

  const registerCount = useMemo(
    () => (agreements || []).filter((a) => registerIds.has(a.agreementId)).length,
    [agreements, registerIds]
  );
  const paymentCount = useMemo(
    () => (agreements || []).filter((a) => paymentIds.has(a.agreementId)).length,
    [agreements, paymentIds]
  );

  const requiredIds = category === 'registration' ? registerIds : paymentIds;

  const filteredAgreements = useMemo(() => {
    if (!agreements?.length || requiredIds.size === 0) return [];
    return agreements.filter((a) => requiredIds.has(a.agreementId));
  }, [agreements, requiredIds]);

  const handleCategoryChange = (nextCategory) => {
    setCategory(nextCategory);
    setFilter('all');
  };

  const handleRetry = () => {
    refetchAgreements?.();
    refetchUserAgreements?.();
    refetchRegister?.();
    refetchPayment?.();
  };

  return (
    <div className="min-h-screen bg-background-page">
      <PageContainer className="max-w-4xl py-5 sm:py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            {t('legal_agreements', 'Yasal Sözleşmeler')}
          </h1>

          <Tabs
            variant="segmented"
            ariaLabel={t('legal_agreements', 'Yasal Sözleşmeler')}
            activeKey={category}
            onChange={handleCategoryChange}
            items={[
              {
                key: 'registration',
                label: t('agreements_cat_registration', 'Kayıt ve gizlilik'),
                icon: UserCheck,
                count: loading ? undefined : registerCount,
              },
              {
                key: 'payment',
                label: t('agreements_cat_payment', 'Ödeme ve işlem'),
                icon: CreditCard,
                count: loading ? undefined : paymentCount,
              },
            ]}
          />
        </div>

        {loadError ? (
          <ErrorState
            title={t('agreements_load_failed', 'Sözleşmeler yüklenemedi')}
            onRetry={handleRetry}
          />
        ) : !loading && requiredIds.size === 0 ? (
          <EmptyState
            icon={FileText}
            titleAs="h2"
            title={t('no_required_agreements', 'Gerekli sözleşme yok')}
            description={t('this_section_has_no_required_agreements_', 'Bu bölümde onaylanması gereken sözleşme bulunmuyor.')}
            className="shadow-sm"
          />
        ) : (
          <AgreementsList
            agreements={filteredAgreements}
            userAgreements={userAgreements}
            loading={loading}
            filter={filter}
            setFilter={setFilter}
            onAccepted={() => {
              refetchUserAgreements?.();
            }}
          />
        )}
      </PageContainer>
    </div>
  );
};

export default AgreementsPage;