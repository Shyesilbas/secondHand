import { useTranslation } from "react-i18next";
import { ShieldCheck, UserCheck, ArrowLeftRight } from 'lucide-react';

const TrustBand = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: ShieldCheck,
      title: t("trust.escrow_title", "Emanet (Escrow) Koruması"),
      description: t("trust.escrow_desc", "Ödemeniz ürün elinize ulaşıp onaylayana kadar havuz hesabında güvende tutulur.")
    },
    {
      icon: UserCheck,
      title: t("trust.verified_title", "Doğrulanmış Profiller"),
      description: t("trust.verified_desc", "Şeffaf satıcı değerlendirmeleri ve gerçek kullanıcı işlem puanları.")
    },
    {
      icon: ArrowLeftRight,
      title: t("trust.offers_title", "Doğrudan Teklif"),
      description: t("trust.offers_desc", "Satıcıyla anında pazarlık yapın ve doğrudan komisyonsuz anlaşın.")
    }
  ];

  return (
    <section className="bg-background-secondary border-b border-border-light py-8">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="flex items-start gap-3.5">
                <Icon className="w-5 h-5 text-text-primary shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBand;
