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
import Button, { buttonClasses } from '../../common/components/ui/Button.jsx';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import SearchableDropdown from '../../common/components/ui/SearchableDropdown.jsx';

const GRID_SEARCH_THRESHOLD = 8;
const COMPACT_LIST_THRESHOLD = 6;
const GROUPED_ALPHA_THRESHOLD = 18;

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
  const { t, i18n } = useTranslation();
  const { enums } = useEnums();
  const isCreate = mode === 'create';
  const completedRef = useRef(false);
  const [selectedType, setSelectedType] = useState(null);
  const [selection, setSelection] = useState({});
  // 0 = category, n = selector step n
  const [stepIndex, setStepIndex] = useState(0);
  const [optionFilter, setOptionFilter] = useState('');

  const categories = useMemo(() => {
    void i18n.language;
    return getListingTypeOptions().map(o => {
      const val = o.value.toLowerCase();
      const transLabel = t(`category_${val}`);
      const transDesc = t(`category_${val}_desc`);
      return {
        ...o,
        label: (transLabel && transLabel !== `category_${val}`) ? transLabel : (PREFILTER_CATEGORY_COPY[o.value]?.label || o.label),
        description: (transDesc && transDesc !== `category_${val}_desc`) ? transDesc : (PREFILTER_CATEGORY_COPY[o.value]?.description || o.description)
      };
    });
  }, [t, i18n.language]);
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
              className={`group flex items-center gap-3 rounded border bg-background-primary px-4 py-3.5 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${selected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-card-border-hover'
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
      const showSearch = options.length > GRID_SEARCH_THRESHOLD;
      const isCompactSingleCol = options.length <= COMPACT_LIST_THRESHOLD;
      const useAlphaGroups = !q && filtered.length >= GROUPED_ALPHA_THRESHOLD;

      const renderOptionRow = (opt) => {
        const id = optionId(opt);
        const selected = String(selectedValue) === String(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => handleOptionPick(id)}
            aria-pressed={selected}
            className={`group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors duration-150 focus:outline-none focus-visible:bg-background-secondary ${selected
              ? 'bg-background-tertiary/70 font-semibold text-text-primary'
              : 'text-text-primary hover:bg-background-secondary'
              }`}
          >
            <span className="truncate">{optionLabel(opt)}</span>
            {selected ? (
              <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} aria-hidden />
            ) : (
              <ChevronRight
                className="h-4 w-4 shrink-0 text-text-muted opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                strokeWidth={1.5}
                aria-hidden
              />
            )}
          </button>
        );
      };

      let listBody;
      if (filtered.length === 0) {
        listBody = (
          <div className="p-6">
            <EmptyState
              size="compact"
              title={t('prefilter_no_match', 'Eşleşen seçenek yok')}
              description={t('prefilter_no_match_desc', 'Farklı bir kelime dene.')}
            />
          </div>
        );
      } else if (useAlphaGroups) {
        const groups = [];
        const map = new Map();
        filtered.forEach(opt => {
          const raw = optionLabel(opt).trim();
          const firstChar = raw ? raw.charAt(0).toLocaleUpperCase('tr-TR') : '#';
          const letter = /^[A-ZÇĞİÖŞÜ]/i.test(firstChar) ? firstChar : '#';
          if (!map.has(letter)) {
            const bucket = { letter, items: [] };
            map.set(letter, bucket);
            groups.push(bucket);
          }
          map.get(letter).items.push(opt);
        });
        listBody = (
          <div className="max-h-96 overflow-y-auto divide-y divide-border-light">
            {groups.map(group => (
              <div key={group.letter}>
                <div className="sticky top-0 z-10 border-b border-border-light bg-background-secondary px-4 py-1.5 text-xs font-semibold text-text-tertiary">
                  {group.letter}
                </div>
                <div className="grid grid-cols-1 divide-y divide-border-light sm:grid-cols-3 sm:divide-y-0">
                  {group.items.map(opt => (
                    <div key={optionId(opt)} className="border-border-light sm:border-b sm:border-r sm:[&:nth-child(3n)]:border-r-0">
                      {renderOptionRow(opt)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      } else if (isCompactSingleCol) {
        listBody = (
          <div className="divide-y divide-border-light">
            {filtered.map(renderOptionRow)}
          </div>
        );
      } else {
        listBody = (
          <div className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 divide-y divide-border-light sm:grid-cols-2 sm:divide-y-0">
              {filtered.map(opt => (
                <div key={optionId(opt)} className="border-border-light sm:border-b sm:odd:border-r">
                  {renderOptionRow(opt)}
                </div>
              ))}
            </div>
          </div>
        );
      }

      content = (
        <div>
          {showSearch && (
            <div className="flex items-center gap-2.5 border-b border-border-light px-4 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
              <input
                type="search"
                value={optionFilter}
                onChange={e => setOptionFilter(e.target.value)}
                placeholder={t('prefilter_filter_options', { defaultValue: '{{title}} ara', title: stepTitle(selector) })}
                aria-label={t('filter_options', 'Seçenekleri filtrele')}
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              <span className="shrink-0 text-xs tabular-nums text-text-tertiary">
                {filtered.length}
              </span>
            </div>
          )}
          {listBody}
        </div>
      );
    } else {
      content = (
        <div className="p-4 sm:p-5">
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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button variant="secondary" size="sm" onClick={stepIndex > 0 ? handleBack : onCancel}>
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            <span>{stepIndex > 0 ? t('back', 'Geri') : t('cancel', 'Vazgeç')}</span>
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {!isCreate && (
              <Link to={ROUTES.LISTINGS} className={buttonClasses('secondary', 'sm')}>
                <span>{t('browse_all_listings', 'Tüm ilanları gör')}</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </Link>
            )}
            {stepIndex > 0 && showContinue && (
              <Button variant={isCreate ? 'primary' : 'secondary'} size="sm" onClick={() => goToStep(stepIndex + 1)}>
                <span>{hasValue ? t('continue', 'Devam et') : t('skip', 'Atla')}</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </Button>
            )}
            {!isCreate && stepIndex > 0 && (
              <Button variant="primary" size="sm" onClick={triggerBrowseSearch}>
                <Search className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                <span>{t('prefilter_show_scope_results', { defaultValue: '{{scope}} ilanlarını gör', scope: resultsScope })}</span>
              </Button>
            )}
          </div>
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
          <nav className="mt-4 flex flex-wrap items-center gap-1.5 text-sm" aria-label={t('your_selections', 'Seçimlerin')}>
            <span className="mr-1 text-xs font-medium text-text-tertiary">{t('your_selections', 'Seçimlerin')}</span>
            {crumbs.map((crumb, idx) => (
              <span key={crumb.index} className="inline-flex items-center gap-1.5">
                {idx > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
                )}
                <button
                  type="button"
                  onClick={() => (crumb.index === 0 ? resetCategory() : goToStep(crumb.index))}
                  title={t('prefilter_change_selection', 'Bu seçimi değiştir')}
                  className="rounded-sm font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                  {crumb.label}
                </button>
              </span>
            ))}
          </nav>
        )}

        <div className={stepIndex === 0 ? 'mt-6' : 'mt-6 overflow-hidden rounded border border-border bg-background-primary'}>
          {content}
        </div>
      </PageContainer>
    </div>
  );
};

export default ListingPrefilterSelectionFlow;
