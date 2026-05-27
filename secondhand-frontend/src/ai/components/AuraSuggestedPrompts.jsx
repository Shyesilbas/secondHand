import {Sparkles, MessageCircle, HelpCircle, ShoppingCart} from 'lucide-react';

/**
 * ChatGPT / Claude style quick start suggestions (English).
 */
export const AURA_QUICK_PROMPTS = [
  {
    label: 'How to list items',
    message: 'How do I create my second-hand listing? Which page should I start from?',
    subtitle: 'Learn listing creation step-by-step',
    icon: Sparkles,
  },
  {
    label: 'Secure shopping',
    message: 'What should I pay attention to for secure shopping?',
    subtitle: 'Tips for safe payments and handovers',
    icon: HelpCircle,
  },
  {
    label: 'Offers and Cart',
    message: 'What is the difference between making an offer and adding to cart?',
    subtitle: 'Understand bids vs checkout options',
    icon: MessageCircle,
  },
  {
    label: 'Payment and Showcase',
    message: 'What is a listing fee and showcase? Where do I pay?',
    subtitle: 'Promote and highlights for your products',
    icon: ShoppingCart,
  },
];

export default function AuraSuggestedPrompts({onPick, disabled = false, dense = false, className = ''}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${className}`}>
      {AURA_QUICK_PROMPTS.map((p) => {
        const Icon = p.icon;
        return (
          <button
            key={p.message}
            type="button"
            disabled={disabled}
            onClick={() => onPick(p.message)}
            className={`group text-left rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:border-slate-400 hover:bg-slate-50/50 hover:shadow-md disabled:opacity-50 disabled:pointer-events-none ${
              dense ? 'p-3' : 'p-4'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 group-hover:border-slate-300 group-hover:bg-white flex items-center justify-center shrink-0 transition-all duration-200 shadow-sm">
                <Icon className="w-4 h-4 text-slate-500 group-hover:text-slate-900 transition-colors duration-200" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-semibold text-slate-800 group-hover:text-slate-950 transition-colors ${
                  dense ? 'text-xs' : 'text-sm'
                }`}>
                  {p.label}
                </p>
                <p className={`text-slate-400 group-hover:text-slate-500 mt-0.5 line-clamp-1 transition-colors leading-normal ${
                  dense ? 'text-[10px]' : 'text-xs'
                }`}>
                  {p.subtitle}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}


