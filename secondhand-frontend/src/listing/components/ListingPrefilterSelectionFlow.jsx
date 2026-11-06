import { useTranslation } from 'react-i18next';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Search } from 'lucide-react';
import { useEnums } from '../../common/hooks/useEnums.js';
import { createFormRegistry, getCreateFlowSelectorSteps, getListingTypeOptions, getPrefilterSelectors, isCreateSelectionComplete } from '../config/listingConfig.js';
import { PREFILTER_CATEGORY_COPY, PREFILTER_STEP_TITLES } from '../config/prefilterCopy.js';
import { ROUTES } from '../../common/constants/routes.js';
import { isPrefilterValueFilled } from '../utils/prefilterSelection.js';
import { findEngine } from '../../vehicle/utils/vehicleCatalogUtils.js';
import PageContainer from '../../common/components/layout/PageContainer.jsx';
import Button from '../../common/components/ui/Button.jsx';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import SearchableDropdown from '../../common/components/ui/SearchableDropdown.jsx';
import { inputNormal } from '../../common/components/forms/inputStyles.js';

const GRID_SEARCH_THRESHOLD = 8;

const makeGetName = (enums) => (enumKey, idOrValue, { upper = false } = {}) => {
  const list = enums?.[enumKey] || [];
  const found = list.find(x => String(x?.id ?? x?.value ?? '') === String(idOrValue ?? ''));
  const name = found?.name || found?.label || '';
  return upper ? name.toUpperCase() : name;
};

/** Visible selector steps for a category, given the answers so far. */
const buildSelectorSteps = (type, mode, selection, enums) => {
  if (!type) return [];
  const base = mode === 'create' ? getCreateFlowSelectorSteps(type) : getPrefilterSelectors(type);
  const ctx = { formData: selection, selection, enums, getName: makeGetName(enums) };
  return base.filter(s => (typeof s.visibleWhen === 'function' ? Boolean(s.visibleWhen(ctx)) : true));
};

/** Electronics model names end in "8GB/256GB"-style specs; pre-fill RAM and storage from them. */
const deriveElectronicsSpecs = (next, enums, modelId) => {
  const model = (enums?.electronicModels || []).find(x => String(x?.id ?? '') === String(modelId));
  const name = String(model?.name || '');
  if (!name.includes(' > ')) return;
  const spec = name.split(' > ').map(p => p.trim()).pop()?.toLowerCase();
  if (!spec) return;
  const toGb = (part) => {
    const n = parseInt(part.replace('gb', '').replace('tb', '').trim(), 10);
    if (Number.isNaN(n)) return null;
    return part.includes('tb') ? n * 1024 : n;
  };
  if (spec.includes('/')) {
    const [ramPart, storagePart] = spec.split('/');
    const ram = parseInt(ramPart.replace('gb', '').trim(), 10);
    const storage = toGb(storagePart);
    if (!Number.isNaN(ram)) next.ram = ram;
    if (storage != null) next.storage = storage;
  } else if (spec.endsWith('gb') || spec.endsWith('tb')) {
    const storage = toGb(spec);
    if (storage != null) next.storage = storage;
  }
};

/** New answers after picking `value` for step `index`: later answers are cleared, derived fields filled. */
const applySelection = (prev, steps, index, key, value, enums) => {
  const next = { ...(prev || {}), [key]: value };
  for (let i = index + 1; i < steps.length; i += 1) {
    const k = steps[i]?.initialDataKey;
    if (k) next[k] = null;
  }
  if (key === 'vehicleEngineId' && value) {
    const eng = findEngine(enums, value);
    if (eng?.fuelType) next.fuelType = eng.fuelType;
  }
  if (key === 'electronicModelId' && value) deriveElectronicsSpecs(next, enums, value);
  return next;
};

const stepTitle = (step) => PREFILTER_STEP_TITLES[step?.initialDataKey] || step?.title || '';
const optionId = (opt) => opt?.id ?? opt?.value;
const optionLabel = (opt) => opt?.label || opt?.name || String(optionId(opt) ?? '');

const ListingPrefilterSelectionFlow = ({ mode = 'browse', onComplete, onCancel }) => {
  const { t } = useTranslation();
  const { enums } = useEnums();
  const isCreate = mode === 'create';
  const completedRef = useRef(false);
  const [selectedType, setSelectedType] = useState(null);
  const [selection, setSelection] = useState({});
  // 0 = category, n = selector step n
  const [stepIndex, setStepIndex] = useState(0);
  const [optionFilter, setOptionFilter] = useState('');

  const categories = useMemo(() => getListingTypeOptions().map(o => ({
    ...o,
    label: PREFILTER_CATEGORY_COPY[o.value]?.label || o.label,
    description: PREFILTER_CATEGORY_COPY[o.value]?.description || o.description
  })), []);
  const selectorSteps = useMemo(() => buildSelectorSteps(selectedType, mode, selection, enums), [selectedType, mode, selection, enums]);
  const totalSteps = selectorSteps.length + 1;
  const selector = stepIndex > 0 ? selectorSteps[stepIndex - 1] : null;
  const isLastStep = stepIndex >= selectorSteps.length;

  const resolveOptions = useCallback((step, state) => {
    if (!step) return [];
    if (typeof step.getOptions === 'function') return step.getOptions({ enums, selection: state || {} }) || [];
    return step.options || enums?.[step.enumKey] || [];
  }, [enums]);

  const goToStep = useCallback((index) => {
    setStepIndex(index);
    setOptionFilter('');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const resetCategory = () => {
    setSelectedType(null);
    setSelection({});
    goToStep(0);
  };

  const handleTypeSelect = (type) => {
    completedRef.current = false;
    setSelectedType(type);
    setSelection({});
    goToStep(buildSelectorSteps(type, mode, {}, enums).length > 0 ? 1 : 0);
  };

  const handleOptionPick = (value) => {
    const index = stepIndex - 1;
    const next = applySelection(selection, selectorSteps, index, selector.initialDataKey, value, enums);
    setSelection(next);
    if (value == null) return;
    // The next step list can change with this answer (visibleWhen), so count it from the new answers.
    const nextSteps = buildSelectorSteps(selectedType, mode, next, enums);
    if (stepIndex < nextSteps.length) goToStep(stepIndex + 1);
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      onCancel();
      return;
    }
    if (stepIndex === 1) {
      resetCategory();
      return;
    }
    goToStep(stepIndex - 1);
  };

  const triggerBrowseSearch = () => {
    if (isCreate || !selectedType) return;
    onComplete({ listingType: selectedType, selection: { ...selection } });
  };

  const SelectedForm = selectedType ? createFormRegistry[selectedType] : null;
  const isReadyToFinish = isCreate && !!SelectedForm && isCreateSelectionComplete(selectedType, selection, enums);

  useLayoutEffect(() => {
    if (!isReadyToFinish || completedRef.current) return;
    completedRef.current = true;
    onComplete({ listingType: selectedType, selection: { ...selection } });
  }, [isReadyToFinish, onComplete, selectedType, selection]);

  if (isReadyToFinish) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-secondary px-4" role="status">
        <div className="text-center">
          <p className="text-base font-semibold text-text-primary">{t('prefilter_preparing_form', 'İlan formun hazırlanıyor…')}</p>
          <p className="mt-1 text-sm text-text-secondary">{t('prefilter_preparing_form_desc', 'Kategorine uygun alanlar yükleniyor.')}</p>
        </div>
      </div>
    );
  }

  /* ── Breadcrumb of answers so far: each one jumps back to its step ── */
  const category = categories.find(c => c.value === selectedType);
  const crumbs = selectedType ? [
    { index: 0, label: category?.label || selectedType },
    ...selectorSteps.slice(0, Math.max(stepIndex - 1, 0)).map((step, i) => {
      const value = selection?.[step.initialDataKey];
      const opt = resolveOptions(step, selection).find(o => String(optionId(o)) === String(value));
      return { index: i + 1, label: opt ? optionLabel(opt) : t('prefilter_any', 'Tümü') };
    })
  ] : [];

  /* ── Step content ── */
  let content;
  if (stepIndex === 0) {
    content = (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {categories.map(type => {
          const Icon = type.icon;
          const selected = selectedType === type.value;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => handleTypeSelect(type.value)}
              aria-pressed={selected}
              className={`group flex items-center gap-3 rounded border bg-background-primary px-4 py-3.5 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
                selected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-card-border-hover'
              }`}
            >
              {Icon && <Icon className="h-5 w-5 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-text-primary">{type.label}</span>
                <span className="mt-0.5 block truncate text-sm text-text-tertiary">{type.description}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-text-muted transition-colors group-hover:text-text-secondary" strokeWidth={1.5} aria-hidden />
            </button>
          );
        })}
      </div>
    );
  } else if (selector) {
    const options = resolveOptions(selector, selection);
    const selectedValue = selection?.[selector.initialDataKey] ?? null;
    const dependsOn = Array.isArray(selector.dependsOn) ? selector.dependsOn : [];
    const isEnabled = dependsOn.every(k => isPrefilterValueFilled(selection?.[k]));

    if ((selector.kind || 'grid') === 'grid') {
      const q = optionFilter.trim().toLowerCase();
      const filtered = q
        ? options.filter(opt => optionLabel(opt).toLowerCase().includes(q)
          || (Array.isArray(opt.aliases) && opt.aliases.some(a => String(a).toLowerCase().includes(q))))
        : options;
      content = (
        <div className="space-y-4">
          {options.length > GRID_SEARCH_THRESHOLD && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" strokeWidth={1.5} aria-hidden />
              <input
                type="search"
                value={optionFilter}
                onChange={e => setOptionFilter(e.target.value)}
                placeholder={t('prefilter_filter_options', { defaultValue: '{{title}} ara', title: stepTitle(selector) })}
                aria-label={t('filter_options', 'Seçenekleri filtrele')}
                className={`${inputNormal} pl-9`}
              />
            </div>
          )}
          {filtered.length === 0 ? (
            <EmptyState
              size="compact"
              title={t('prefilter_no_match', 'Eşleşen seçenek yok')}
              description={t('prefilter_no_match_desc', 'Farklı bir kelime dene.')}
            />
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {filtered.map(opt => {
                const id = optionId(opt);
                const selected = String(selectedValue) === String(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleOptionPick(id)}
                    aria-pressed={selected}
                    className={`flex items-center justify-between gap-2 rounded border bg-background-primary px-3.5 py-3 text-left text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
                      selected ? 'border-primary font-medium text-text-primary ring-1 ring-primary' : 'border-border text-text-primary hover:border-card-border-hover'
                    }`}
                  >
                    <span className="truncate">{optionLabel(opt)}</span>
                    {selected
                      ? <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} aria-hidden />
                      : <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    } else {
      content = (
        <div>
          <SearchableDropdown
            options={options}
            selectedValues={selectedValue ? [selectedValue] : []}
            onSelectionChange={vals => handleOptionPick(Array.isArray(vals) ? vals[0] ?? null : null)}
            label={stepTitle(selector)}
            placeholder={isEnabled ? t('select', 'Seç…') : t('prefilter_complete_previous', 'Önce önceki adımları tamamla')}
            multiple={false}
            disabled={!isEnabled}
          />
        </div>
      );
    }
  }

  const heading = stepIndex === 0
    ? (isCreate ? t('prefilter_create_title', 'Ne satıyorsun?') : t('prefilter_browse_title', 'Hangi kategoride arıyorsun?'))
    : stepTitle(selector);
  const subheading = stepIndex === 0
    ? (isCreate
      ? t('prefilter_create_desc', 'Kategoriyi seç, birkaç soruyla ilan formunu senin için hazırlayalım.')
      : t('prefilter_browse_desc', 'Kategori seç, istersen birkaç adımda sonuçları daralt.'))
    : (isCreate
      ? t('prefilter_create_step_desc', 'Bu cevaplar formu önceden doldurur, yayınlamadan önce hepsini değiştirebilirsin.')
      : null);

  const hasValue = selector && isPrefilterValueFilled(selection?.[selector.initialDataKey]);
  const showContinue = stepIndex > 0 && !isLastStep && (hasValue || selector?.optional);
  const currentValueLabel = hasValue
    ? optionLabel(resolveOptions(selector, selection).find(o => String(optionId(o)) === String(selection[selector.initialDataKey])))
    : null;
  const resultsScope = currentValueLabel || crumbs[crumbs.length - 1]?.label;
  const browseHint = !isCreate && stepIndex > 0
    ? t('prefilter_browse_step_desc', { defaultValue: 'Seç ya da bu adımı atlayıp {{scope}} ilanlarının hepsini gör.', scope: crumbs[crumbs.length - 1]?.label })
    : null;

  return (
    <div className="min-h-screen bg-background-secondary">
      <PageContainer narrow className="py-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" className="-ml-3" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            <span>{t('cancel', 'Vazgeç')}</span>
          </Button>
          {!isCreate && (
            <Link to={ROUTES.LISTINGS} className="inline-flex items-center gap-1 text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary">
              {t('browse_all_listings', 'Tüm ilanlar')}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </Link>
          )}
        </div>

        {selectedType && (
          <nav className="mb-5" aria-label={t('prefilter_progress', 'Seçim adımları')}>
            <p className="text-sm tabular-nums text-text-tertiary">
              {t('prefilter_step_of', { defaultValue: 'Adım {{current}}/{{total}}', current: stepIndex + 1, total: totalSteps })}
            </p>
            <ol className="mt-2 flex gap-1.5" aria-hidden>
              {Array.from({ length: totalSteps }, (_, i) => (
                <li key={i} className={`h-1 flex-1 rounded-full ${i <= stepIndex ? 'bg-primary' : 'bg-border'}`} />
              ))}
            </ol>
          </nav>
        )}

        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">{heading}</h1>
        {(subheading || browseHint) && <p className="mt-1.5 text-sm text-text-secondary">{subheading || browseHint}</p>}

        {crumbs.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-text-tertiary">{t('your_selections', 'Seçimlerin')}</span>
            {crumbs.map(crumb => (
              <button
                key={crumb.index}
                type="button"
                onClick={() => (crumb.index === 0 ? resetCategory() : goToStep(crumb.index))}
                title={t('prefilter_change_selection', 'Bu seçimi değiştir')}
                className="inline-flex items-center rounded border border-border bg-background-primary px-2.5 py-1 text-sm text-text-primary transition-colors duration-150 hover:border-card-border-hover"
              >
                {crumb.label}
              </button>
            ))}
          </div>
        )}

        <div className={stepIndex === 0 ? 'mt-6' : 'mt-6 rounded border border-border bg-background-primary p-4 sm:p-5'}>
          {content}
        </div>

        {stepIndex > 0 && (
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              {t('back', 'Geri')}
            </Button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              {showContinue && (
                <Button variant={isCreate ? 'primary' : 'secondary'} onClick={() => goToStep(stepIndex + 1)}>
                  {hasValue ? t('continue', 'Devam et') : t('skip', 'Atla')}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                </Button>
              )}
              {!isCreate && (
                <Button onClick={triggerBrowseSearch}>
                  <Search className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  {t('prefilter_show_scope_results', { defaultValue: '{{scope}} ilanlarını gör', scope: resultsScope })}
                </Button>
              )}
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default ListingPrefilterSelectionFlow;
