import { useTranslation } from "react-i18next";
import { formatCurrency, parsePrice } from '../../formatters.js';
import { PriceInput } from '../ui/PriceInput.jsx';
import { Type, DollarSign, Info } from 'lucide-react';
import { FieldError, SectionCard } from './FormPrimitives.jsx';
import { inputError, inputNormal } from './inputStyles.js';

const ListingBasics = ({
  formData,
  errors = {},
  onInputChange,
  enums,
  showQuantity = true
}) => {
  const { t } = useTranslation();
  const titleLen = formData.title?.length || 0;
  const currentPrice = formData.price ? parsePrice(formData.price) : null;

  return (
    <div className="space-y-8">
      <SectionCard title={t("general_information", "General Information")} description={t("basic_listing_details", "Basic listing details")} icon={Type}>
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="listing-title" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {t("listing_title", "Listing Title")} <span className="text-status-error">*</span>
              </label>
              <span className="text-xs tabular-nums text-text-muted">
                {titleLen}/100
              </span>
            </div>
            <input
              id="listing-title"
              type="text"
              name="title"
              value={formData.title || ''}
              onChange={onInputChange}
              className={errors.title ? inputError : inputNormal}
              placeholder={t("e_g_iphone_13_pro_excellent_condition", "e.g., iPhone 13 Pro - Excellent Condition")}
              maxLength={100}
            />
            <FieldError error={errors.title} />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="listing-description" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {t("description", "Description")} <span className="text-status-error">*</span>
              </label>
              <span className="text-xs tabular-nums text-text-muted">
                {formData.description?.length || 0} / 5000
              </span>
            </div>
            <textarea
              id="listing-description"
              name="description"
              value={formData.description || ''}
              onChange={onInputChange}
              rows={4}
              className={`${errors.description ? inputError : inputNormal} resize-none`}
              placeholder={t("describe_your_item_in_detail_condition_f", "Describe your item in detail — condition, features, usage history, flaws...")}
            />
            <FieldError error={errors.description} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title={t("pricing", "Pricing")} description={t("set_price_and_quantity", "Set the price and quantity")} icon={DollarSign}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
              {t("price", "Price")} <span className="text-status-error">*</span>
            </label>
            <div className="flex rounded border border-border-light bg-background-primary transition-colors focus-within:border-border-focus focus-within:ring-2 focus-within:ring-border-focus">
              <PriceInput
                value={currentPrice}
                onChange={n => onInputChange({
                  target: {
                    name: 'price',
                    value: n != null ? String(n) : ''
                  }
                })}
                placeholder="0,00"
                className="flex-1 min-w-0 border-0 focus:ring-0 focus:border-0"
              />
              <div className="border-l border-border-light bg-background-secondary">
                <select
                  name="currency"
                  value={formData.currency || 'TRY'}
                  onChange={onInputChange}
                  aria-label="Currency"
                  className="h-full cursor-pointer bg-transparent py-0 pl-2.5 pr-6 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary focus:outline-none"
                >
                  {enums.currencies?.map(currency => (
                    <option key={currency.value} value={currency.value}>
                      {currency.symbol} {currency.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {currentPrice != null && currentPrice > 0 && (
              <p className="mt-1 text-xs text-text-secondary">
                {t("preview", "Preview:")}{' '}
                <span className="font-semibold tabular-nums text-text-primary">
                  {formatCurrency(currentPrice, formData.currency)}
                </span>
              </p>
            )}
            <FieldError error={errors.price} />
          </div>

          {showQuantity && (
            <div>
              <label htmlFor="listing-quantity" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {t("quantity", "Quantity")} <span className="text-status-error">*</span>
              </label>
              <input
                id="listing-quantity"
                type="number"
                name="quantity"
                value={formData.quantity ?? ''}
                onChange={onInputChange}
                className={errors.quantity ? inputError : inputNormal}
                placeholder={t("e_g_5", "e.g. 5")}
                min="1"
                step="1"
              />
              <FieldError error={errors.quantity} />
            </div>
          )}

          <div className="md:col-span-2 pt-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="allowMeetup"
                checked={Boolean(formData.allowMeetup)}
                onChange={e => onInputChange({
                  target: {
                    name: 'allowMeetup',
                    checked: e.target.checked,
                    type: 'checkbox'
                  }
                })}
                className="mt-0.5 h-4 w-4 rounded border-border-light text-primary focus:ring-primary"
              />
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-text-primary">
                  {t("sadece_kendi_ehrimde_elden_teslimat_yapm", "Sadece kendi şehrimde elden teslimat yapmayı onaylıyorum.")}
                </span>
                <span className="block text-xs text-text-secondary mt-0.5">
                  {t("al_c_yla_g_venli_bulu_ma_noktas_nda_bulu", "Alıcıyla güvenli buluşma noktasında buluşarak ürünü elden teslim etme seçeneğini aktif hale getirir.")}
                </span>
                <div className="mt-2 flex items-start gap-2 rounded border border-border-light bg-background-secondary p-2.5">
                  <Info className="h-4 w-4 shrink-0 text-text-muted mt-0.5" strokeWidth={1.5} aria-hidden />
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {t("bu_alan_i_aretledi_inizde_r_n_n_z_sipari", "Bu alanı işaretlediğinizde, ürününüz sipariş edilirse telefon numaranız alıcıya, alıcının telefon numarası ise size gösterilir.")}
                  </p>
                </div>
              </div>
            </label>
            <FieldError error={errors.allowMeetup} />
          </div>
        </div>
      </SectionCard>
    </div>
  );
};
export default ListingBasics;