import { TrendingDown, ShieldCheck, MessageSquare, Search, ArrowUpRight, Zap } from 'lucide-react';

const AURA_CAPABILITY_PROMPTS = [
  {
    id: 'price-advisor',
    label: 'Piyasa Fiyat Değerlemesi',
    subtitle: 'İlanın fiyatının piyasa ortalamasına göre fırsat mı pahalı mı olduğunu analiz et.',
    message: 'İkinci el piyasasında fiyat analizi nasıl yapılır? Bir ürünün gerçek piyasa değerini ve fırsat olup olmadığını nasıl belirleyebilirim?',
    icon: TrendingDown,
    badge: 'Akıllı Analiz',
    gradient: 'bg-background-tertiary text-status-success-text border-border/60'
  },
  {
    id: 'negotiation-strategy',
    label: 'Pazarlık & Teklif Stratejisi',
    subtitle: 'Satıcıya gönderilecek mantıklı, nazik ve kabul görme şansı yüksek bir teklif mesajı hazırla.',
    message: 'Bir ilana teklif verirken satıcıyı ikna edecek, piyasaya uygun ve saygılı bir pazarlık mesajı taslağı hazırlar mısın?',
    icon: MessageSquare,
    badge: 'Teklif Botu',
    gradient: 'bg-background-tertiary text-text-primary border-border/60'
  },
  {
    id: 'escrow-safety',
    label: 'Güvenli Ödeme & Escrow',
    subtitle: 'Havuz hesabı, kargo onay süreci ve dolandırıcılıktan korunma adımlarını öğrenin.',
    message: 'İkinci el alışverişte dolandırıcılıktan korunmak için nelere dikkat etmeliyim? Güvenli ödeme havuzu (Escrow) sistemi nasıl çalışır?',
    icon: ShieldCheck,
    badge: 'Maksimum Güvenlik',
    gradient: 'bg-background-tertiary text-status-warning-text border-border/60'
  },
  {
    id: 'listing-discovery',
    label: 'Akıllı İlan Arama & Filtreleme',
    subtitle: 'Bütçenize, şehrinize ve aradığınız teknik özelliklere en uygun ürünleri bulun.',
    message: 'SecondHand platformunda bütçeme ve kriterlerime en uygun popüler teknoloji ve ikinci el ilanlarını nasıl bulabilirim?',
    icon: Search,
    badge: 'Doğal Dil Arama',
    gradient: 'bg-background-tertiary text-text-primary border-border/60'
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
            className="group relative flex flex-col justify-between text-left rounded-md border border-border/90 bg-white p-4 transition-all duration-200 hover:border-primary disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded border ${p.gradient}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-text-tertiary bg-background-tertiary px-2 py-0.5 rounded-sm border border-border/60">
                    {p.badge}
                  </span>
                  <div className="h-6 w-6 rounded flex items-center justify-center text-text-muted group-hover:text-text-primary group-hover:bg-background-tertiary transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <h3 className="text-xs sm:text-sm font-semibold text-text-primary group-hover:text-black">
                {p.label}
              </h3>
              <p className="text-xs text-text-tertiary mt-1 line-clamp-2 leading-relaxed font-normal">
                {p.subtitle}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-border-light flex items-center justify-between text-xs font-semibold text-text-muted group-hover:text-text-primary transition-colors">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-status-warning" />
                <span>Tek tıkla sor</span>
              </span>
              <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                Çalıştır ↵
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
