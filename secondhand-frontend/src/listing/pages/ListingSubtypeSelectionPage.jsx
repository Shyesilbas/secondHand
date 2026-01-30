import React, {useMemo} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useEnums} from '../../common/hooks/useEnums.js';
import {ROUTES} from '../../common/constants/routes.js';
import {getListingConfig} from '../config/listingConfig.js';
import {ArrowLeft, ChevronRight, Sparkles} from 'lucide-react';

const ListingSubtypeSelectionPage = () => {
  const navigate = useNavigate();
  const { listingType } = useParams();
  const { enums, isLoading } = useEnums();

  const config = listingType ? getListingConfig(listingType) : null;
  const subtype = config?.createFlow?.subtypeSelector || null;

  const options = useMemo(() => {
    if (!subtype?.enumKey) return [];
    return enums[subtype.enumKey] || [];
  }, [enums, subtype?.enumKey]);

  if (!listingType || !config) {
    navigate(ROUTES.CREATE_LISTING, { replace: true });
    return null;
  }

  if (!subtype) {
    navigate(`${ROUTES.CREATE_LISTING}?type=${encodeURIComponent(listingType)}`, { replace: true });
    return null;
  }

  const onBack = () => navigate(ROUTES.CREATE_LISTING);

  const onSelect = (id) => {
    const qp = subtype.queryParamKey;
    const url = `${ROUTES.CREATE_LISTING}?type=${encodeURIComponent(listingType)}&${encodeURIComponent(qp)}=${encodeURIComponent(id)}`;
    navigate(url);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{subtype.title || 'Choose type'}</h1>
              <p className="text-slate-600 text-sm font-medium tracking-tight">{subtype.description || 'Select to tailor the form.'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{config.label}</h2>
          <span className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200/60 tracking-tight">
            Step 2 of 3
          </span>
        </div>

        {isLoading ? (
          <div className="text-slate-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {options.map((opt) => {
              const id = opt.id || opt.value;
              const label = opt.label || opt.name;
              const subtitleText = opt.label && opt.name ? opt.name : null;
              return (
                <button
                  key={id}
                  onClick={() => onSelect(id)}
                  className="group relative flex flex-col items-start gap-3 p-6 rounded-3xl bg-white border border-slate-200/60 hover:border-indigo-300/60 hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.15)] transition-all duration-300 text-left w-full"
                >
                  <div className="flex items-start justify-between w-full gap-4">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors tracking-tight">
                        {label}
                      </h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingSubtypeSelectionPage;

