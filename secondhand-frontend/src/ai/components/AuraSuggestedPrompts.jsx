import {Sparkles, MessageCircle, HelpCircle, ShoppingCart} from 'lucide-react';

/**
 * ChatGPT / Claude tarzı hızlı başlangıç önerileri (Türkçe).
 */
export const AURA_QUICK_PROMPTS = [
  {
    label: 'İlan vermek için adımlar',
    message: 'İkinci el ilanımı nasıl oluştururum? Hangi sayfadan başlamalıyım?',
    icon: Sparkles,
  },
  {
    label: 'Güvenli alışveriş',
    message: 'Güvenli alışveriş için nelere dikkat etmeliyim?',
    icon: HelpCircle,
  },
  {
    label: 'Teklif ve sepet',
    message: 'Teklif vermek ile sepete eklemek arasındaki fark nedir?',
    icon: MessageCircle,
  },
  {
    label: 'Ödeme ve vitrin',
    message: 'İlan ücreti ve vitrin nedir? Nereden öderim?',
    icon: ShoppingCart,
  },
];

export default function AuraSuggestedPrompts({onPick, disabled = false, dense = false, className = ''}) {
  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      {AURA_QUICK_PROMPTS.map((p) => {
        const Icon = p.icon;
        return (
          <button
            key={p.message}
            type="button"
            disabled={disabled}
            onClick={() => onPick(p.message)}
            className={`group text-left rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-violet-300 hover:bg-violet-50/50 hover:shadow-sm disabled:opacity-50 disabled:pointer-events-none ${
              dense ? 'px-3 py-2.5' : 'px-3.5 py-3'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-violet-100 flex items-center justify-center shrink-0 transition-colors duration-200">
                <Icon className="w-3.5 h-3.5 text-gray-500 group-hover:text-violet-600 transition-colors duration-200" />
              </div>
              <span className={`font-medium text-gray-700 group-hover:text-gray-900 transition-colors ${
                dense ? 'text-[11px] leading-snug' : 'text-xs leading-snug'
              }`}>
                {p.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
