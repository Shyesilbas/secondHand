import React from 'react';
import { Link } from 'react-router-dom';
import { useEnums } from '../../../hooks/useEnums';
import { LISTING_TYPE_ICONS } from '../../../utils/constants';
import { ROUTES } from '../../../constants/routes';
import { listingService } from '../services/listingService';
import useApi from '../../../hooks/useApi';

const ListingCategories = () => {
  const { enums, isLoading } = useEnums();
  const { data: counts = {}, callApi, setData } = useApi({});

  React.useEffect(() => {
    const types = (enums.listingTypes || []).map(t => t.value);
    if (types.length === 0) return;
    (async () => {
      const res = await listingService.getCountsForTypes(types).catch(() => ({}));
      setData(res || {});
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enums.listingTypes?.length]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="h-28 bg-white rounded-xl shadow-sm border border-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  const categories = enums.listingTypes || [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {categories.map((cat) => (
        <Link
          key={cat.value}
          to={ROUTES.LISTINGS}
          state={{ listingType: cat.value }}
          className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all p-4 flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2 text-2xl">
            {LISTING_TYPE_ICONS[cat.value] || cat.icon || '📦'}
          </div>
          <div className="text-sm font-medium text-slate-800 group-hover:text-slate-900">{cat.label}</div>
          <div className="text-xs text-slate-500">{counts[cat.value] != null ? `${counts[cat.value]} listings` : 'Explore'}</div>
        </Link>
      ))}
    </div>
  );
};

export default ListingCategories;


