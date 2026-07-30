import React, { useState, useRef, useMemo } from 'react';
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from 'react-router-dom';
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
  Dumbbell,
  BookOpen,
  Package,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';

const CATEGORY_MEGA_CONFIG = [
  {
    id: 'VEHICLE',
    labelKey: 'vehicles',
    defaultLabel: 'Vasıta',
    icon: Car,
    sections: [
      {
        title: 'Araç Türleri',
        enumKey: 'vehicleTypes',
        filterParam: 'vehicleTypeIds',
        fallback: [
          { label: 'Otomobil', value: 'CAR' },
          { label: 'SUV & Arazi', value: 'SUV' },
          { label: 'Motosiklet', value: 'MOTORCYCLE' },
          { label: 'Ticari Araçlar', value: 'COMMERCIAL' },
        ]
      },
      {
        title: 'Popüler Markalar',
        enumKey: 'carBrands',
        filterParam: 'brandIds',
        fallback: [
          { label: 'BMW', value: 'BMW' },
          { label: 'Mercedes-Benz', value: 'MERCEDES' },
          { label: 'Audi', value: 'AUDI' },
          { label: 'Volkswagen', value: 'VOLKSWAGEN' },
          { label: 'Toyota', value: 'TOYOTA' },
          { label: 'Renault', value: 'RENAULT' },
          { label: 'Ford', value: 'FORD' },
          { label: 'Honda', value: 'HONDA' },
        ]
      },
      {
        title: 'Yaka & Gövde Tipi',
        enumKey: 'fuelTypes',
        filterParam: 'fuelType',
        fallback: [
          { label: 'Benzin', value: 'GASOLINE' },
          { label: 'Dizel', value: 'DIESEL' },
          { label: 'Elektrik', value: 'ELECTRIC' },
          { label: 'Hibrit', value: 'HYBRID' },
        ]
      }
    ]
  },
  {
    id: 'ELECTRONICS',
    labelKey: 'electronics',
    defaultLabel: 'Elektronik',
    icon: Smartphone,
    sections: [
      {
        title: 'Cihaz Türleri',
        enumKey: 'electronicTypes',
        filterParam: 'electronicTypeIds',
        fallback: [
          { label: 'Telefon & Aksesuar', value: 'PHONE' },
          { label: 'Bilgisayar & Tablet', value: 'COMPUTER' },
          { label: 'TV & Ev Elektroniği', value: 'TV' },
          { label: 'Fotoğraf & Kamera', value: 'CAMERA' },
          { label: 'Oyun Konsolu', value: 'CONSOLE' },
        ]
      },
      {
        title: 'Markalar',
        enumKey: 'electronicBrands',
        filterParam: 'electronicBrandIds',
        fallback: [
          { label: 'Apple', value: 'APPLE' },
          { label: 'Samsung', value: 'SAMSUNG' },
          { label: 'Sony', value: 'SONY' },
          { label: 'Xiaomi', value: 'XIAOMI' },
          { label: 'Asus', value: 'ASUS' },
          { label: 'Dell', value: 'DELL' },
          { label: 'Lenovo', value: 'LENOVO' },
        ]
      },
      {
        title: 'Kullanım Durumu',
        enumKey: 'electronicConditions',
        filterParam: 'condition',
        fallback: [
          { label: 'Sıfır / Kapalı Kutu', value: 'NEW' },
          { label: 'Yenilenmiş (Refurbished)', value: 'REFURBISHED' },
          { label: 'İkinci El (Az Kullanılmış)', value: 'USED_LIKE_NEW' },
          { label: 'İkinci El (İyi)', value: 'USED_GOOD' },
        ]
      }
    ]
  },
  {
    id: 'REAL_ESTATE',
    labelKey: 'real_estate',
    defaultLabel: 'Emlak',
    icon: Home,
    sections: [
      {
        title: 'Emlak Tipi',
        enumKey: 'realEstateTypes',
        filterParam: 'realEstateTypeIds',
        fallback: [
          { label: 'Konut', value: 'RESIDENTIAL' },
          { label: 'İş Yeri', value: 'COMMERCIAL' },
          { label: 'Arsa & Arazi', value: 'LAND' },
          { label: 'Bina & Proje', value: 'BUILDING' },
        ]
      },
      {
        title: 'İlan Türü',
        enumKey: 'realEstateAdTypes',
        filterParam: 'adTypeId',
        fallback: [
          { label: 'Satılık', value: 'FOR_SALE' },
          { label: 'Kiralık', value: 'FOR_RENT' },
          { label: 'Günlük Kiralık', value: 'DAILY_RENT' },
        ]
      },
      {
        title: 'Isınma Tipi',
        enumKey: 'heatingTypes',
        filterParam: 'heatingType',
        fallback: [
          { label: 'Kombi (Doğalgaz)', value: 'GAS_COMBI' },
          { label: 'Merkezi Sistem', value: 'CENTRAL' },
          { label: 'Yerden Isıtma', value: 'UNDERFLOOR' },
          { label: 'Klima', value: 'AIR_CONDITIONER' },
        ]
      }
    ]
  },
  {
    id: 'CLOTHING',
    labelKey: 'fashion',
    defaultLabel: 'Moda & Giyim',
    icon: Shirt,
    sections: [
      {
        title: 'Kategoriler',
        enumKey: 'clothingCategories',
        filterParam: 'clothingCategoryIds',
        fallback: [
          { label: 'Giyim', value: 'CLOTHES' },
          { label: 'Ayakkabı', value: 'SHOES' },
          { label: 'Çanta', value: 'BAGS' },
          { label: 'Saat & Aksesuar', value: 'ACCESSORIES' },
        ]
      },
      {
        title: 'Popüler Markalar',
        enumKey: 'clothingBrands',
        filterParam: 'clothingBrandIds',
        fallback: [
          { label: 'Nike', value: 'NIKE' },
          { label: 'Adidas', value: 'ADIDAS' },
          { label: 'Zara', value: 'ZARA' },
          { label: 'Mango', value: 'MANGO' },
          { label: 'Puma', value: 'PUMA' },
          { label: 'H&M', value: 'HM' },
        ]
      },
      {
        title: 'Cinsiyet & Hitap',
        enumKey: 'clothingGenders',
        filterParam: 'gender',
        fallback: [
          { label: 'Kadın', value: 'WOMEN' },
          { label: 'Erkek', value: 'MEN' },
          { label: 'Çocuk', value: 'KIDS' },
          { label: 'Uniseks', value: 'UNISEX' },
        ]
      }
    ]
  },
  {
    id: 'SPORTS',
    labelKey: 'sports',
    defaultLabel: 'Spor & Hobi',
    icon: Dumbbell,
    sections: [
      {
        title: 'Spor Ekipmanları',
        enumKey: 'sportEquipmentTypes',
        filterParam: 'sportEquipmentTypeIds',
        fallback: [
          { label: 'Fitness & Vücut Geliştirme', value: 'FITNESS' },
          { label: 'Bisiklet & Aksesuar', value: 'BICYCLE' },
          { label: 'Kamp & Outdoor', value: 'CAMPING' },
          { label: 'Takım Sporları', value: 'TEAM_SPORTS' },
        ]
      },
      {
        title: 'Spor Dalları',
        enumKey: 'sportDisciplines',
        filterParam: 'discipline',
        fallback: [
          { label: 'Futbol & Basketbol', value: 'BALL_SPORTS' },
          { label: 'Yüzme & Su Sporları', value: 'WATER_SPORTS' },
          { label: 'Kış Sporları', value: 'WINTER_SPORTS' },
          { label: 'Tenis & Raket', value: 'RACKET_SPORTS' },
        ]
      }
    ]
  },
  {
    id: 'BOOKS',
    labelKey: 'books',
    defaultLabel: 'Kitap & Kültür',
    icon: BookOpen,
    sections: [
      {
        title: 'Kitap Türleri',
        enumKey: 'bookTypes',
        filterParam: 'bookTypeIds',
        fallback: [
          { label: 'Roman & Edebiyat', value: 'NOVEL' },
          { label: 'Ders & Sınav Kitapları', value: 'TEXTBOOK' },
          { label: 'Çizgi Roman & Manga', value: 'COMICS' },
          { label: 'Kişisel Gelişim', value: 'SELF_HELP' },
        ]
      },
      {
        title: 'Kategoriler & Türler',
        enumKey: 'bookGenres',
        filterParam: 'genre',
        fallback: [
          { label: 'Tarih & Bilim', value: 'HISTORY' },
          { label: 'Çocuk & Gençlik', value: 'KIDS' },
          { label: 'Felsefe & Psikoloji', value: 'PHILOSOPHY' },
          { label: 'Sanat & Hobi', value: 'ART' },
        ]
      }
    ]
  },
  {
    id: 'OTHER',
    labelKey: 'other',
    defaultLabel: 'Diğer Tüm İlanlar',
    icon: Package,
    sections: [
      {
        title: 'Öne Çıkan Kategoriler',
        enumKey: null,
        filterParam: null,
        fallback: [
          { label: 'Ev & Bahçe', value: 'GARDEN' },
          { label: 'Anne & Bebek', value: 'BABY' },
          { label: 'Ofis & Kırtasiye', value: 'OFFICE' },
          { label: 'Koleksiyon & Antika', value: 'COLLECTION' },
        ]
      }
    ]
  }
];

const CategorySubHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enums } = useEnums();
  const [activeCategory, setActiveCategory] = useState(null);
  const containerRef = useRef(null);

  useClickOutside(containerRef, () => setActiveCategory(null), !!activeCategory);

  // Compute dynamic mega menu sections from backend enums
  const categoriesWithFullEnums = useMemo(() => {
    return CATEGORY_MEGA_CONFIG.map((cat) => {
      const processedSections = cat.sections.map((sec) => {
        let items = [];
        if (sec.enumKey && enums?.[sec.enumKey] && Array.isArray(enums[sec.enumKey]) && enums[sec.enumKey].length > 0) {
          items = enums[sec.enumKey].map((item) => ({
            label: item.label || item.name || item.value || String(item),
            value: item.value || item.id || String(item),
          }));
        } else {
          items = sec.fallback;
        }

        return {
          ...sec,
          items: items.slice(0, 8), // Limit to top 8 items per column section
        };
      });

      return {
        ...cat,
        sections: processedSections,
      };
    });
  }, [enums]);

  const handleMainCategoryClick = (categoryId) => {
    setActiveCategory(null);
    navigate(`${ROUTES.LISTINGS}?category=${categoryId}`);
  };

  const handleSubItemClick = (catId, filterParam, value, label) => {
    setActiveCategory(null);
    if (filterParam && value) {
      navigate(`${ROUTES.LISTINGS}?category=${catId}&${filterParam}=${encodeURIComponent(value)}`);
    } else {
      navigate(`${ROUTES.LISTINGS}?category=${catId}&search=${encodeURIComponent(label)}`);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-700 shadow-xs"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Main Nav Bar */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 py-2">
          {categoriesWithFullEnums.map((cat) => {
            const Icon = cat.icon;
            const isOpen = activeCategory === cat.id;

            return (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => setActiveCategory(cat.id)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <button
                  onClick={() => handleMainCategoryClick(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isOpen
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200'
                      : 'hover:bg-slate-100/80 hover:text-slate-900 text-slate-700 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isOpen ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <span>{t(cat.labelKey, cat.defaultLabel)}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600' : 'text-slate-400'}`} />
                </button>

                {/* Multi-Column Mega Menu Drawer Panel */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full left-0 mt-1.5 w-[620px] sm:w-[720px] rounded-3xl bg-white p-5 shadow-2xl border border-slate-200/90 z-50 space-y-4"
                    >
                      {/* Drawer Top Title Bar */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                              <span>{t(cat.labelKey, cat.defaultLabel)}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Tüm İlanlar
                              </span>
                            </h4>
                          </div>
                        </div>

                        <button
                          onClick={() => handleMainCategoryClick(cat.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
                        >
                          <span>Tüm {t(cat.labelKey, cat.defaultLabel)} İlanlarını İncele</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Multi-Column Sub-Categories Grid */}
                      <div className={`grid gap-4 ${cat.sections.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        {cat.sections.map((sec, secIdx) => (
                          <div key={secIdx} className="space-y-2">
                            <h5 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1 pb-1 border-b border-slate-100">
                              <Layers className="w-3 h-3 text-emerald-600" />
                              {sec.title}
                            </h5>

                            <div className="space-y-0.5">
                              {sec.items.map((sub, itemIdx) => (
                                <button
                                  key={itemIdx}
                                  onClick={() => handleSubItemClick(cat.id, sec.filterParam, sub.value, sub.label)}
                                  className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-all flex items-center justify-between group"
                                >
                                  <span className="truncate">{sub.label}</span>
                                  <span className="text-[10px] font-bold text-slate-300 group-hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-all ml-1 shrink-0">
                                    →
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategorySubHeader;
