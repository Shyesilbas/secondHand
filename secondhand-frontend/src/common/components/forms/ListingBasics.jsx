import { useTranslation } from "react-i18next";
import { formatCurrency, parsePrice } from '../../formatters.js';
import { PriceInput } from '../ui/PriceInput.jsx';
import { Type, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { FieldError, SectionCard } from './FormPrimitives.jsx';
import { inputError, inputNormal } from './inputStyles.js';
const ListingBasics = ({
 formData,
 errors = {},
 onInputChange,
 enums,
 showQuantity = true
}) => {
 const {
 t
 } = useTranslation();
 const titleLen = formData.title?.length || 0;
 const titleProgress = Math.min(titleLen / 100, 1);
 const titleCountColor = titleProgress > 0.9 ? 'text-status-error' : titleProgress > 0.7 ? 'text-status-warning' : 'text-text-muted';
 return <div className="space-y-6">
 <SectionCard title={t("general_information")} description="Basic listing details" icon={Type}>
 <div className="space-y-5">
 <div>
 <label className="mb-1.5 block text-sm font-medium text-text-primary">{t("listing_title")}<span className="text-status-error">*</span>
 </label>
 <div className="relative">
 <input type="text" name="title" value={formData.title} onChange={onInputChange} className={errors.title ? inputError : inputNormal} placeholder={t("e_g_iphone_13_pro_excellent_condition")} maxLength={100} />
 <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums transition-colors duration-200 ${titleCountColor}`}>
 {titleLen}/100
 </span>
 </div>
 {/* Subtle progress bar under title input */}
 <div className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-background-tertiary">
 <motion.div className="h-full rounded-full bg-secondary-300" animate={{
 width: `${titleProgress * 100}%`
 }} transition={{
 type: 'spring',
 stiffness: 300,
 damping: 30
 }} />
 </div>
 <FieldError error={errors.title} />
 </div>

 <div>
 <label className="mb-1.5 block text-sm font-medium text-text-primary">{t("description")}<span className="text-status-error">*</span>
 </label>
 <div className="relative">
 <textarea name="description" value={formData.description} onChange={onInputChange} rows={5} className={`${errors.description ? inputError : inputNormal} resize-none pb-7`} placeholder={t("describe_your_item_in_detail_condition_f")} />
 <span className="absolute bottom-2.5 right-3 text-xs tabular-nums text-text-muted">
 {formData.description?.length || 0} / 5000
 </span>
 </div>
 <FieldError error={errors.description} />
 </div>
 </div>
 </SectionCard>

 <SectionCard title={t("pricing")} description="Set the price and quantity" icon={DollarSign}>
 <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
 <div>
 <label className="mb-1.5 block text-sm font-medium text-text-primary">{t("price")}<span className="text-status-error">*</span>
 </label>
 <div className="relative flex">
 <PriceInput value={parsePrice(formData.price) ?? 0} onChange={n => onInputChange({
 target: {
 name: 'price',
 value: n != null ? String(n) : ''
 }
 })} placeholder="0,00" className={`flex-1 min-w-0 rounded-l rounded-r-none border-r-0 focus:outline-none ${errors.price ? inputError : inputNormal}`} />
 <div className="flex shrink-0 items-center">
 <select name="currency" value={formData.currency} onChange={onInputChange} className="h-full cursor-pointer rounded-r border border-l-0 border-border/60 bg-background-secondary/80 py-0 pl-2.5 pr-6 text-sm font-medium text-text-secondary transition-colors focus:outline-none hover:bg-background-tertiary">
 {enums.currencies?.map(currency => <option key={currency.value} value={currency.value}>
 {currency.symbol} {currency.value}
 </option>)}
 </select>
 </div>
 </div>
 {formData.price && parsePrice(formData.price) != null && <motion.p initial={{
 opacity: 0
 }} animate={{
 opacity: 1
 }} className="mt-1.5 text-body text-text-tertiary">{t("preview")}{' '}
 <span className="font-semibold tabular-nums text-text-primary">
 {formatCurrency(parsePrice(formData.price), formData.currency)}
 </span>
 </motion.p>}
 <FieldError error={errors.price} />
 </div>

 {showQuantity && <div>
 <label className="mb-1.5 block text-sm font-medium text-text-primary">{t("quantity")}<span className="text-status-error">*</span>
 </label>
 <input type="number" name="quantity" value={formData.quantity ?? ''} onChange={onInputChange} className={errors.quantity ? inputError : inputNormal} placeholder={t("e_g_5")} min="1" step="1" />
 <FieldError error={errors.quantity} />
 </div>}

 <div className="md:col-span-2 mt-4 pt-4 border-t border-border-light">
 <label className="flex items-start gap-3 cursor-pointer select-none">
 <input type="checkbox" name="allowMeetup" checked={Boolean(formData.allowMeetup)} onChange={e => onInputChange({
 target: {
 name: 'allowMeetup',
 checked: e.target.checked,
 type: 'checkbox'
 }
 })} className="mt-1 rounded border-card-border-hover text-text-primary focus:ring-primary" />
 <div>
 <span className="block text-sm font-medium text-text-primary">{t("sadece_kendi_ehrimde_elden_teslimat_yapm")}</span>
 <span className="block text-xs text-text-tertiary">{t("al_c_yla_g_venli_bulu_ma_noktas_nda_bulu")}</span>
 <span className="block text-xs text-primary/95 mt-1.5 font-medium bg-background-tertiary/60 rounded p-2.5 border border-primary/50 max-w-lg leading-relaxed">{t("bu_alan_i_aretledi_inizde_r_n_n_z_sipari")}</span>
 </div>
 </label>
 <FieldError error={errors.allowMeetup} />
 </div>
 </div>
 </SectionCard>
 </div>;
};
export default ListingBasics;