import {GREAT_SELLER_POLICY as P} from './greatSellerPolicyCopy.js';
import {BadgeCheck, Banknote, Star, UsersRound, Info} from 'lucide-react';
import { motion } from 'framer-motion';

const RULES = [
  {
    icon: Banknote,
    title: `Sales Activity`,
    body: `At least ${P.minQualifyingSales} qualifying orders within the last ${P.rollingWindowDays} days.`,
  },
  {
    icon: BadgeCheck,
    title: `Value Standards`,
    body: `Items must meet the ${P.minUnitPriceTry.toLocaleString('tr-TR')} TRY minimum price threshold.`,
  },
  {
    icon: UsersRound,
    title: `Account Authority`,
    body: `Verified feedback from at least ${P.minDistinctReviewers} distinct buyers on your profile.`,
  },
  {
    icon: Star,
    title: `Trust Score`,
    body: `Maintain a consistent average seller rating of ${P.minAverageRating} or higher.`,
  },
];

const GreatSellerRulesCallout = ({className = ''}) => (
  <div
    className={`bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 ${className}`}
  >
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
        <Info className="w-5 h-5 text-slate-400" />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900">Platform Recognition Standards</h3>
        <p className="text-xs text-slate-400 font-medium">Automatic eligibility based on 60-day performance rolling window.</p>
      </div>
    </div>

    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {RULES.map(({icon: Icon, title, body}, idx) => (
        <div 
          key={title}
          className="group relative"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <Icon className="w-4 h-4" aria-hidden />
            </div>
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">{title}</p>
          </div>
          <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{body}</p>
        </div>
      ))}
    </div>

    <div className="mt-8 pt-6 border-t border-slate-50 text-center">
      <p className="text-[10px] text-slate-400 font-medium tracking-wide italic">
        Sellers who meet all four criteria simultaneously receive the badge on their profile and listings.
      </p>
    </div>
  </div>
);

export default GreatSellerRulesCallout;
