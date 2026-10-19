import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useShowcaseQueries } from '../../showcase/hooks/queries.js';
import { formatCurrency } from '../../common/formatters.js';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const { t } = useTranslation();
  const { showcases } = useShowcaseQueries({
    enabled: true,
    page: 0,
    size: 1
  });

  const spotlightListing = showcases?.[0]?.listing;

  return (
    <section className="bg-background-primary border-b border-border-light">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="grid lg:grid-cols-[1fr_360px] items-center gap-10 lg:gap-16">
          {/* Left Column: Direct Value Proposition & Primary Actions */}
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-text-primary tracking-tight leading-tight">
              {t("hero.title", "Doğrudan alıcı ve satıcıdan ikinci el.")}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-text-secondary leading-relaxed font-normal max-w-xl">
              {t("hero.subtitle", "Emanet ödeme koruması, doğrulanmış profiller ve doğrudan teklif imkanıyla güvenli alışveriş.")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to={ROUTES.LISTINGS}
                className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 bg-primary text-white hover:bg-primary-hover h-10 px-5 cursor-pointer"
              >
                <span>{t("browse_listings", "İlanları İncele")}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
              <Link
                to={ROUTES.LISTINGS_PREFILTER_CREATE}
                className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 border border-border bg-background-primary text-text-primary hover:bg-background-tertiary h-10 px-5 cursor-pointer"
              >
                <span>+ {t("create_listing", "İlan Ver")}</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Quiet Single Listing Spotlight */}
          {spotlightListing ? (
            <div className="hidden lg:block w-full">
              <Link
                to={`${ROUTES.LISTINGS}/${spotlightListing.id}`}
                className="block bg-background-primary border border-border-light hover:border-border rounded p-4 transition-colors group cursor-pointer"
              >
                <div className="aspect-video rounded bg-background-tertiary overflow-hidden flex items-center justify-center">
                  {spotlightListing.imageUrl ? (
                    <img
                      src={spotlightListing.imageUrl}
                      alt={spotlightListing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-text-muted text-xs font-medium">{t("no_image", "Görsel yok")}</span>
                  )}
                </div>
                <div className="mt-3.5">
                  <div className="flex items-center justify-between text-xs text-text-tertiary">
                    <span>{spotlightListing.type || t("listing", "İlan")}</span>
                    {spotlightListing.listingNo && (
                      <span className="tabular-nums font-mono text-text-muted">#{spotlightListing.listingNo}</span>
                    )}
                  </div>
                  <h2 className="text-sm font-medium text-text-primary mt-1 truncate group-hover:text-primary transition-colors">
                    {spotlightListing.title}
                  </h2>
                  <p className="mt-2 text-base font-semibold text-text-primary tabular-nums">
                    {formatCurrency(spotlightListing.price, spotlightListing.currency)}
                  </p>
                </div>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;