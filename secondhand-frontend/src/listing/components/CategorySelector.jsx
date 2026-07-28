import { useTranslation } from "react-i18next";
import { useEnums } from '../../common/hooks/useEnums';

const CategorySelector = ({
  selectedCategory,
  onCategoryChange,
  compact = false
}) => {
  const { t } = useTranslation();
  const { enums, isLoading: enumsLoading } = useEnums();

  if (enumsLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-2 text-slate-500">
          <svg className="animate-spin w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-xs font-semibold">{t("loading", "Yükleniyor...")}</span>
        </div>
      </div>
    );
  }

  const handleCategoryChange = categoryValue => {
    onCategoryChange(categoryValue);
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">{t("category", "Kategori")}</h3>
        <div className="space-y-2">
          {enums.listingTypes.map(type => {
            const isSelected = selectedCategory === type.value;
            return (
              <button
                key={type.value}
                onClick={() => handleCategoryChange(type.value)}
                className={`w-full p-3 rounded-xl border transition-all duration-200 text-left hover:shadow-xs cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-extrabold ring-1 ring-emerald-600/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 font-medium'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-lg">{type.icon || '📦'}</span>
                  <div className="flex-1">
                    <div className="text-xs font-extrabold">{type.label}</div>
                  </div>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-emerald-600 shadow-xs" />}
                </div>
              </button>
            );
          })}
        </div>

        {selectedCategory && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800">
                {t("selected", "Seçili")}: {enums.listingTypes.find(type => type.value === selectedCategory)?.label}
              </span>
              <button onClick={() => handleCategoryChange(null)} className="text-xs font-extrabold text-emerald-700 hover:text-emerald-900 underline cursor-pointer">
                {t("clear", "Temizle")}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">{t("category", "Kategori")}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {enums.listingTypes.map(type => {
          const isSelected = selectedCategory === type.value;
          return (
            <button
              key={type.value}
              onClick={() => handleCategoryChange(type.value)}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left hover:shadow-sm cursor-pointer ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 ring-2 ring-emerald-600/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{type.icon || '📦'}</span>
                <div>
                  <div className="font-extrabold text-sm text-slate-900">{type.label}</div>
                  {isSelected && <div className="text-xs font-bold text-emerald-700 mt-1">{t("selected", "Seçili")}</div>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedCategory && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">
              {t("selected", "Seçili")}: {enums.listingTypes.find(type => type.value === selectedCategory)?.label}
            </span>
            <button onClick={() => handleCategoryChange(null)} className="text-xs font-extrabold text-emerald-700 hover:text-emerald-900 underline cursor-pointer">
              {t("clear_selection", "Seçimi Temizle")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;