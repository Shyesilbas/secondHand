/**
 * ChatGPT / Claude tarzı hızlı başlangıç önerileri (Türkçe).
 */
export const AURA_QUICK_PROMPTS = [
  {
    label: 'İlan vermek için adımlar',
    message: 'İkinci el ilanımı nasıl oluştururum? Hangi sayfadan başlamalıyım?',
  },
  {
    label: 'Güvenli alışveriş',
    message: 'Güvenli alışveriş için nelere dikkat etmeliyim?',
  },
  {
    label: 'Teklif ve sepet',
    message: 'Teklif vermek ile sepete eklemek arasındaki fark nedir?',
  },
  {
    label: 'Ödeme ve vitrin',
    message: 'İlan ücreti ve vitrin nedir? Nereden öderim?',
  },
];

export default function AuraSuggestedPrompts({ onPick, disabled = false, dense = false, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {AURA_QUICK_PROMPTS.map((p) => (
        <button
          key={p.message}
          type="button"
          disabled={disabled}
          onClick={() => onPick(p.message)}
          className={`text-left rounded-2xl border border-slate-200/90 bg-white/90 text-slate-800 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/80 hover:shadow disabled:opacity-50 disabled:pointer-events-none ${
            dense ? 'px-3 py-2 text-[11px] leading-snug max-w-[11rem]' : 'px-3.5 py-2.5 text-xs leading-snug max-w-[14rem]'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
