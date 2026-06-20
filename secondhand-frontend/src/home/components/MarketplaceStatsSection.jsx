import React, { useMemo } from 'react';
import { useListingStatistics } from '../../listing/hooks/useListingStatistics.js';
import { Layers, Car, Laptop, Building2 } from 'lucide-react';

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
        color: 'text-status-success bg-status-success-bg border-emerald-100/50'
      },
      {
        label: 'Vehicles',
        value: vehicles.toLocaleString('tr-TR'),
        desc: 'Cars, motorcycles & parts',
        icon: Car,
        color: 'text-primary bg-blue-50 border-primary/50'
      },
      {
        label: 'Electronics',
        value: electronics.toLocaleString('tr-TR'),
        desc: 'Laptops, phones & watches',
        icon: Laptop,
        color: 'text-primary bg-indigo-50 border-primary/50'
      },
      {
        label: 'Real Estate',
        value: realEstate.toLocaleString('tr-TR'),
        desc: 'Apartments, villas & offices',
        icon: Building2,
        color: 'text-status-warning bg-status-warning-bg border-amber-100/50'
      }
    ];
  }, [statistics]);

  if (isLoading) {
    return (
      <section className="py-8 bg-transparent border-b border-slate-100/40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-background-primary border border-slate-100/80 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Strictly do not render if error, no stats, or total active listings is zero
  if (error || !metrics) return null;

  return (
    <section className="py-8 bg-transparent border-b border-slate-100/40">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="bg-background-primary border border-slate-100 rounded-2xl p-5 shadow-[0_2px_8px_-1px_rgba(15,23,42,0.01),0_4px_20px_-2px_rgba(15,23,42,0.02)] transition-all hover:border-border-light/80"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${metric.color}`}>
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                  </div>
                  <div>
                    <span className="text-caption font-bold text-slate-400 uppercase tracking-wider">{metric.label}</span>
                    <h3 className="text-sm font-medium text-text-primary tracking-tight mt-0.5">{metric.value}</h3>
                  </div>
                </div>
                <p className="text-caption text-slate-400 font-medium mt-3 border-t border-slate-50 pt-2 leading-relaxed">
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
