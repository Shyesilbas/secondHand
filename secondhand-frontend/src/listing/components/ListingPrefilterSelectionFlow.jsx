import { useTranslation } from 'react-i18next';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Loader2, Pencil, Search } from 'lucide-react';
import { useEnums } from '../../common/hooks/useEnums.js';
import { createFormRegistry, getCreateFlowSelectorSteps, getListingTypeOptions, getPrefilterSelectors, isCreateSelectionComplete } from '../config/listingConfig.js';
import { PREFILTER_CATEGORY_COPY, PREFILTER_STEP_TITLES } from '../config/prefilterCopy.js';
import { ROUTES } from '../../common/constants/routes.js';
import { isPrefilterValueFilled } from '../utils/prefilterSelection.js';
import { findEngine } from '../../vehicle/utils/vehicleCatalogUtils.js';
import PageContainer from '../../common/components/layout/PageContainer.jsx';
import Button from '../../common/components/ui/Button.jsx';
import { inputNormal } from '../../common/components/forms/inputStyles.js';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import SearchableDropdown from '../../common/components/ui/SearchableDropdown.jsx';

const GRID_SEARCH_THRESHOLD = 8;
const COMPACT_LIST_THRESHOLD = 6;
const GROUPED_ALPHA_THRESHOLD = 40;
// Letter groups only help when they hold several options each.
const MIN_AVG_GROUP_SIZE = 3;

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
      <div className="flex min-h-screen items-center justify-center bg-background-page px-4" role="status">
        <div className="flex flex-col items-center text-center">
          <Loader2 className="h-6 w-6 animate-spin text-text-tertiary motion-reduce:animate-none" strokeWidth={1.5} aria-hidden />
          <p className="mt-3 text-base font-semibold text-text-primary">{t('prefilter_preparing_form', 'İlan formun hazırlanıyor…')}</p>
          <p className="mt-1 text-sm text-text-secondary">{t('prefilter_preparing_form_desc', 'Kategorine uygun alanlar yükleniyor.')}</p>
        </div>
      </div>
    );
  }

  /* Answers so far, one chip per answered step; a chip jumps back to its step. */
  const category = categories.find(c => c.value === selectedType);
  const crumbs = selectedType ? [
    { index: 0, title: t('category', 'Kategori'), label: category?.label || selectedType, icon: category?.icon },
    ...selectorSteps.slice(0, Math.max(stepIndex - 1, 0)).map((step, i) => {
      const value = selection?.[step.initialDataKey];
      const opt = resolveOptions(step, selection).find(o => String(optionId(o)) === String(value));
      return { index: i + 1, title: stepTitle(step), label: opt ? optionLabel(opt) : t('prefilter_any', 'Tümü') };
    })
  ] : [];

  /* Step content */
  let content;
  let searchControl = null;
  if (stepIndex === 0) {
    content = (
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map(type => {
          const Icon = type.icon;
          return (
            <li key={type.value}>
              <button
                type="button"
                onClick={() => handleTypeSelect(type.value)}
                className="group flex w-full items-center gap-4 rounded border border-border-light bg-background-primary p-4 text-left shadow-sm transition hover:border-border hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              >
                {Icon && (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-background-secondary text-text-secondary transition-colors duration-150 group-hover:bg-accent-teal-50 group-hover:text-accent-teal-800">
                    <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-text-primary">{type.label}</span>
                  <span className="mt-0.5 block truncate text-sm text-text-tertiary">{type.description}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-text-muted transition-colors duration-150 group-hover:text-text-secondary" strokeWidth={1.5} aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
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
      const isCompact = options.length <= COMPACT_LIST_THRESHOLD;
      const useAlphaGroups = !q && filtered.length >= GROUPED_ALPHA_THRESHOLD;
      const gridClass = isCompact
        ? 'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

      const renderOption = (opt) => {
        const id = optionId(opt);
        const selected = String(selectedValue) === String(id);
        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => handleOptionPick(id)}
              aria-pressed={selected}
              className={`flex h-full w-full items-center justify-between gap-2 rounded border px-3.5 text-left text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${isCompact ? 'min-h-12 py-3' : 'min-h-11 py-2.5'} ${selected
                ? 'border-accent-teal bg-accent-teal-50 font-medium text-accent-teal-800 ring-1 ring-accent-teal'
                : 'border-border-light bg-background-primary text-text-primary hover:border-border hover:bg-background-secondary'
                }`}
            >
              <span className="min-w-0 break-words">{optionLabel(opt)}</span>
              {selected && <Check className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />}
            </button>
          </li>
        );
      };

      let listBody;
      if (filtered.length === 0) {
        listBody = (
          <EmptyState
            size="compact"
            icon={Search}
            title={t('prefilter_no_match', 'Eşleşen seçenek yok')}
            description={t('prefilter_no_match_desc', 'Farklı bir kelime dene.')}
            primaryAction={{ label: t('clear_search', 'Aramayı temizle'), onClick: () => setOptionFilter('') }}
          />
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
        listBody = groups.length * MIN_AVG_GROUP_SIZE > filtered.length ? <ul className={gridClass}>{filtered.map(renderOption)}</ul> : (
          <div className="space-y-6">
            {groups.map(group => (
              <section key={group.letter} aria-label={group.letter}>
                <h2 className="mb-2 text-sm font-semibold text-text-tertiary">{group.letter}</h2>
                <ul className={gridClass}>{group.items.map(renderOption)}</ul>
              </section>
            ))}
          </div>
        );
      } else {
        listBody = <ul className={gridClass}>{filtered.map(renderOption)}</ul>;
      }

      if (showSearch) {
        searchControl = (
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" strokeWidth={1.5} aria-hidden />
            <input
              type="search"
              value={optionFilter}
              onChange={e => setOptionFilter(e.target.value)}
              placeholder={t('prefilter_filter_options', { defaultValue: '{{title}} ara', title: stepTitle(selector) })}
              aria-label={t('filter_options', 'Seçenekleri filtrele')}
              className={`${inputNormal} pl-9 pr-24`}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums text-text-tertiary">
              {t('prefilter_option_count', { defaultValue: '{{count}} seçenek', count: filtered.length })}
            </span>
          </div>
        );
      }
      content = listBody;
    } else {
      content = (
        <div className="rounded border border-border-light bg-background-primary p-5 shadow-sm">
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
  const scope = crumbs[crumbs.length - 1]?.label;
  const subheading = stepIndex === 0
    ? (isCreate
      ? t('prefilter_create_desc', 'Kategoriyi seç, birkaç soruyla ilan formunu senin için hazırlayalım.')
      : t('prefilter_browse_desc', 'Kategori seç, istersen birkaç adımda sonuçları daralt.'))
    : (isCreate
      ? t('prefilter_create_step_desc', 'Bu cevaplar formu önceden doldurur, yayınlamadan önce hepsini değiştirebilirsin.')
      : t('prefilter_browse_step_desc', { defaultValue: 'Seç ya da bu adımı atlayıp {{scope}} ilanlarının hepsini gör.', scope }));

  const hasValue = selector && isPrefilterValueFilled(selection?.[selector.initialDataKey]);
  const showContinue = stepIndex > 0 && !isLastStep && (hasValue || selector?.optional);
  const currentValueLabel = hasValue
    ? optionLabel(resolveOptions(selector, selection).find(o => String(optionId(o)) === String(selection[selector.initialDataKey])))
    : null;
  const resultsScope = currentValueLabel || scope;
  const showResults = !isCreate && stepIndex > 0;
  const showFooter = showContinue || showResults;

  return (
    <div className="min-h-screen bg-background-page">
      <PageContainer className="pt-5 sm:pt-6">
        <div className="flex items-start gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="-ml-2 mt-0.5 w-9 shrink-0 !px-0"
            aria-label={stepIndex > 0 ? t('back', 'Geri') : t('cancel', 'Vazgeç')}
            title={stepIndex > 0 ? t('back', 'Geri') : t('cancel', 'Vazgeç')}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary">{heading}</h1>
              {!isCreate && (
                <Link
                  to={ROUTES.LISTINGS}
                  className="inline-flex items-center gap-1 rounded text-sm font-medium text-text-link transition-colors duration-150 hover:text-text-linkHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                  {t('browse_all_listings', 'Tüm ilanlara gözat')}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                </Link>
              )}
            </div>
            {subheading && <p className="mt-1 text-sm text-text-secondary">{subheading}</p>}
          </div>
        </div>

        {selectedType && (
          <div className="mt-4 flex items-center gap-3">
            <span className="shrink-0 text-sm tabular-nums text-text-tertiary">
              {t('prefilter_step_of', { defaultValue: 'Adım {{current}}/{{total}}', current: stepIndex + 1, total: totalSteps })}
            </span>
            <ol className="flex flex-1 gap-1.5" aria-label={t('prefilter_progress', 'Seçim adımları')}>
              {Array.from({ length: totalSteps }, (_, i) => (
                <li
                  key={i}
                  aria-current={i === stepIndex ? 'step' : undefined}
                  className={`h-1 flex-1 rounded-full transition-colors duration-150 ${i <= stepIndex ? 'bg-accent-teal' : 'bg-border'}`}
                />
              ))}
            </ol>
          </div>
        )}

        {(crumbs.length > 0 || searchControl) && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex min-w-0 flex-wrap items-center gap-2" aria-label={t('your_selections', 'Seçimlerin')}>
              {crumbs.map(crumb => {
                const CrumbIcon = crumb.icon;
                return (
                  <button
                    key={crumb.index}
                    type="button"
                    onClick={() => (crumb.index === 0 ? resetCategory() : goToStep(crumb.index))}
                    title={t('prefilter_change_selection', 'Bu seçimi değiştir')}
                    className="group inline-flex h-9 max-w-full items-center gap-1.5 rounded border border-border-light bg-background-primary px-2.5 text-sm shadow-sm transition-colors duration-150 hover:border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                  >
                    {CrumbIcon && <CrumbIcon className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />}
                    <span className="shrink-0 text-text-tertiary">{crumb.title}</span>
                    <span className="truncate font-medium text-text-primary">{crumb.label}</span>
                    <Pencil className="h-3.5 w-3.5 shrink-0 text-text-muted transition-colors duration-150 group-hover:text-text-secondary" strokeWidth={1.5} aria-hidden />
                  </button>
                );
              })}
            </nav>
            {searchControl}
          </div>
        )}

        <div className="mt-5 pb-10">{content}</div>

        {showFooter && (
          <div className="sticky bottom-0 z-10 -mx-4 border-t border-border-light bg-background-page px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
              {showContinue && (
                <Button
                  variant={isCreate ? 'primary' : 'secondary'}
                  onClick={() => goToStep(stepIndex + 1)}
                  className="w-full sm:w-auto"
                >
                  <span>{hasValue ? t('continue', 'Devam et') : t('skip', 'Atla')}</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                </Button>
              )}
              {showResults && (
                <Button variant="primary" onClick={triggerBrowseSearch} className="w-full sm:w-auto">
                  <Search className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  <span className="truncate">{t('prefilter_show_scope_results', { defaultValue: '{{scope}} ilanlarını gör', scope: resultsScope })}</span>
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
