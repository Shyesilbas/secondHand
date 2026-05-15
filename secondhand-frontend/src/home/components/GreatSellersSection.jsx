import {Link} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {ROUTES} from '../../common/constants/routes.js';
import {userService} from '../../user/services/userService.js';
import {ArrowRight, Award, Star, CalendarDays} from 'lucide-react';
import GreatSellerRulesCallout from './GreatSellerRulesCallout.jsx';
import { motion } from 'framer-motion';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
};

const HeaderBlock = () => (
  <div className="relative z-10 mb-12">
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
      <div className="max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Community Spotlight</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
          Trust-Verified Sellers
        </h2>
        <p className="text-base text-slate-500 mt-4 font-medium leading-relaxed">
          High-performance sellers recognized for their consistent delivery, quality items, and exceptional buyer satisfaction scores.
        </p>
      </div>

      <Link
        to={ROUTES.LISTINGS}
        className="group inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors"
      >
        View all marketplace listings
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  </div>
);

const SellerCard = ({ s, idx }) => {
  const fullName = `${s.name || ''} ${s.surname || ''}`.trim() || 'Anonymous Seller';
  const initials = `${s.name?.[0] || ''}${s.surname?.[0] || ''}`.toUpperCase() || 'S';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.03 }}
    >
      <Link
        to={ROUTES.USER_PROFILE(s.id)}
        className="group block bg-white border border-slate-100 rounded-2xl p-5 transition-all duration-300 hover:border-slate-200 hover:shadow-md"
      >
        <div className="flex items-start gap-4">
          {/* Avatar - Calm Slate */}
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 transition-colors group-hover:bg-slate-100">
            <span className="text-[13px] font-bold text-slate-600">{initials}</span>
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-900 truncate mb-1 group-hover:text-indigo-600 transition-colors">
              {fullName}
            </h3>
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {/* Rating / Trust Score */}
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-[11px] font-bold text-slate-700">{s.averageRating?.toFixed(1) || '0.0'}</span>
                <span className="text-[10px] text-slate-400 font-medium">Score</span>
              </div>
              
              <div className="w-1 h-1 rounded-full bg-slate-200" />
              
              {/* Join Date */}
              <div className="flex items-center gap-1 text-slate-400">
                <CalendarDays className="w-3 h-3" />
                <span className="text-[10px] font-medium">{formatDate(s.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Badge - Subtle */}
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 py-0.5 px-2 bg-indigo-50 rounded-md">
            <Award className="w-3 h-3 text-indigo-600" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-700">Great Seller</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
      </Link>
    </motion.div>
  );
};

const GreatSellersSection = () => {
  const limit = 12;
  const {data: sellers = [], isLoading, error} = useQuery({
    queryKey: ['greatSellersHome', limit],
    queryFn: () => userService.listGreatSellers(limit),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <section className="py-20 bg-[#fafafa] border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <HeaderBlock />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {isLoading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-white border border-slate-100 animate-pulse" />
            ))
          ) : error ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm italic">
              Unable to load featured sellers at this moment.
            </div>
          ) : !sellers.length ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm">
              New community-verified sellers will appear here soon.
            </div>
          ) : (
            sellers.map((s, idx) => (
              <SellerCard key={s.id} s={s} idx={idx} />
            ))
          )}
        </div>

        <div className="mt-16">
          <GreatSellerRulesCallout />
        </div>
      </div>
    </section>
  );
};

export default GreatSellersSection;
