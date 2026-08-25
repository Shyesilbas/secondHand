import React from 'react';
import { 
  TrendingDown, 
  ShieldCheck, 
  MessageSquare, 
  Search, 
  Sparkles, 
  ArrowUpRight,
  Zap,
  HelpCircle,
  ShoppingBag
} from 'lucide-react';

const AURA_CAPABILITY_PROMPTS = [
  {
    id: 'price-advisor',
    label: 'Piyasa Fiyat Değerlemesi',
    subtitle: 'İlanın fiyatının piyasa ortalamasına göre fırsat mı pahalı mı olduğunu analiz et.',
    message: 'İkinci el piyasasında fiyat analizi nasıl yapılır? Bir ürünün gerçek piyasa değerini ve fırsat olup olmadığını nasıl belirleyebilirim?',
    icon: TrendingDown,
    badge: 'Akıllı Analiz',
    gradient: 'from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-200/60'
  },
  {
    id: 'negotiation-strategy',
    label: 'Pazarlık & Teklif Stratejisi',
    subtitle: 'Satıcıya gönderilecek mantıklı, nazik ve kabul görme şansı yüksek bir teklif mesajı hazırla.',
    message: 'Bir ilana teklif verirken satıcıyı ikna edecek, piyasaya uygun ve saygılı bir pazarlık mesajı taslağı hazırlar mısın?',
    icon: MessageSquare,
    badge: 'Teklif Botu',
    gradient: 'from-blue-500/10 to-indigo-500/10 text-blue-700 border-blue-200/60'
  },
  {
    id: 'escrow-safety',
    label: 'Güvenli Ödeme & Escrow',
    subtitle: 'Havuz hesabı, kargo onay süreci ve dolandırıcılıktan korunma adımlarını öğrenin.',
    message: 'İkinci el alışverişte dolandırıcılıktan korunmak için nelere dikkat etmeliyim? Güvenli ödeme havuzu (Escrow) sistemi nasıl çalışır?',
    icon: ShieldCheck,
    badge: 'Maksimum Güvenlik',
    gradient: 'from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-200/60'
  },
  {
    id: 'listing-discovery',
    label: 'Akıllı İlan Arama & Filtreleme',
    subtitle: 'Bütçenize, şehrinize ve aradığınız teknik özelliklere en uygun ürünleri bulun.',
    message: 'SecondHand platformunda bütçeme ve kriterlerime en uygun popüler teknoloji ve ikinci el ilanlarını nasıl bulabilirim?',
    icon: Search,
    badge: 'Doğal Dil Arama',
    gradient: 'from-purple-500/10 to-pink-500/10 text-purple-700 border-purple-200/60'
  },
];

export default function AuraSuggestedPrompts({
  onPick,
  disabled = false,
  dense = false,
  className = ''
}) {
  return (
    <div className={`grid grid-cols-1 ${dense ? 'gap-2' : 'sm:grid-cols-2 gap-3'} ${className}`}>
      {AURA_CAPABILITY_PROMPTS.map((p) => {
        const Icon = p.icon;
        return (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            onClick={() => onPick(p.message)}
            className="group relative flex flex-col justify-between text-left rounded-2xl border border-zinc-200/90 bg-white p-4 transition-all duration-200 hover:border-zinc-900 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl border bg-gradient-to-br ${p.gradient}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200/60">
                    {p.badge}
                  </span>
                  <div className="h-6 w-6 rounded-full flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 group-hover:bg-zinc-100 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-black">
                {p.label}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed font-normal">
                {p.subtitle}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[10px] font-semibold text-zinc-400 group-hover:text-zinc-800 transition-colors">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Tek tıkla sor</span>
              </span>
              <span className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity">
                Çalıştır ↵
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
