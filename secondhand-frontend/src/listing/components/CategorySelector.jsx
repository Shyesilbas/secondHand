import { useTranslation } from "react-i18next";
import { useEnums } from '../../common/hooks/useEnums';
const CategorySelector = ({
  selectedCategory,
  onCategoryChange,
  compact = false
}) => {
  const {
    t
  } = useTranslation();
  const {
    enums,
    isLoading: enumsLoading
  } = useEnums();
  if (enumsLoading) {
    return <div className="flex items-center justify-center py-4">
                <div className="flex items-center gap-2 text-slate-500">
                    <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm">{t("loading")}</span>
                </div>
            </div>;
  }
  const handleCategoryChange = categoryValue => {
    onCategoryChange(categoryValue);
  };
  if (compact) {
    return <div className="space-y-3">
                <h3 className="text-sm font-medium text-text-primary">{t("category")}</h3>
                <div className="space-y-2">
                    {enums.listingTypes.map(type => <button key={type.value} onClick={() => handleCategoryChange(type.value)} className={`w-full p-2.5 rounded-lg border transition-all duration-200 text-left hover:shadow-sm ${selectedCategory === type.value ? 'border-emerald-500 bg-status-success-bg text-emerald-700' : 'border-border-light bg-background-primary text-text-secondary hover:border-border-DEFAULT'}`}>
                            <div className="flex items-center space-x-2">
                                <span className="text-base">{type.icon || '📦'}</span>
                                <div className="flex-1">
                                    <div className="text-sm font-medium">{type.label}</div>
                                </div>
                                {selectedCategory === type.value && <div className="w-2 h-2 rounded-full bg-status-success-bg"></div>}
                            </div>
                        </button>)}
                </div>
                {selectedCategory && <div className="mt-3 p-2 bg-status-success-bg border border-emerald-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-emerald-700">
                                {enums.listingTypes.find(type => type.value === selectedCategory)?.label}
                            </span>
                            <button onClick={() => handleCategoryChange(null)} className="text-xs text-status-success hover:text-emerald-800 underline">{t("clear")}</button>
                        </div>
                    </div>}
            </div>;
  }
  return <div className="space-y-4">
            <h3 className="text-sm font-medium text-text-primary">{t("category")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {enums.listingTypes.map(type => <button key={type.value} onClick={() => handleCategoryChange(type.value)} className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${selectedCategory === type.value ? 'border-emerald-500 bg-status-success-bg text-emerald-700' : 'border-border-light bg-background-primary text-text-secondary hover:border-border-DEFAULT'}`}>
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">{type.icon || '📦'}</span>
                            <div>
                                <div className="font-medium">{type.label}</div>
                                {selectedCategory === type.value && <div className="text-sm text-status-success mt-1">{t("selected")}</div>}
                            </div>
                        </div>
                    </button>)}
            </div>
            {selectedCategory && <div className="mt-4 p-3 bg-status-success-bg border border-emerald-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-emerald-700">{t("selected")}{enums.listingTypes.find(type => type.value === selectedCategory)?.label}
                        </span>
                        <button onClick={() => handleCategoryChange(null)} className="text-sm text-status-success hover:text-emerald-800 underline">{t("clear_selection")}</button>
                    </div>
                </div>}
        </div>;
};
export default CategorySelector;