import { useTranslation } from "react-i18next";
import { GREAT_SELLER_POLICY as P } from './greatSellerPolicyCopy.js';
import { BadgeCheck, Banknote, Star, UsersRound, Info } from 'lucide-react';
const getRules = (t) => [{
 icon: Banknote,
 key: 'sales',
 title: t('great_seller_sales_activity_title'),
 body: t('great_seller_sales_activity_desc', { sales: P.minQualifyingSales, days: P.rollingWindowDays })
}, {
 icon: BadgeCheck,
 key: 'value',
 title: t('great_seller_value_standards_title'),
 body: t('great_seller_value_standards_desc', { price: P.minUnitPriceTry.toLocaleString('tr-TR') })
}, {
 icon: UsersRound,
 key: 'account',
 title: t('great_seller_account_authority_title'),
 body: t('great_seller_account_authority_desc', { reviewers: P.minDistinctReviewers })
}, {
 icon: Star,
 key: 'trust',
 title: t('great_seller_trust_score_title'),
 body: t('great_seller_trust_score_desc', { rating: P.minAverageRating })
}];
const GreatSellerRulesCallout = ({
 className = ''
}) => {
 const { t } = useTranslation();
 const rules = getRules(t);
 return <div className={`bg-background-primary border border-border-light rounded-xl p-6 sm:p-8 ${className}`}>
 <div className="flex items-center gap-3 mb-8">
 <div className="w-10 h-10 rounded-full bg-background-secondary flex items-center justify-center">
 <Info className="w-5 h-5 text-text-muted" />
 </div>
 <div>
 <h3 className="text-sm font-medium text-text-primary">{t("platform_recognition_standards")}</h3>
 <p className="text-xs text-text-muted font-medium">{t("automatic_eligibility_based_on_60_day_pe")}</p>
 </div>
 </div>

 <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
 {rules.map((rule) => {
 const Icon = rule.icon;
 return <div key={rule.key} className="group relative">
 <div className="flex items-center gap-3 mb-3">
 <div className="p-2 rounded-lg bg-background-secondary text-text-muted group-hover:bg-primary-light group-hover:text-primary transition-colors">
 <Icon className="w-4 h-4" aria-hidden />
 </div>
 <p className="text-xs font-bold text-text-primary uppercase tracking-wider">{rule.title}</p>
 </div>
 <p className="text-body text-text-secondary leading-relaxed font-medium">{rule.body}</p>
 </div>;
 })}
 </div>

 <div className="mt-8 pt-6 border-t border-border-light text-center">
 <p className="text-caption text-text-muted font-medium tracking-wide italic">{t("sellers_who_meet_all_four_criteria_simul")}</p>
 </div>
 </div>;
};
export default GreatSellerRulesCallout;