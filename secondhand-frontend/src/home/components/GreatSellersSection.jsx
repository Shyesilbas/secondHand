import {Link} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {ROUTES} from '../../common/constants/routes.js';
import {userService} from '../../user/services/userService.js';
import {ArrowRight, Award} from 'lucide-react';
import GreatSellerRulesCallout from './GreatSellerRulesCallout.jsx';

const HeaderBlock = () => (
  <>
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-700/90 mb-1.5">Trusted sellers</p>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
          Great Sellers
          <Award className="w-8 h-8 text-amber-600 shrink-0" aria-hidden />
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
          Sellers who simultaneously meet verified sales volume, buyer diversity, and rating standards — summarized below.
        </p>
      </div>
      <Link
        to={ROUTES.LISTINGS}
        className="inline-flex items-center justify-center gap-1.5 self-start sm:self-auto text-sm font-semibold text-amber-950 bg-amber-400/90 hover:bg-amber-400 px-5 py-2.5 rounded-xl shadow-md shadow-amber-900/10 transition-colors"
      >
        Browse marketplace
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
    <GreatSellerRulesCallout className="mb-8" />
  </>
);

const GreatSellersSection = () => {
  const limit = 16;
  const {data: sellers = [], isLoading, error, refetch} = useQuery({
    queryKey: ['greatSellersHome', limit],
    queryFn: () => userService.listGreatSellers(limit),
    staleTime: 10 * 60 * 1000,
  });

  const inner = () => {
    if (isLoading) {
      return (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-amber-100/80 p-4 animate-pulse bg-amber-50/30">
                <div className="w-12 h-12 rounded-xl bg-amber-100/80 mx-auto mb-3" />
                <div className="h-3 bg-amber-100/80 rounded mx-auto w-2/3" />
              </div>
            ))}
          </div>
        </>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 px-4 py-8 text-center">
          <p className="text-sm text-slate-600 mb-3">Featured sellers couldn&apos;t load.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm font-semibold text-amber-900 underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!sellers.length) {
      return (
        <div className="rounded-2xl border border-dashed border-amber-200/90 bg-white/60 px-4 py-10 text-center">
          <p className="text-sm text-slate-500 font-medium mb-1">No Great Sellers listed yet.</p>
          <p className="text-xs text-slate-400">
            Criteria above match the badge; new sellers appear here automatically when eligible.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
        {sellers.map((s) => {
          const label = `${s.name || ''} ${s.surname || ''}`.trim() || 'Seller';
          const initials = `${s.name?.[0] || ''}${s.surname?.[0] || ''}`.toUpperCase() || 'S';
          return (
            <Link
              key={s.id}
              to={ROUTES.USER_PROFILE(s.id)}
              className="group rounded-2xl border border-amber-200/80 bg-white/90 hover:bg-amber-50/80 hover:border-amber-300 p-4 text-center shadow-sm transition-all"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 text-white text-[13px] font-bold flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                {initials}
              </div>
              <p className="text-[13px] font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-950">{label}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700 mt-2">Great Seller</p>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <section className="py-14 bg-gradient-to-b from-white via-amber-50/40 to-white border-t border-amber-100/90">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <HeaderBlock />
        {inner()}
      </div>
    </section>
  );
};

export default GreatSellersSection;
