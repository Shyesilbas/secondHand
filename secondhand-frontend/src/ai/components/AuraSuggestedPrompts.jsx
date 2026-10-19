import { TrendingDown, ShieldCheck, MessageSquare, Search } from 'lucide-react';

const AURA_CAPABILITY_PROMPTS = [
  {
    id: 'price-advisor',
    label: 'Piyasa Fiyat Değerlemesi',
    subtitle: 'İlan fiyatının piyasa ortalamasına göre fırsat mı yüksek mi olduğunu analiz edin.',
    message: 'İkinci el piyasasında fiyat analizi nasıl yapılır? Bir ürünün gerçek piyasa değerini ve fırsat olup olmadığını nasıl belirleyebilirim?',
    icon: TrendingDown,
  },
  {
    id: 'negotiation-strategy',
    label: 'Pazarlık & Teklif Stratejisi',
    subtitle: 'Satıcıya iletilecek piyasaya uygun, saygılı ve sonuç odaklı teklif metni oluşturun.',
    message: 'Bir ilana teklif verirken satıcıyı ikna edecek, piyasaya uygun ve saygılı bir pazarlık mesajı taslağı hazırlar mısın?',
    icon: MessageSquare,
  },
  {
    id: 'escrow-safety',
    label: 'Güvenli Ödeme & Escrow',
    subtitle: 'Havuz hesabı, kargo onay süreci ve dolandırıcılıktan korunma adımlarını öğrenin.',
    message: 'İkinci el alışverişte dolandırıcılıktan korunmak için nelere dikkat etmeliyim? Güvenli ödeme havuzu (Escrow) sistemi nasıl çalışır?',
    icon: ShieldCheck,
  },
  {
    id: 'listing-discovery',
    label: 'Akıllı İlan Arama & Filtreleme',
    subtitle: 'Bütçenize, şehrinize ve aradığınız teknik özelliklere en uygun ürünleri bulun.',
    message: 'SecondHand platformunda bütçeme ve kriterlerime en uygun popüler teknoloji ve ikinci el ilanlarını nasıl bulabilirim?',
    icon: Search,
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
            className="flex flex-col justify-between rounded border border-border bg-background-primary p-4 text-left transition-colors duration-150 ease-out hover:border-card-border-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Icon className="h-5 w-5 text-text-secondary" strokeWidth={1.5} aria-hidden />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">
                {p.label}
              </h3>
              <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                {p.subtitle}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
