import {GREAT_SELLER_POLICY as P} from './greatSellerPolicyCopy.js';
import {BadgeCheck, Banknote, Star, UsersRound} from 'lucide-react';

const RULES = [
  {
    icon: Banknote,
    title: `Paid lines in the last ${P.rollingWindowDays} days`,
    body: `At least ${P.minQualifyingSales} qualifying order lines: payment completed; order not cancelled or refunded; order creation date falls in the rolling window.`,
  },
  {
    icon: BadgeCheck,
    title: `${P.minUnitPriceTry.toLocaleString('en-US')} TRY+ per counted line`,
    body: `Each line must be TRY and meet the minimum unit price (listing line price, not cart/discount-adjusted totals). Quantity & repeat sales both count.`,
  },
  {
    icon: UsersRound,
    title: `${P.minDistinctReviewers}+ different reviewers`,
    body: `Reviews left on your seller profile by distinct buyers — lifetime, not tied to the 60-day sales window.`,
  },
  {
    icon: Star,
    title: `${P.minAverageRating}+ average seller rating`,
    body: `Your overall average across reviews on your profile meets or exceeds ${P.minAverageRating}. Meet all criteria at once to show the badge.`,
  },
];

const GreatSellerRulesCallout = ({className = ''}) => (
  <div
    className={`rounded-2xl border border-amber-200/70 bg-white/80 backdrop-blur-sm p-4 sm:p-5 ${className}`}
  >
    <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-800/90 mb-3">
      How sellers earn Great Seller
    </p>
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
      {RULES.map(({icon: Icon, title, body}) => (
        <li key={title} className="flex gap-2.5 min-w-0">
          <span className="shrink-0 w-9 h-9 rounded-xl bg-amber-100/90 border border-amber-200/80 flex items-center justify-center">
            <Icon className="w-4 h-4 text-amber-800" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-slate-900 leading-snug">{title}</p>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{body}</p>
          </div>
        </li>
      ))}
    </ul>
    <p className="mt-4 text-[10px] text-slate-400 leading-relaxed border-t border-amber-100/80 pt-3">
      Same thresholds as listings and profiles; shown here for transparency.
    </p>
  </div>
);

export default GreatSellerRulesCallout;
