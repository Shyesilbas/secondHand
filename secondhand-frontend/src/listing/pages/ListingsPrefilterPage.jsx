import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import {
  getListingTypeOptions,
  getListingConfig,
  getPrefilterSelectors,
} from '../config/listingConfig.js';
import PrefilterWizardModal from './ListingsPrefilterPage/PrefilterWizardModal.jsx';
import { ArrowRight, ChevronLeft } from 'lucide-react';

const PAGE_TITLE = 'Categories';
const STEP_CATEGORY = 1;
const STEP_FILTERS = 2;

const ListingsPrefilterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    document.title = `${PAGE_TITLE} | SecondHand`;
    return () => {
      document.title = 'SecondHand';
    };
  }, []);

  const typeOptions = useMemo(() => getListingTypeOptions(), []);
  const initialType = (searchParams.get('category') || 'VEHICLE').toUpperCase();

  const [step, setStep] = useState(STEP_CATEGORY);
  const [listingType, setListingType] = useState(initialType);
  const [prefilterValues, setPrefilterValues] = useState({});
  const [step2Animated, setStep2Animated] = useState(false);

  useEffect(() => {
    if (step === STEP_FILTERS) {
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => setStep2Animated(true));
      });
      return () => cancelAnimationFrame(t);
    }
    setStep2Animated(false);
  }, [step]);

  const categoryConfig = useMemo(() => getListingConfig(listingType), [listingType]);
  const categoryLabel = categoryConfig?.label ?? listingType;
  const categoryDescription = categoryConfig?.description ?? '';
  const selectors = useMemo(() => getPrefilterSelectors(listingType), [listingType]);
  const hasPrefilters = selectors.length > 0;

  const currentValues = prefilterValues[listingType] ?? {};

  const handleCategorySelect = (value) => {
    const next = String(value || '').toUpperCase();
    setListingType(next || 'VEHICLE');
    setStep(STEP_FILTERS);
  };

  const handleBackToCategories = () => {
    setStep(STEP_CATEGORY);
  };

  const handlePrefilterChange = (patch) => {
    setPrefilterValues((prev) => ({
      ...prev,
      [listingType]: { ...(prev[listingType] ?? {}), ...patch },
    }));
  };

  const handleContinue = () => {
    const params = new URLSearchParams();
    params.set('category', listingType);
    selectors.forEach((sel) => {
      const v = currentValues[sel.initialDataKey];
      if (v) params.set(sel.paramKey, v);
    });
    navigate(`${ROUTES.LISTINGS}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50/90">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-950/5">
          {step === STEP_CATEGORY && (
            <div className="p-5 transition-all duration-300 ease-out sm:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">What are you looking for?</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select a category to continue. You can add filters on the next step.
                </p>
              </div>

              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Listing categories
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {typeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleCategorySelect(opt.value)}
                    className="group flex flex-col gap-2 rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xl leading-none transition group-hover:bg-teal-100">
                        {opt.icon}
                      </span>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{opt.label}</span>
                    <span className="line-clamp-2 text-xs leading-relaxed text-slate-500">{opt.description}</span>
                  </button>
                ))}
              </div>

              <p className="mt-8 text-center text-sm text-slate-500">
                Want to see everything?{' '}
                <Link to={ROUTES.LISTINGS} className="font-semibold text-teal-800 hover:text-teal-950">
                  Browse all listings
                </Link>
              </p>
            </div>
          )}

          {step === STEP_FILTERS && (
            <>
              {hasPrefilters ? (
                <PrefilterWizardModal
                  open
                  selectors={selectors}
                  value={currentValues}
                  onChange={handlePrefilterChange}
                  categoryLabel={categoryLabel}
                  categoryDescription={categoryDescription}
                  onExitToCategories={handleBackToCategories}
                  onFinish={handleContinue}
                />
              ) : null}

              <div
                className={`p-5 transition-all duration-300 ease-out sm:p-8 ${
                  step2Animated ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-0'
                } ${hasPrefilters ? 'flex min-h-[280px] flex-col items-center justify-center py-12 text-center' : ''}`}
              >
                {hasPrefilters ? (
                  <>
                    <p className="max-w-sm text-sm text-slate-500">
                      Filters open in the overlay—go through each step, or jump to listings anytime.
                    </p>
                    <button
                      type="button"
                      onClick={handleBackToCategories}
                      className="mt-4 text-sm font-semibold text-teal-800 hover:text-teal-950"
                    >
                      Cancel and choose another category
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleBackToCategories}
                      className="mb-6 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate-600 transition hover:text-slate-900"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back to categories
                    </button>

                    <div className="mb-6 border-b border-slate-100 pb-6">
                      <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{categoryLabel}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {categoryDescription ||
                          'Refine with the options below, or continue to see all listings in this category.'}
                      </p>
                    </div>

                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center">
                      <p className="text-sm text-slate-600">
                        No extra filters for this category. Continue to open listings.
                      </p>
                    </div>

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={handleBackToCategories}
                        className="text-center text-sm font-medium text-slate-500 hover:text-slate-800 sm:text-left"
                      >
                        Change category
                      </button>
                      <button
                        type="button"
                        onClick={handleContinue}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
                      >
                        Show listings
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingsPrefilterPage;
