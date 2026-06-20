import React, { useMemo } from 'react';
import { useListingStatistics } from '../../listing/hooks/useListingStatistics.js';
import { Layers, Car, Laptop, Building2 } from 'lucide-react';
import { SkeletonGrid } from '../../common/components/ui/Skeleton.jsx';

const MarketplaceStatsSection = () => {
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
        label: 'Active Listings',
        value: totalActive.toLocaleString('tr-TR'),
        desc: 'Live items ready for trade',
        icon: Layers,
        color: 'text-status-success bg-status-success-bg border-status-success-border'
      },
      {
        label: 'Vehicles',
        value: vehicles.toLocaleString('tr-TR'),
        desc: 'Cars, motorcycles & parts',
        icon: Car,
        color: 'text-primary bg-primary-light border-primary-200'
      },
      {
        label: 'Electronics',
        value: electronics.toLocaleString('tr-TR'),
        desc: 'Laptops, phones & watches',
        icon: Laptop,
        color: 'text-primary bg-primary-light border-primary-200'
      },
      {
        label: 'Real Estate',
        value: realEstate.toLocaleString('tr-TR'),
        desc: 'Apartments, villas & offices',
        icon: Building2,
        color: 'text-status-warning bg-status-warning-bg border-status-warning-border'
      }
    ];
  }, [statistics]);

  if (isLoading) {
    return (
      <section className="py-8 bg-transparent border-b border-border-light">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <SkeletonGrid count={4} columns="grid-cols-2 lg:grid-cols-4" />
        </div>
      </section>
    );
  }

  // Strictly do not render if error, no stats, or total active listings is zero
  if (error || !metrics) return null;

  return (
    <section className="py-8 bg-transparent border-b border-border-light">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="bg-background-primary border border-border-light rounded-xl p-5 shadow-sm transition-all hover:border-border"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-md flex items-center justify-center border ${metric.color}`}>
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                  </div>
                  <div>
                    <span className="text-caption font-bold text-text-muted uppercase tracking-wider">{metric.label}</span>
                    <h3 className="text-sm font-medium text-text-primary tracking-tight mt-0.5">{metric.value}</h3>
                  </div>
                </div>
                <p className="text-caption text-text-secondary font-medium mt-3 border-t border-border-light pt-2 leading-relaxed">
                  {metric.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MarketplaceStatsSection;
