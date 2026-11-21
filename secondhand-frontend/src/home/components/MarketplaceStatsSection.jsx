import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useListingStatistics } from '../../listing/hooks/useListingStatistics.js';
import { Layers, Car, Laptop, Building2 } from 'lucide-react';
import PageContainer from '../../common/components/layout/PageContainer.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';

const GRID = 'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5';

const MarketplaceStatsSection = () => {
 const { t } = useTranslation();
 const { statistics, isLoading, error } = useListingStatistics();

 const metrics = useMemo(() => {
 if (!statistics) return null;

 const vehicles = Number(statistics.vehicleCount ?? 0);
 const electronics = Number(statistics.electronicsCount ?? 0);
 const realEstate = Number(statistics.realEstateCount ?? 0);
 const clothing = Number(statistics.clothingCount ?? 0);
 const books = Number(statistics.booksCount ?? 0);
 const sports = Number(statistics.sportsCount ?? 0);

 const totalActive = vehicles + electronics + realEstate + clothing + books + sports;

 // Safety guard: if there are no active listings on the platform, don't show statistics
 if (totalActive === 0) return null;

 return [
 {
 label: t('active_listings'),
 value: totalActive.toLocaleString('tr-TR'),
 desc: t('about_stat_active_desc'),
 icon: Layers,
 },
 {
 label: t('vehicles'),
 value: vehicles.toLocaleString('tr-TR'),
 desc: t('about_stat_vehicles_desc'),
 icon: Car,
 },
 {
 label: t('electronics'),
 value: electronics.toLocaleString('tr-TR'),
 desc: t('about_stat_electronics_desc'),
 icon: Laptop,
 },
 {
 label: t('real_estate'),
 value: realEstate.toLocaleString('tr-TR'),
 desc: t('about_stat_real_estate_desc'),
 icon: Building2,
 }
 ];
 }, [statistics, t]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className={GRID} aria-busy="true">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </PageContainer>
    );
  }

  // Strictly do not render if error, no stats, or total active listings is zero
  if (error || !metrics) return null;

  // Read-only figures: no hover lift, since nothing here is clickable.
  return (
    <section>
      <PageContainer>
      <dl className={GRID}>
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded border border-border-light bg-background-primary p-5 shadow-sm">
              <dt className="flex items-center gap-2 text-sm text-text-tertiary">
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                {metric.label}
              </dt>
              <dd className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-text-primary">{metric.value}</dd>
              <dd className="mt-1 text-sm text-text-secondary">{metric.desc}</dd>
            </div>
          );
        })}
      </dl>
      </PageContainer>
    </section>
  );
};

export default MarketplaceStatsSection;
