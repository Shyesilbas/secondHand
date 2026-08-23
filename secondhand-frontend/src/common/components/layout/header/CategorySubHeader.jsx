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
 step1Key: 'step_vehicle_type',
 step2Key: 'step_vehicle_brand',
 step3Key: 'step_vehicle_model',
 icon: Car,
 typeEnumKey: 'vehicleTypes',
 brandEnumKey: 'carBrands',
 modelEnumKey: 'vehicleModels',
 typeParamKey: 'vehicleTypeIds',
 brandParamKey: 'brandIds',
 modelParamKey: 'vehicleModelIds',
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
 step1Key: 'step_electronics_type',
 step2Key: 'step_electronics_brand',
 step3Key: 'step_electronics_model',
 icon: Smartphone,
 typeEnumKey: 'electronicTypes',
 brandEnumKey: 'electronicBrands',
 modelEnumKey: 'electronicModels',
 typeParamKey: 'electronicTypeIds',
 brandParamKey: 'electronicBrandIds',
 modelParamKey: 'electronicModelIds',
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
 step1Key: 'step_realestate_category',
 step2Key: 'step_realestate_type',
 step3Key: 'step_realestate_listing_type',
 step4Key: 'step_realestate_owner',
 icon: Home,
 hasFourSteps: true,
 typeEnumKey: 'realEstateTypes',
 brandEnumKey: 'realEstateAdTypes',
 modelEnumKey: 'ownerTypes',
 typeParamKey: 'realEstateTypeIds',
 brandParamKey: 'adTypeId',
 modelParamKey: 'ownerTypeId',
 fallbacks: {
 categories: [
 { id: 'RESIDENTIAL', name: 'Konut' },
 { id: 'COMMERCIAL', name: 'İş Yeri' },
 { id: 'LAND', name: 'Arsa & Arazi' },
 { id: 'BUILDING', name: 'Bina & Tesis' }
 ],
 types: [
 { id: '10000001-0000-0000-0000-000000000001', name: 'Daire', cat: 'RESIDENTIAL' },
 { id: '10000001-0000-0000-0000-000000000002', name: 'Rezidans', cat: 'RESIDENTIAL' },
 { id: '10000001-0000-0000-0000-000000000003', name: 'Stüdyo (1+0)', cat: 'RESIDENTIAL' },
 { id: '10000001-0000-0000-0000-000000000004', name: 'Dubleks Daire', cat: 'RESIDENTIAL' },
 { id: '10000001-0000-0000-0000-000000000005', name: 'Villa / Müstakil Ev', cat: 'RESIDENTIAL' },
 { id: '10000001-0000-0000-0000-000000000006', name: 'Prefabrik / Yazlık Ev', cat: 'RESIDENTIAL' },
 { id: '10000001-0000-0000-0000-000000000007', name: 'Konut İmarlı Arsa', cat: 'LAND' },
 { id: '10000001-0000-0000-0000-000000000008', name: 'Ticari / Sanayi İmarlı Arsa', cat: 'LAND' },
 { id: '10000001-0000-0000-0000-000000000009', name: 'Tarla / Çiftlik & Bağ-Bahçe', cat: 'LAND' },
 { id: '10000001-0000-0000-0000-000000000010', name: 'Ofis / Büro / Plaza Katı', cat: 'COMMERCIAL' },
 { id: '10000001-0000-0000-0000-000000000011', name: 'Dükkan / Mağaza', cat: 'COMMERCIAL' },
 { id: '10000001-0000-0000-0000-000000000012', name: 'Depo / Fabrika / Atölye', cat: 'COMMERCIAL' },
 { id: '10000001-0000-0000-0000-000000000013', name: 'Komple Bina / Turistik Tesis', cat: 'BUILDING' },
 { id: '10000001-0000-0000-0000-000000000014', name: 'Diğer Gayrimenkuller', cat: 'BUILDING' }
 ],
 brands: [
 { id: '20000002-0000-0000-0000-000000000001', name: 'Satılık' },
 { id: '20000002-0000-0000-0000-000000000002', name: 'Kiralık' },
 { id: '20000002-0000-0000-0000-000000000003', name: 'Günlük Kiralık' },
 { id: '20000002-0000-0000-0000-000000000004', name: 'Devren / Ev Arkadaşı' }
 ],
 owners: [
 { id: '40000004-0000-0000-0000-000000000001', name: 'Sahibinden' },
 { id: '40000004-0000-0000-0000-000000000002', name: 'Emlak Ofisinden' },
 { id: '40000004-0000-0000-0000-000000000003', name: 'İnşaat Firmasından' },
 { id: '40000004-0000-0000-0000-000000000004', name: 'Bankadan Satılık' }
 ]
 }
 },
 {
 id: 'CLOTHING',
 labelKey: 'fashion',
 step1Key: 'step_fashion_type',
 step2Key: 'step_fashion_brand',
 step3Key: 'step_fashion_gender',
 icon: Shirt,
 typeEnumKey: 'clothingTypes',
 brandEnumKey: 'clothingBrands',
 modelEnumKey: 'clothingGenders',
 typeParamKey: 'types',
 brandParamKey: 'brands',
 modelParamKey: 'clothingGenders',
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
 labelKey: 'book',
 step1Key: 'step_book_type',
 step2Key: 'step_book_format',
 step3Key: 'step_book_condition',
 icon: BookOpen,
 typeEnumKey: 'bookTypes',
 brandEnumKey: 'bookFormats',
 modelEnumKey: 'bookConditions',
 typeParamKey: 'bookTypeIds',
 brandParamKey: 'formatIds',
 modelParamKey: 'conditionIds',
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

const dedupeItems = (items) => {
 if (!Array.isArray(items)) return [];
 const seen = new Set();
 return items.filter(item => {
 const key = String(item.name || item.id || '').toUpperCase().trim();
 if (!key || seen.has(key)) return false;
 seen.add(key);
 return true;
 });
};

const CategorySubHeader = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const { enums } = useEnums();
 const [activeCategory, setActiveCategory] = useState(null);

 // Cascading step selections per active category
 const [selectedPropertyCat, setSelectedPropertyCat] = useState(null); // Specific for Real Estate Step 1
 const [selectedType, setSelectedType] = useState(null);
 const [selectedBrand, setSelectedBrand] = useState(null);
 const [selectedModel, setSelectedModel] = useState(null);

 const containerRef = useRef(null);

 useClickOutside(containerRef, () => {
 setActiveCategory(null);
 resetSelections();
 }, !!activeCategory);

 const resetSelections = () => {
 setSelectedPropertyCat(null);
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

 // Resolve Step 1 (Types or Property Categories for Real Estate)
 const step1Items = useMemo(() => {
 if (!currentCatConfig) return [];
 if (currentCatConfig.id === 'REAL_ESTATE') {
 return dedupeItems(currentCatConfig.fallbacks.categories);
 }

 const key = currentCatConfig.typeEnumKey;
 const backendData = enums?.[key];
 if (Array.isArray(backendData) && backendData.length > 0) {
 return dedupeItems(backendData.map(item => ({
 id: item.id || item.value || String(item),
 name: item.label || item.name || item.value || String(item)
 })));
 }
 return dedupeItems(currentCatConfig.fallbacks.types || []);
 }, [currentCatConfig, enums]);

 // Resolve Step 2 (Property Types for Real Estate or Brands for others)
 const step2Items = useMemo(() => {
 if (!currentCatConfig) return [];

 if (currentCatConfig.id === 'REAL_ESTATE') {
 const key = currentCatConfig.typeEnumKey;
 const backendData = enums?.[key];
 let items = [];
 if (Array.isArray(backendData) && backendData.length > 0) {
 items = backendData.map(item => ({
 id: item.id || item.value || String(item),
 name: item.label || item.name || item.value || String(item)
 }));
 } else {
 items = currentCatConfig.fallbacks.types || [];
 }

 // Filter by selected property category if selected
 if (selectedPropertyCat) {
 const catId = selectedPropertyCat.id;
 items = items.filter(it => {
 if (it.cat) return it.cat === catId;
 const name = String(it.name || '').toUpperCase();
 if (catId === 'RESIDENTIAL') return ['DAİRE', 'REZİDANS', 'VİLLA', 'STÜDYO', 'DUBLEKS', 'PREFABRİK'].some(x => name.includes(x));
 if (catId === 'COMMERCIAL') return ['OFİS', 'DÜKKAN', 'DEPO', 'BÜRO', 'MAĞAZA', 'FABRİKA'].some(x => name.includes(x));
 if (catId === 'LAND') return ['ARSA', 'TARLA', 'ÇİFTLİK', 'BAĞ'].some(x => name.includes(x));
 if (catId === 'BUILDING') return ['BİNA', 'TESİS', 'OTEL'].some(x => name.includes(x));
 return true;
 });
 }
 return dedupeItems(items);
 }

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
 return dedupeItems(items);
 }, [currentCatConfig, enums, selectedType, selectedPropertyCat]);

 // Resolve Step 3 (Ad Types for Real Estate or Models for others)
 const step3Items = useMemo(() => {
 if (!currentCatConfig) return [];

 if (currentCatConfig.id === 'REAL_ESTATE') {
 const key = currentCatConfig.brandEnumKey; // realEstateAdTypes
 const backendData = enums?.[key];
 if (Array.isArray(backendData) && backendData.length > 0) {
 return dedupeItems(backendData.map(item => ({
 id: item.id || item.value || String(item),
 name: item.label || item.name || item.value || String(item)
 })));
 }
 return dedupeItems(currentCatConfig.fallbacks.brands || []);
 }

 const modelKey = currentCatConfig.modelEnumKey;
 const allModels = enums?.[modelKey];

 if (Array.isArray(allModels) && allModels.length > 0) {
 const filtered = allModels
 .filter(m => {
 const typeMatch = !selectedType || String(m?.typeId ?? m?.type_id ?? '') === String(selectedType.id);
 const brandMatch = !selectedBrand || String(m?.brandId ?? m?.brand_id ?? '') === String(selectedBrand.id);
 return typeMatch && brandMatch;
 })
 .map(m => ({
 id: m.id || m.value || String(m),
 name: m.label || m.name || m.value || String(m)
 }));
 return dedupeItems(filtered);
 }

 return [];
 }, [currentCatConfig, enums, selectedType, selectedBrand]);

 // Resolve Step 4 (Owner Types for Real Estate)
 const step4Items = useMemo(() => {
 if (!currentCatConfig || currentCatConfig.id !== 'REAL_ESTATE') return [];
 const key = currentCatConfig.modelEnumKey; // ownerTypes
 const backendData = enums?.[key];
 if (Array.isArray(backendData) && backendData.length > 0) {
 return dedupeItems(backendData.map(item => ({
 id: item.id || item.value || String(item),
 name: item.label || item.name || item.value || String(item)
 })));
 }
 return dedupeItems(currentCatConfig.fallbacks.owners || []);
 }, [currentCatConfig, enums]);

 // Perform navigation with accumulated search parameters
 const executeSearch = (
 overrideType = selectedType,
 overrideBrand = selectedBrand,
 overrideModel = selectedModel
 ) => {
 if (!currentCatConfig) return;
 setActiveCategory(null);

 const queryParams = new URLSearchParams();
 queryParams.set('category', currentCatConfig.id);

 if (currentCatConfig.id === 'REAL_ESTATE') {
 if (overrideType && currentCatConfig.typeParamKey) {
 queryParams.set(currentCatConfig.typeParamKey, overrideType.id);
 }
 if (overrideBrand && currentCatConfig.brandParamKey) {
 queryParams.set(currentCatConfig.brandParamKey, overrideBrand.id);
 }
 if (overrideModel && currentCatConfig.modelParamKey) {
 queryParams.set(currentCatConfig.modelParamKey, overrideModel.id);
 }
 } else {
 if (overrideType && currentCatConfig.typeParamKey) {
 queryParams.set(currentCatConfig.typeParamKey, overrideType.id);
 }
 if (overrideBrand && currentCatConfig.brandParamKey) {
 queryParams.set(currentCatConfig.brandParamKey, overrideBrand.id);
 }
 if (overrideModel && currentCatConfig.modelParamKey) {
 queryParams.set(currentCatConfig.modelParamKey, overrideModel.id);
 }
 }

 navigate(`${ROUTES.LISTINGS}?${queryParams.toString()}`);
 resetSelections();
 };

 return (
 <div
 ref={containerRef}
 className="relative z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-700 shadow-xs"
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
 ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
 : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-transparent'
 }`}
 >
 <Icon className={`w-4 h-4 ${isOpen ? 'text-white' : 'text-slate-900'}`} />
 <span>{t(cat.labelKey)}</span>
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
 className="absolute top-full left-0 right-0 bg-white border-b border-slate-200/90 shadow-2xl z-40 p-6"
 >
 <div className="max-w-[1440px] mx-auto space-y-4">
 {/* Header Action & Selection Breadcrumbs Bar */}
 <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
 <div className="flex items-center gap-2 flex-wrap">
 <div className="p-2 rounded-xl bg-slate-100 text-slate-900 font-bold flex items-center gap-1.5 text-xs">
 {React.createElement(currentCatConfig.icon, { className: "w-4 h-4" })}
 <span>{t(currentCatConfig.labelKey)}</span>
 </div>

 <ChevronRight className="w-4 h-4 text-slate-300" />

 {/* REAL ESTATE STEP 1 (Property Category) */}
 {currentCatConfig.id === 'REAL_ESTATE' ? (
 selectedPropertyCat ? (
 <span className="px-3 py-1 rounded-xl bg-purple-100/80 text-purple-800 text-xs font-bold flex items-center gap-1">
 <Check className="w-3 h-3 text-purple-600" />
 {selectedPropertyCat.name}
 </span>
 ) : (
 <span className="text-xs font-semibold text-slate-400 italic">{t(currentCatConfig.step1Key)}</span>
 )
 ) : (
 selectedType ? (
 <span className="px-3 py-1 rounded-xl bg-slate-200/80 text-slate-900 text-xs font-bold flex items-center gap-1">
 <Check className="w-3 h-3 text-slate-900" />
 {selectedType.name}
 </span>
 ) : (
 <span className="text-xs font-semibold text-slate-400 italic">{t(currentCatConfig.step1Key)}</span>
 )
 )}

 {/* STEP 2 BREADCRUMB */}
 {currentCatConfig.id === 'REAL_ESTATE' ? (
 selectedType ? (
 <>
 <ChevronRight className="w-4 h-4 text-slate-300" />
 <span className="px-3 py-1 rounded-xl bg-slate-200/80 text-slate-900 text-xs font-bold flex items-center gap-1">
 <Check className="w-3 h-3 text-slate-900" />
 {selectedType.name}
 </span>
 </>
 ) : null
 ) : (
 selectedBrand ? (
 <>
 <ChevronRight className="w-4 h-4 text-slate-300" />
 <span className="px-3 py-1 rounded-xl bg-slate-200/80 text-slate-900 text-xs font-bold flex items-center gap-1">
 <Check className="w-3 h-3 text-slate-900" />
 {selectedBrand.name}
 </span>
 </>
 ) : null
 )}

 {/* STEP 3 BREADCRUMB */}
 {currentCatConfig.id === 'REAL_ESTATE' ? (
 selectedBrand ? (
 <>
 <ChevronRight className="w-4 h-4 text-slate-300" />
 <span className="px-3 py-1 rounded-xl bg-slate-200/80 text-slate-900 text-xs font-bold flex items-center gap-1">
 <Check className="w-3 h-3 text-slate-900" />
 {selectedBrand.name}
 </span>
 </>
 ) : null
 ) : (
 selectedModel ? (
 <>
 <ChevronRight className="w-4 h-4 text-slate-300" />
 <span className="px-3 py-1 rounded-xl bg-slate-200/80 text-slate-900 text-xs font-bold flex items-center gap-1">
 <Check className="w-3 h-3 text-slate-900" />
 {selectedModel.name}
 </span>
 </>
 ) : null
 )}

 {/* STEP 4 BREADCRUMB (REAL ESTATE ONLY) */}
 {currentCatConfig.id === 'REAL_ESTATE' && selectedModel && (
 <>
 <ChevronRight className="w-4 h-4 text-slate-300" />
 <span className="px-3 py-1 rounded-xl bg-blue-100/80 text-blue-800 text-xs font-bold flex items-center gap-1">
 <Check className="w-3 h-3 text-blue-600" />
 {selectedModel.name}
 </span>
 </>
 )}

 {(selectedPropertyCat || selectedType || selectedBrand || selectedModel) && (
 <button
 onClick={resetSelections}
 className="text-xs font-bold text-slate-400 hover:text-red-500 ml-2 flex items-center gap-1 transition-colors"
 title={t('reset_selections')}
 >
 <RotateCcw className="w-3 h-3" />
 <span>{t('clear_selections')}</span>
 </button>
 )}
 </div>

 {/* Primary Action Execute Search Button */}
 <button
 onClick={() => executeSearch()}
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-900 text-white font-extrabold text-xs shadow-md shadow-slate-900/10 hover:shadow-lg transition-all cursor-pointer"
 >
 <Sparkles className="w-4 h-4 text-indigo-200 animate-pulse" />
 <span>
 {selectedModel
 ? t('view_listings_for', { name: selectedModel.name })
 : selectedBrand
 ? t('view_listings_for', { name: selectedBrand.name })
 : selectedType
 ? t('view_listings_for', { name: selectedType.name })
 : selectedPropertyCat
 ? t('view_listings_for', { name: selectedPropertyCat.name })
 : t('view_all_listings', { category: t(currentCatConfig.labelKey) })}
 </span>
 <ArrowRight className="w-4 h-4" />
 </button>
 </div>

 {/* Multi-Step Interactive Selector Grid (4 Columns for REAL ESTATE, 3 Columns for others) */}
 <div className={`grid gap-5 ${currentCatConfig.hasFourSteps ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
 {/* STEP 1 COLUMN */}
 <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-3xl border border-slate-100">
 <h5 className="text-xs font-extrabold text-slate-600 tracking-wider flex items-center justify-between pb-2 border-b border-slate-200/80">
 <span className="flex items-center gap-1.5 text-purple-700">
 <Layers className="w-3.5 h-3.5" />
 {t(currentCatConfig.step1Key)}
 </span>
 <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-600">
 {step1Items.length}
 </span>
 </h5>

 <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-purple-400">
 {step1Items.map((item) => {
 const isSelected = currentCatConfig.id === 'REAL_ESTATE'
 ? selectedPropertyCat?.id === item.id
 : selectedType?.id === item.id;

 return (
 <button
 key={item.id}
 onClick={() => {
 if (currentCatConfig.id === 'REAL_ESTATE') {
 if (isSelected) {
 setSelectedPropertyCat(null);
 setSelectedType(null);
 } else {
 setSelectedPropertyCat(item);
 setSelectedType(null);
 }
 } else {
 if (isSelected) {
 setSelectedType(null);
 setSelectedBrand(null);
 setSelectedModel(null);
 } else {
 setSelectedType(item);
 setSelectedBrand(null);
 setSelectedModel(null);
 }
 }
 }}
 className={`w-full text-left px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
 isSelected
 ? 'bg-purple-600 text-white shadow-sm'
 : 'bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-900 border border-slate-100 hover:border-purple-200'
 }`}
 >
 <span className="truncate">{item.name}</span>
 <span className={`text-[10px] font-bold transition-all ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-purple-600'}`}>
 {isSelected ? '✓' : '→'}
 </span>
 </button>
 );
 })}
 </div>
 </div>

 {/* STEP 2 COLUMN */}
 <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-3xl border border-slate-100">
 <h5 className="text-xs font-extrabold text-slate-600 tracking-wider flex items-center justify-between pb-2 border-b border-slate-200/80">
 <span className="flex items-center gap-1.5 text-slate-900">
 <Layers className="w-3.5 h-3.5" />
 {t(currentCatConfig.step2Key)}
 </span>
 <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-600">
 {step2Items.length}
 </span>
 </h5>

 <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-indigo-400">
 {step2Items.map((item) => {
 const isSelected = currentCatConfig.id === 'REAL_ESTATE'
 ? selectedType?.id === item.id
 : selectedBrand?.id === item.id;

 return (
 <button
 key={item.id}
 onClick={() => {
 if (currentCatConfig.id === 'REAL_ESTATE') {
 if (isSelected) {
 setSelectedType(null);
 setSelectedBrand(null);
 setSelectedModel(null);
 } else {
 setSelectedType(item);
 setSelectedBrand(null);
 setSelectedModel(null);
 }
 } else {
 if (isSelected) {
 setSelectedBrand(null);
 setSelectedModel(null);
 } else {
 setSelectedBrand(item);
 setSelectedModel(null);
 }
 }
 }}
 className={`w-full text-left px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
 isSelected
 ? 'bg-slate-900 text-white shadow-sm'
 : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-100 hover:border-slate-300'
 }`}
 >
 <span className="truncate">{item.name}</span>
 <span className={`text-[10px] font-bold transition-all ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-slate-900'}`}>
 {isSelected ? '✓' : '→'}
 </span>
 </button>
 );
 })}
 </div>
 </div>

 {/* STEP 3 COLUMN */}
 <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-3xl border border-slate-100">
 <h5 className="text-xs font-extrabold text-slate-600 tracking-wider flex items-center justify-between pb-2 border-b border-slate-200/80">
 <span className="flex items-center gap-1.5 text-slate-900">
 <Layers className="w-3.5 h-3.5" />
 {t(currentCatConfig.step3Key)}
 </span>
 <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-600">
 {step3Items.length}
 </span>
 </h5>

 <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-indigo-400">
 {step3Items.map((item) => {
 const isSelected = currentCatConfig.id === 'REAL_ESTATE'
 ? selectedBrand?.id === item.id
 : selectedModel?.id === item.id;

 return (
 <button
 key={item.id}
 onClick={() => {
 if (currentCatConfig.id === 'REAL_ESTATE') {
 if (isSelected) {
 setSelectedBrand(null);
 setSelectedModel(null);
 } else {
 setSelectedBrand(item);
 setSelectedModel(null);
 }
 } else {
 if (isSelected) {
 setSelectedModel(null);
 } else {
 setSelectedModel(item);
 executeSearch(selectedPropertyCat, selectedType, selectedBrand, item);
 }
 }
 }}
 className={`w-full text-left px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
 isSelected
 ? 'bg-slate-900 text-white shadow-sm'
 : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-100 hover:border-slate-300'
 }`}
 >
 <span className="truncate">{item.name}</span>
 <span className={`text-[10px] font-bold transition-all ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-slate-900'}`}>
 {isSelected ? '✓' : '→'}
 </span>
 </button>
 );
 })}
 </div>
 </div>

 {/* STEP 4 COLUMN (ONLY FOR 4-STEP CATEGORIES LIKE REAL ESTATE) */}
 {currentCatConfig.hasFourSteps && (
 <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-3xl border border-slate-100">
 <h5 className="text-xs font-extrabold text-slate-600 tracking-wider flex items-center justify-between pb-2 border-b border-slate-200/80">
 <span className="flex items-center gap-1.5 text-blue-700">
 <Layers className="w-3.5 h-3.5" />
 {t(currentCatConfig.step4Key)}
 </span>
 <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-600">
 {step4Items.length}
 </span>
 </h5>

 <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-blue-400">
 {step4Items.map((item) => {
 const isSelected = selectedModel?.id === item.id;

 return (
 <button
 key={item.id}
 onClick={() => {
 if (isSelected) {
 setSelectedModel(null);
 } else {
 setSelectedModel(item);
 executeSearch(selectedPropertyCat, selectedType, selectedBrand, item);
 }
 }}
 className={`w-full text-left px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
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
 })}
 </div>
 </div>
 )}
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
};

export default CategorySubHeader;
