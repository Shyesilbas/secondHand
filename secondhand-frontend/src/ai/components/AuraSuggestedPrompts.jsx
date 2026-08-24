import React from 'react';
import { Sparkles, HelpCircle, MessageCircle, ShoppingBag, ArrowRight } from 'lucide-react';

const AURA_QUICK_PROMPTS = [
  {
    label: 'İlan Nasıl Oluşturulur?',
    message: 'İkinci el ilanımı nasıl oluşturabilirim? Fotoğraf ve fiyatlandırma için tavsiyelerin neler?',
    subtitle: 'Adım adım ilan yayınlama rehberi',
    icon: Sparkles,
    gradient: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50/60',
    border: 'border-amber-100',
  },
  {
    label: 'Güvenli Alışveriş & Havuz',
    message: 'İkinci el alışverişte dolandırıcılıktan korunmak için nelere dikkat etmeliyim? Güvenli ödeme havuzu nasıl çalışır?',
    subtitle: 'Emanet (escrow) ve iade güvencesi',
    icon: HelpCircle,
    gradient: 'from-emerald-500 to-teal-500',
    bgLight: 'bg-emerald-50/60',
    border: 'border-emerald-100',
  },
  {
    label: 'Teklif ve Pazarlık Stratejisi',
    message: 'Bir ilana teklif vermek ile sepete eklemek arasındaki fark nedir? Pazarlık yaparken nelere dikkat etmeliyim?',
    subtitle: 'Doğru fiyat teklifi oluşturma',
    icon: MessageCircle,
    gradient: 'from-indigo-500 to-violet-500',
    bgLight: 'bg-indigo-50/60',
    border: 'border-indigo-100',
  },
  {
    label: 'Vitrin & İlan Öne Çıkarma',
    message: 'İlanımı vitrinde nasıl öne çıkarabilirim ve daha hızlı nasıl satabilirim?',
    subtitle: 'Görünürlük ve satış artırma ipuçları',
    icon: ShoppingBag,
    gradient: 'from-rose-500 to-pink-500',
    bgLight: 'bg-rose-50/60',
    border: 'border-rose-100',
  },
];

export default function AuraSuggestedPrompts({
  onPick,
  disabled = false,
  dense = false,
  className = ''
}) {
  return (
    <div className={`grid grid-cols-1 ${dense ? '' : 'sm:grid-cols-2'} gap-3 ${className}`}>
      {AURA_QUICK_PROMPTS.map((p) => {
        const Icon = p.icon;
        return (
          <button
            key={p.label}
            type="button"
            disabled={disabled}
            onClick={() => onPick(p.message)}
            className={`group text-left rounded-2xl border ${p.border} ${p.bgLight} p-4 transition-all duration-200 hover:scale-[1.01] hover:shadow-md hover:border-indigo-200 bg-white/90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-between gap-3`}
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${p.gradient} flex items-center justify-center shrink-0 shadow-xs text-white`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                  {p.label}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {p.subtitle}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0" />
          </button>
        );
      })}
    </div>
  );
}
