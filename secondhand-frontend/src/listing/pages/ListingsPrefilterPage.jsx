import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { getListingTypeOptions, getListingConfig, getPrefilterSelectors } from '../config/listingConfig.js';
import PrefilterFieldsFromConfig from './ListingsPrefilterPage/PrefilterFieldsFromConfig.jsx';
import { ChevronLeft } from 'lucide-react';

const PAGE_TITLE = 'Categories';
const STEP_CATEGORY = 1;
const STEP_FILTERS = 2;

const ListingsPrefilterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    document.title = `${PAGE_TITLE} | SecondHand`;
    return () => { document.title = 'SecondHand'; };
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
    const selectors = getPrefilterSelectors(listingType);
    selectors.forEach((sel) => {
      const v = currentValues[sel.initialDataKey];
      if (v) params.set(sel.paramKey, v);
    });
    navigate(`${ROUTES.LISTINGS}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {step === STEP_CATEGORY && (
            <div className="transition-all duration-300 ease-out opacity-100">
              <div className="border-b border-slate-100 pb-5 mb-6">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Find listings faster</h1>
                <p className="mt-1 text-sm text-slate-500 tracking-tight">
                  Pick what you are interested in first, then we will show you matching listings.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Listing category</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {typeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleCategorySelect(opt.value)}
                      className="flex flex-col items-start gap-1 px-3 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
                    >
                      <span className="text-xl leading-none">{opt.icon}</span>
                      <span className="text-sm font-semibold tracking-tight">{opt.label}</span>
                      <span className="text-xs text-slate-500 tracking-tight line-clamp-2">{opt.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === STEP_FILTERS && (
            <div
              className={`transition-all duration-300 ease-out ${
                step2Animated ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
              }`}
            >
              <button
                type="button"
                onClick={handleBackToCategories}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Categories
              </button>
              <div className="border-b border-slate-100 pb-5 mb-6">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{categoryLabel}</h1>
                <p className="mt-1 text-sm text-slate-500 tracking-tight">
                  {categoryDescription || 'Refine your search with the filters below, or show all listings in this category.'}
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Details</p>
                <PrefilterFieldsFromConfig
                  listingType={listingType}
                  value={currentValues}
                  onChange={handlePrefilterChange}
                />
              </div>
              <div className="pt-4 border-t border-slate-100 mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="inline-flex items-center px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold tracking-tight hover:bg-slate-800 transition-colors"
                >
                  Show listings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingsPrefilterPage;
