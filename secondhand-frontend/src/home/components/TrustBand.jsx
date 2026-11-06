import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, ShieldCheck, UserCheck } from 'lucide-react';
import PageContainer from '../../common/components/layout/PageContainer.jsx';

const TrustBand = () => {
  const { t } = useTranslation();
  const features = [
    { key: 'escrow', icon: ShieldCheck, title: t('trust.escrow_title', 'Güvenceli ödeme'), description: t('trust.escrow_desc_short', 'Ödemen, ürünü onaylayana kadar satıcıya geçmez.') },
    { key: 'verified', icon: UserCheck, title: t('trust.verified_title', 'Değerlendirilen satıcılar'), description: t('trust.verified_desc_short', 'Gerçek alışverişlerden gelen puanlar.') },
    { key: 'offers', icon: ArrowLeftRight, title: t('trust.offers_title', 'Doğrudan teklif'), description: t('trust.offers_desc_short', 'Satıcıyla pazarlık yap, anlaşınca satın al.') }
  ];

  return (
    <section className="border-y border-border-light bg-background-secondary">
      <PageContainer className="py-6">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {features.map(({ key, icon: Icon, title, description }) => (
            <li key={key} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary" strokeWidth={1.5} aria-hidden />
              <p className="text-sm">
                <span className="font-medium text-text-primary">{title}</span>
                <span className="block text-text-secondary">{description}</span>
              </p>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
};

export default TrustBand;
