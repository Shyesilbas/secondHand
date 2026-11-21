import { useTranslation } from "react-i18next";
import { GREAT_SELLER_POLICY as P } from './greatSellerPolicyCopy.js';
import { BadgeCheck, Banknote, Star, UsersRound } from 'lucide-react';
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
 return <div className={`rounded border border-border-light bg-background-primary p-5 shadow-sm sm:p-6 ${className}`}>
 <div className="mb-6">
 <div>
 <h3 className="text-base font-semibold text-text-primary">{t("platform_recognition_standards")}</h3>
 <p className="mt-1 text-sm text-text-secondary">{t("automatic_eligibility_based_on_60_day_pe")}</p>
 </div>
 </div>

 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
 {rules.map((rule) => {
 const Icon = rule.icon;
 return <div key={rule.key}>
 <div className="mb-2 flex items-center gap-3">
 <div className="rounded bg-background-secondary p-2 text-text-secondary">
 <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
 </div>
 <p className="text-sm font-semibold text-text-primary">{rule.title}</p>
 </div>
 <p className="text-sm text-text-secondary">{rule.body}</p>
 </div>;
 })}
 </div>

 <div className="mt-6 border-t border-border-light pt-4">
 <p className="text-sm text-text-tertiary">{t("sellers_who_meet_all_four_criteria_simul")}</p>
 </div>
 </div>;
};
export default GreatSellerRulesCallout;