import { useTranslation } from 'react-i18next';
import { Clock, Gauge, Layers, Percent, Tag, Users } from 'lucide-react';
import { Button, Card, Modal } from '../../common/components/ui/index.js';
import { AUDIENCES, DISCOUNT_KINDS } from '../utils/couponFormUtils.js';

const inputCn =
  'mt-1.5 w-full rounded border border-border-light bg-background-primary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-border-focus disabled:cursor-not-allowed disabled:bg-background-tertiary disabled:text-text-tertiary';

const FormSection = ({ Icon, title, subtitle, children, className = '' }) => (
  <Card as="section" padding="compact" border="light" className={className}>
    <div className="mb-3 flex items-start gap-3">
      <Icon className="h-5 w-5 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
      <div className="min-w-0 flex-1 pt-0.5">
        <h3 className="text-sm font-medium tracking-tight text-text-primary">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-sm leading-relaxed text-text-muted">{subtitle}</p> : null}
      </div>
    </div>
    <div className="space-y-3.5">{children}</div>
  </Card>
);

const AdminCouponFormModal = ({
  modal,
  form,
  setForm,
  submitting,
  firstOrderAudience,
  audienceStats,
  audienceStatsLoading,
  discountableListingTypes,
  onClose,
  onSubmit,
  onAudienceSelect,
  onToggleListingType
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={!!modal}
      onClose={onClose}
      title={modal === 'create' ? t('admin_new_coupon') : t('admin_edit_coupon')}
      description={modal === 'create' ? t('admin_coupon_create_desc') : t('admin_coupon_edit_desc')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('cancel', 'Vazgeç')}
          </Button>
          <Button type="submit" form="admin-coupon-form" disabled={submitting}>
            {submitting ? t('saving_progress', 'Kaydediliyor…') : t('save', 'Kaydet')}
          </Button>
        </>
      }
    >
      <form id="admin-coupon-form" onSubmit={onSubmit} className="space-y-4">
        <FormSection Icon={Tag} title={t('temel_bilgiler')} subtitle={t('admin_basic_info_subtitle')}>
          {modal === 'create' && (
            <label className="block">
              <span className="text-xs font-semibold text-text-secondary">
                {t('kod')}
                <span className="text-status-error">*</span>
              </span>
              <input
                className={`${inputCn} uppercase tracking-wide`}
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                placeholder={t('ilk300')}
                required
              />
            </label>
          )}
          <label className="block">
            <span className="text-xs font-semibold text-text-secondary">
              {t('ba_l_k')}
              <span className="text-status-error">*</span>
            </span>
            <input
              className={inputCn}
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder={t('liste_ve_deme_ad_mlar_nda_g_r_n_r')}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-text-secondary">{t('a_klama')}</span>
            <textarea
              className={`${inputCn} min-h-20 resize-y leading-relaxed`}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder={t('kuponun_artlar_n_k_saca_yaz_n')}
            />
          </label>
        </FormSection>

        <FormSection Icon={Users} title={t('hedef_kitle')} subtitle={t('admin_audience_subtitle')}>
          <fieldset className="space-y-2.5" disabled={modal?.mode === 'edit'}>
            <legend className="sr-only">{t('hedef_kitle')}</legend>
            <div className="grid gap-2 sm:grid-cols-1">
              {AUDIENCES.map((opt) => {
                const selected = form.audience === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-start gap-3 rounded border p-3.5 transition-colors sm:p-4 ${
                      selected
                        ? 'border-accent-teal bg-background-secondary ring-1 ring-accent-teal'
                        : 'border-border-light bg-background-primary hover:border-border-dark hover:bg-background-secondary'
                    } ${modal?.mode === 'edit' ? 'cursor-default opacity-95' : ''}`}
                  >
                    <input
                      type="radio"
                      name="coupon-audience"
                      className="mt-1 h-4 w-4 shrink-0 border-border-light text-primary focus:ring-border-focus"
                      checked={selected}
                      onChange={() => onAudienceSelect(opt.value)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-text-primary">{t(opt.labelKey)}</span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-text-secondary">
                        {t(opt.hintKey)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          {modal?.mode === 'edit' && (
            <p className="rounded border border-border bg-background-secondary px-3 py-2 text-sm text-status-warning-text">
              {t('hedef_kitle_olu_turulduktan_sonra_de_i_t')}
            </p>
          )}

          {form.audience === 'NEVER_ORDERED_FIRST_ORDER' && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-border-light bg-background-secondary px-4 py-3.5">
              <div className="flex items-center gap-2.5 text-sm text-text-primary">
                <div className="flex h-10 w-10 items-center justify-center rounded border border-border-light bg-background-primary">
                  <Users className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-semibold">{t('anl_k_uygun_kullan_c')}</p>
                  <p className="text-sm text-text-muted">{t('tamamlanm_demeli_sipari_i_olmayan_kay_tl')}</p>
                </div>
              </div>
              <div className="rounded border border-border-light bg-background-primary px-4 py-2 text-center">
                <span className="block text-2xl font-semibold tabular-nums tracking-tight text-primary">
                  {audienceStatsLoading ? '…' : audienceStats?.eligibleUserCount ?? '—'}
                </span>
                <span className="text-xs font-medium text-text-muted">{t('ki_i')}</span>
              </div>
            </div>
          )}

          {form.audience === 'USER_ID_LIST' && (
            <label className="block">
              <span className="text-xs font-semibold text-text-secondary">{t('kullan_c_id_leri')}</span>
              <span className="mt-0.5 block text-xs font-normal text-text-muted">
                {t('virg_l_veya_bo_lukla_ay_r_n_yinelenenler')}
              </span>
              <input
                className={`${inputCn} text-sm`}
                value={form.eligibleUserIdsText}
                onChange={(e) => setForm((p) => ({ ...p, eligibleUserIdsText: e.target.value }))}
                placeholder={t('rn_12_48_102')}
              />
            </label>
          )}
        </FormSection>

        <FormSection Icon={Clock} title={t('yay_n_ve_s_re')} subtitle={t('admin_publication_subtitle')}>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded border border-border-light bg-background-primary px-4 py-3.5 transition hover:border-border-dark">
            <span className="text-sm font-semibold text-text-primary">{t('kupon_yay_nda')}</span>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
              className="h-5 w-5 shrink-0 rounded border-border-light text-primary focus:ring-2 focus:ring-border-focus focus:ring-offset-0"
            />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-text-secondary">{t('ba_lang')}</span>
              <input
                type="datetime-local"
                className={inputCn}
                value={form.startsAt}
                onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))}
                disabled={firstOrderAudience}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-text-secondary">{t('biti')}</span>
              <input
                type="datetime-local"
                className={inputCn}
                value={form.endsAt}
                onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))}
                disabled={firstOrderAudience}
              />
            </label>
          </div>
          {firstOrderAudience && (
            <p className="text-sm text-text-muted">{t('bu_kuralda_s_re_s_n_r_yok_alanlar_kilitl')}</p>
          )}
        </FormSection>

        <FormSection Icon={Percent} title={t('i_ndirim')} subtitle={t('admin_discount_subtitle')}>
          <label className="block">
            <span className="text-xs font-semibold text-text-secondary">{t('i_ndirim_t_r')}</span>
            <select
              className={inputCn}
              value={form.discountKind}
              onChange={(e) => setForm((p) => ({ ...p, discountKind: e.target.value }))}
              disabled={firstOrderAudience}
            >
              {DISCOUNT_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-text-secondary">{t('de_er')}</span>
              <input
                type="number"
                step="any"
                className={inputCn}
                value={form.value}
                onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                disabled={firstOrderAudience}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-text-secondary">{t('min_sepet')}</span>
              <input
                type="number"
                step="any"
                className={inputCn}
                value={form.minSubtotal}
                onChange={(e) => setForm((p) => ({ ...p, minSubtotal: e.target.value }))}
                disabled={firstOrderAudience}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-semibold text-text-secondary">{t('maks_indirim')}</span>
            <input
              type="number"
              step="any"
              className={inputCn}
              value={form.maxDiscount}
              onChange={(e) => setForm((p) => ({ ...p, maxDiscount: e.target.value }))}
              disabled={firstOrderAudience}
            />
          </label>
        </FormSection>

        <FormSection Icon={Layers} title={t('r_n_kapsam')} subtitle={t('admin_scope_subtitle')}>
          <div className="flex flex-wrap gap-2">
            {discountableListingTypes.map((typeCode) => {
              const on = form.eligibleTypes.includes(typeCode);
              return (
                <button
                  key={typeCode}
                  type="button"
                  onClick={() => onToggleListingType(typeCode)}
                  className={`rounded border px-3 py-2 text-xs font-medium transition ${
                    on
                      ? 'border-accent-teal bg-background-secondary text-primary ring-1 ring-accent-teal'
                      : 'border-border-light bg-background-primary text-text-secondary hover:border-border-dark hover:bg-background-secondary'
                  }`}
                >
                  {typeCode.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>
        </FormSection>

        <FormSection Icon={Gauge} title={t('kullan_m_limitleri')} subtitle={t('admin_limits_subtitle')}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-text-secondary">{t('global_limit')}</span>
              <span className="mt-0.5 block text-xs font-normal text-text-muted">{t('bo_s_n_rs_z')}</span>
              <input
                type="number"
                min={0}
                step={1}
                className={inputCn}
                value={form.usageLimitGlobal}
                onChange={(e) => setForm((p) => ({ ...p, usageLimitGlobal: e.target.value }))}
                disabled={firstOrderAudience}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-text-secondary">{t('ki_i_ba_limit')}</span>
              <span className="mt-0.5 block text-xs font-normal text-text-muted">{t('bo_s_n_rs_z')}</span>
              <input
                type="number"
                min={0}
                step={1}
                className={inputCn}
                value={form.usageLimitPerUser}
                onChange={(e) => setForm((p) => ({ ...p, usageLimitPerUser: e.target.value }))}
                disabled={firstOrderAudience}
              />
            </label>
          </div>
        </FormSection>
      </form>
    </Modal>
  );
};

export default AdminCouponFormModal;
