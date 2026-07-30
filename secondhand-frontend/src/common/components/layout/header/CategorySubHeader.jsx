import React, { useState, useRef, useMemo } from 'react';
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useClickOutside } from '../../../hooks/useClickOutside.js';
import { useEnums } from '../../../hooks/useEnums.js';
import { ROUTES } from '../../../constants/routes.js';
import {
  Car,
  Smartphone,
  Home,
  Shirt,
  BookOpen,
  Package,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Layers,
  Check,
  RotateCcw
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'VEHICLE',
    labelKey: 'vehicles',
    defaultLabel: 'Vasıta',
    icon: Car,
    typeEnumKey: 'vehicleTypes',
    brandEnumKey: 'carBrands',
    modelEnumKey: 'vehicleModels',
    typeParamKey: 'vehicleTypeIds',
    brandParamKey: 'brandIds',
    modelParamKey: 'vehicleModelIds',
    step1Title: '1. Araç Türü Seçin',
    step2Title: '2. Marka Seçin',
    step3Title: '3. Model Seçin',
    fallbacks: {
      types: [
        { id: 'CAR', name: 'Otomobil' },
        { id: 'MOTORCYCLE', name: 'Motosiklet' },
        { id: 'COMMERCIAL', name: 'Ticari Araçlar' },
        { id: 'TRUCK', name: 'Kamyon & Çekici' },
        { id: 'VAN', name: 'Van & Minibüs' },
      ],
      brands: [
        { id: 'BMW', name: 'BMW' },
        { id: 'MERCEDES', name: 'Mercedes-Benz' },
        { id: 'AUDI', name: 'Audi' },
        { id: 'VOLKSWAGEN', name: 'Volkswagen' },
        { id: 'TOYOTA', name: 'Toyota' },
        { id: 'RENAULT', name: 'Renault' },
        { id: 'FORD', name: 'Ford' },
        { id: 'HONDA', name: 'Honda' },
      ]
    }
  },
  {
    id: 'ELECTRONICS',
    labelKey: 'electronics',
    defaultLabel: 'Elektronik',
    icon: Smartphone,
    typeEnumKey: 'electronicTypes',
    brandEnumKey: 'electronicBrands',
    modelEnumKey: 'electronicModels',
    typeParamKey: 'electronicTypeIds',
    brandParamKey: 'electronicBrandIds',
    modelParamKey: 'electronicModelIds',
    step1Title: '1. Cihaz Türü Seçin',
    step2Title: '2. Marka Seçin',
    step3Title: '3. Model Seçin',
    fallbacks: {
      types: [
        { id: 'MOBILE_PHONE', name: 'Cep Telefonu' },
        { id: 'LAPTOP', name: 'Dizüstü Bilgisayar' },
        { id: 'TABLET', name: 'Tablet' },
        { id: 'HEADPHONES', name: 'Kulaklık' },
        { id: 'TV', name: 'Televizyon' },
        { id: 'GAME_CONSOLE', name: 'Oyun Konsolu' },
        { id: 'SMARTWATCH', name: 'Akıllı Saat' },
      ],
      brands: [
        { id: 'APPLE', name: 'Apple' },
        { id: 'SAMSUNG', name: 'Samsung' },
        { id: 'SONY', name: 'Sony' },
        { id: 'XIAOMI', name: 'Xiaomi' },
        { id: 'ASUS', name: 'ASUS' },
        { id: 'LENOVO', name: 'Lenovo' },
      ]
    }
  },
  {
    id: 'REAL_ESTATE',
    labelKey: 'real_estate',
    defaultLabel: 'Emlak',
    icon: Home,
    typeEnumKey: 'realEstateTypes',
    brandEnumKey: 'realEstateAdTypes',
    modelEnumKey: 'heatingTypes',
    typeParamKey: 'realEstateTypeIds',
    brandParamKey: 'adTypeId',
    modelParamKey: 'heatingTypeIds',
    step1Title: '1. Mülk Tipi Seçin',
    step2Title: '2. İlan Türü Seçin',
    step3Title: '3. Isınma Tipi Seçin',
    fallbacks: {
      types: [
        { id: 'APARTMENT', name: 'Daire' },
        { id: 'RESIDENCE', name: 'Rezidans' },
        { id: 'VILLA', name: 'Villa / Müstakil Ev' },
        { id: 'LAND', name: 'Konut İmarlı Arsa' },
        { id: 'OFFICE', name: 'Ofis / Büro' },
        { id: 'COMMERCIAL', name: 'Dükkan / Mağaza' },
      ],
      brands: [
        { id: 'FOR_SALE', name: 'Satılık' },
        { id: 'FOR_RENT', name: 'Kiralık' },
        { id: 'DAILY_RENT', name: 'Günlük Kiralık' },
        { id: 'ROOMMATE', name: 'Devren / Ev Arkadaşı' },
      ]
    }
  },
  {
    id: 'CLOTHING',
    labelKey: 'fashion',
    defaultLabel: 'Moda & Giyim',
    icon: Shirt,
    typeEnumKey: 'clothingTypes',
    brandEnumKey: 'clothingBrands',
    modelEnumKey: 'clothingGenders',
    typeParamKey: 'types',
    brandParamKey: 'brands',
    modelParamKey: 'clothingGenders',
    step1Title: '1. Giyim Türü Seçin',
    step2Title: '2. Marka Seçin',
    step3Title: '3. Cinsiyet Seçin',
    fallbacks: {
      types: [
        { id: 'T_SHIRT', name: 'T-Shirt' },
        { id: 'SHIRT', name: 'Gömlek' },
        { id: 'JEANS', name: 'Kot Pantolon (Jeans)' },
        { id: 'DRESS', name: 'Elbise' },
        { id: 'COAT', name: 'Mont / Kaban' },
        { id: 'SNEAKERS', name: 'Spor Ayakkabı / Sneaker' },
        { id: 'BAG', name: 'Çanta' },
      ],
      brands: [
        { id: 'NIKE', name: 'Nike' },
        { id: 'ADIDAS', name: 'Adidas' },
        { id: 'ZARA', name: 'Zara' },
        { id: 'MANGO', name: 'Mango' },
        { id: 'MAVI', name: 'Mavi' },
        { id: 'PUMA', name: 'Puma' },
        { id: 'HM', name: 'H&M' },
      ]
    }
  },
  {
    id: 'BOOKS',
    labelKey: 'books',
    defaultLabel: 'Kitap & Kültür',
    icon: BookOpen,
    typeEnumKey: 'bookTypes',
    brandEnumKey: 'bookFormats',
    modelEnumKey: 'bookConditions',
    typeParamKey: 'bookTypeIds',
    brandParamKey: 'formatIds',
    modelParamKey: 'conditionIds',
    step1Title: '1. Kitap Türü Seçin',
    step2Title: '2. Kapak Formatı Seçin',
    step3Title: '3. Kondisyon Seçin',
    fallbacks: {
      types: [
        { id: 'OKUMA_KITABI', name: 'Roman & Edebiyat Kitabı' },
        { id: 'DERS_KITABI', name: 'Ders Kitabı' },
        { id: 'TEST_KITABI', name: 'Test & Sınav Hazırlık Kitabı' },
        { id: 'COCUK_KITAPLARI', name: 'Çocuk & Gençlik Kitapları' },
        { id: 'KISISEL_GELISIM', name: 'Kişisel Gelişim & Psikoloji' },
        { id: 'BILIM_VE_TEKNOLOJI', name: 'Yazılım & Teknoloji' },
      ],
      brands: [
        { id: 'HARDCOVER', name: 'Ciltli (Hardcover)' },
        { id: 'PAPERBACK', name: 'Karton Kapak (Paperback)' },
        { id: 'SPIRAL', name: 'Spiralli' },
        { id: 'EBOOK', name: 'E-Kitap' },
      ]
    }
  }
];

const CategorySubHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enums } = useEnums();
  const [activeCategory, setActiveCategory] = useState(null);

  // Cascading step selections per active category
  const [selectedType, setSelectedType] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);

  const containerRef = useRef(null);

  useClickOutside(containerRef, () => {
    setActiveCategory(null);
    resetSelections();
  }, !!activeCategory);

  const resetSelections = () => {
    setSelectedType(null);
    setSelectedBrand(null);
    setSelectedModel(null);
  };

  const handleToggleCategory = (catId) => {
    if (activeCategory === catId) {
      setActiveCategory(null);
      resetSelections();
    } else {
      setActiveCategory(catId);
      resetSelections();
    }
  };

  const currentCatConfig = useMemo(() => {
    return CATEGORIES.find(c => c.id === activeCategory);
  }, [activeCategory]);

  // Resolve Step 1 (Types)
  const step1Items = useMemo(() => {
    if (!currentCatConfig) return [];
    const key = currentCatConfig.typeEnumKey;
    const backendData = enums?.[key];
    if (Array.isArray(backendData) && backendData.length > 0) {
      return backendData.map(item => ({
        id: item.id || item.value || String(item),
        name: item.label || item.name || item.value || String(item)
      }));
    }
    return currentCatConfig.fallbacks.types || [];
  }, [currentCatConfig, enums]);

  // Resolve Step 2 (Brands / Secondary)
  const step2Items = useMemo(() => {
    if (!currentCatConfig) return [];
    const key = currentCatConfig.brandEnumKey;
    const backendData = enums?.[key];
    let items = [];
    if (Array.isArray(backendData) && backendData.length > 0) {
      items = backendData.map(item => ({
        id: item.id || item.value || String(item),
        name: item.label || item.name || item.value || String(item)
      }));
    } else {
      items = currentCatConfig.fallbacks.brands || [];
    }

    // Filter by step 1 selection if models/brand relationship exists
    if (selectedType && enums?.electronicModels && currentCatConfig.id === 'ELECTRONICS') {
      const validBrandIds = new Set(
        enums.electronicModels
          .filter(m => String(m?.typeId ?? m?.type_id ?? '') === String(selectedType.id))
          .map(m => String(m?.brandId ?? m?.brand_id ?? ''))
          .filter(Boolean)
      );
      if (validBrandIds.size > 0) {
        items = items.filter(b => validBrandIds.has(String(b.id)));
      }
    }
    return items;
  }, [currentCatConfig, enums, selectedType]);

  // Resolve Step 3 (Models / Tertiary)
  const step3Items = useMemo(() => {
    if (!currentCatConfig) return [];
    const modelKey = currentCatConfig.modelEnumKey;
    const allModels = enums?.[modelKey];

    if (Array.isArray(allModels) && allModels.length > 0) {
      return allModels
        .filter(m => {
          const typeMatch = !selectedType || String(m?.typeId ?? m?.type_id ?? '') === String(selectedType.id);
          const brandMatch = !selectedBrand || String(m?.brandId ?? m?.brand_id ?? '') === String(selectedBrand.id);
          return typeMatch && brandMatch;
        })
        .map(m => ({
          id: m.id || m.value || String(m),
          name: m.label || m.name || m.value || String(m)
        }));
    }

    return [];
  }, [currentCatConfig, enums, selectedType, selectedBrand]);

  // Perform navigation with accumulated search parameters
  const executeSearch = (overrideType = selectedType, overrideBrand = selectedBrand, overrideModel = selectedModel) => {
    if (!currentCatConfig) return;
    setActiveCategory(null);

    const queryParams = new URLSearchParams();
    queryParams.set('category', currentCatConfig.id);

    if (overrideType && currentCatConfig.typeParamKey) {
      queryParams.set(currentCatConfig.typeParamKey, overrideType.id);
    }
    if (overrideBrand && currentCatConfig.brandParamKey) {
      queryParams.set(currentCatConfig.brandParamKey, overrideBrand.id);
    }
    if (overrideModel && currentCatConfig.modelParamKey) {
      queryParams.set(currentCatConfig.modelParamKey, overrideModel.id);
    }

    navigate(`${ROUTES.LISTINGS}?${queryParams.toString()}`);
    resetSelections();
  };

  return (
    <div
      ref={containerRef}
      className="relative z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-700 shadow-xs"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Main Nav Bar Header Buttons */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 py-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isOpen = activeCategory === cat.id;

            return (
              <div key={cat.id} className="relative">
                <button
                  onClick={() => handleToggleCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isOpen
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isOpen ? 'text-white' : 'text-emerald-600'}`} />
                  <span>{t(cat.labelKey, cat.defaultLabel)}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : 'text-slate-400'}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cascading Multi-Step Mega Drawer Panel */}
      <AnimatePresence>
        {activeCategory && currentCatConfig && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.99 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 bg-white border-b border-slate-200/90 shadow-2xl z-50 p-6"
          >
            <div className="max-w-[1440px] mx-auto space-y-4">
              {/* Header Action & Selection Breadcrumbs Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center gap-1.5 text-xs">
                    {React.createElement(currentCatConfig.icon, { className: "w-4 h-4" })}
                    <span>{t(currentCatConfig.labelKey, currentCatConfig.defaultLabel)}</span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300" />

                  {selectedType ? (
                    <span className="px-3 py-1 rounded-xl bg-emerald-100/80 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      {selectedType.name}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 italic">Adım 1: Tür Seçin</span>
                  )}

                  {selectedBrand && (
                    <>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                      <span className="px-3 py-1 rounded-xl bg-teal-100/80 text-teal-800 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 text-teal-600" />
                        {selectedBrand.name}
                      </span>
                    </>
                  )}

                  {selectedModel && (
                    <>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                      <span className="px-3 py-1 rounded-xl bg-blue-100/80 text-blue-800 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 text-blue-600" />
                        {selectedModel.name}
                      </span>
                    </>
                  )}

                  {(selectedType || selectedBrand || selectedModel) && (
                    <button
                      onClick={resetSelections}
                      className="text-xs font-bold text-slate-400 hover:text-red-500 ml-2 flex items-center gap-1 transition-colors"
                      title="Seçimleri Sıfırla"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Temizle</span>
                    </button>
                  )}
                </div>

                {/* Primary Action Execute Search Button */}
                <button
                  onClick={() => executeSearch()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                  <span>
                    {selectedModel
                      ? `"${selectedModel.name}" İlanlarını Göster`
                      : selectedBrand
                      ? `"${selectedBrand.name}" İlanlarını Göster`
                      : selectedType
                      ? `"${selectedType.name}" İlanlarını Göster`
                      : `Tüm ${t(currentCatConfig.labelKey, currentCatConfig.defaultLabel)} İlanlarını Göster`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* 3-Column Cascading Interactive Selector Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* STEP 1 COLUMN: Types */}
                <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-3xl border border-slate-100">
                  <h5 className="text-xs font-extrabold text-slate-600 tracking-wider flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <Layers className="w-3.5 h-3.5" />
                      {currentCatConfig.step1Title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-600">
                      {step1Items.length}
                    </span>
                  </h5>

                  <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-emerald-400">
                    {step1Items.map((item) => {
                      const isSelected = selectedType?.id === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedType(null);
                              setSelectedBrand(null);
                              setSelectedModel(null);
                            } else {
                              setSelectedType(item);
                              setSelectedBrand(null);
                              setSelectedModel(null);
                            }
                          }}
                          className={`w-full text-left px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-100 hover:border-emerald-200'
                          }`}
                        >
                          <span className="truncate">{item.name}</span>
                          <span className={`text-[10px] font-bold transition-all ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-emerald-600'}`}>
                            {isSelected ? '✓' : '→'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* STEP 2 COLUMN: Brands / Secondary */}
                <div className={`space-y-2.5 bg-slate-50/70 p-4 rounded-3xl border border-slate-100 transition-opacity ${!selectedType ? 'opacity-85' : 'opacity-100'}`}>
                  <h5 className="text-xs font-extrabold text-slate-600 tracking-wider flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <span className="flex items-center gap-1.5 text-teal-700">
                      <Layers className="w-3.5 h-3.5" />
                      {currentCatConfig.step2Title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-600">
                      {step2Items.length}
                    </span>
                  </h5>

                  <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-teal-400">
                    {step2Items.map((item) => {
                      const isSelected = selectedBrand?.id === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedBrand(null);
                              setSelectedModel(null);
                            } else {
                              setSelectedBrand(item);
                              setSelectedModel(null);
                            }
                          }}
                          className={`w-full text-left px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group ${
                            isSelected
                              ? 'bg-teal-600 text-white shadow-sm'
                              : 'bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-100 hover:border-teal-200'
                          }`}
                        >
                          <span className="truncate">{item.name}</span>
                          <span className={`text-[10px] font-bold transition-all ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-teal-600'}`}>
                            {isSelected ? '✓' : '→'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* STEP 3 COLUMN: Models / Tertiary */}
                <div className={`space-y-2.5 bg-slate-50/70 p-4 rounded-3xl border border-slate-100 transition-opacity ${step3Items.length === 0 ? 'opacity-70' : 'opacity-100'}`}>
                  <h5 className="text-xs font-extrabold text-slate-600 tracking-wider flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <span className="flex items-center gap-1.5 text-blue-700">
                      <Layers className="w-3.5 h-3.5" />
                      {currentCatConfig.step3Title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-600">
                      {step3Items.length}
                    </span>
                  </h5>

                  <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-blue-400">
                    {step3Items.length > 0 ? (
                      step3Items.map((item) => {
                        const isSelected = selectedModel?.id === item.id;

                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedModel(null);
                              } else {
                                setSelectedModel(item);
                                executeSearch(selectedType, selectedBrand, item);
                              }
                            }}
                            className={`w-full text-left px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-100 hover:border-blue-200'
                            }`}
                          >
                            <span className="truncate">{item.name}</span>
                            <span className={`text-[10px] font-bold transition-all ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-blue-600'}`}>
                              {isSelected ? '✓' : '→'}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400 italic bg-white/60 rounded-2xl border border-dashed border-slate-200">
                        {selectedBrand
                          ? `"${selectedBrand.name}" için özel model seçimi yapabilirsiniz.`
                          : 'Marka seçerek spesifik modellere ulaşabilirsiniz.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategorySubHeader;
