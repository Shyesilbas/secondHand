import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { ArrowRight } from 'lucide-react';

const SellerCtaSection = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-background-secondary border border-border-light rounded p-8 sm:p-12 text-center">
      <div className="max-w-xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">
          {t("seller_cta.title", "Satmak istediğin bir ürün mü var?")}
        </h2>
        <p className="text-sm sm:text-base text-text-secondary mt-2.5 leading-relaxed font-normal">
          {t("seller_cta.subtitle", "Fotoğraflarını yükle, fiyatını belirle ve ilanını oluşturarak alıcılarla doğrudan buluş.")}
        </p>

        <div className="mt-6 flex justify-center">
          <Link
            to={ROUTES.LISTINGS_PREFILTER_CREATE}
            className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 bg-primary text-white hover:bg-primary-hover h-10 px-5 cursor-pointer"
          >
            <span>+ {t("create_listing", "İlan Oluştur")}</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SellerCtaSection;
