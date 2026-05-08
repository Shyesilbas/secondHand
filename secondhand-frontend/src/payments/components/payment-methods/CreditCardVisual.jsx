import React from 'react';
import { Star, Trash2 } from 'lucide-react';

const BRAND_STYLES = {
    VISA:       { gradient: 'from-zinc-900 via-zinc-900 to-black', chip: 'bg-white/10' },
    Mastercard: { gradient: 'from-zinc-900 via-zinc-900 to-black', chip: 'bg-white/10' },
    AMEX:       { gradient: 'from-zinc-900 via-zinc-900 to-black', chip: 'bg-white/10' },
    Discover:   { gradient: 'from-zinc-900 via-zinc-900 to-black', chip: 'bg-white/10' },
    CARD:       { gradient: 'from-zinc-900 via-zinc-900 to-black', chip: 'bg-white/10' },
};

const getCardBrand = (card) => {
    const raw = card.number || card.cardNumber || '';
    const first4 = raw.replace(/\s/g, '').slice(0, 4);
    if (first4.startsWith('4')) return 'VISA';
    if (/^5[1-5]/.test(first4)) return 'Mastercard';
    if (/^2[2-7]/.test(first4)) return 'Mastercard';
    if (/^3[47]/.test(first4)) return 'AMEX';
    if (/^6/.test(first4)) return 'Discover';
    return 'CARD';
};

const formatMaskedNumber = (raw) => {
    if (!raw) return '•••• •••• •••• ••••';
    const cleaned = raw.replace(/\s/g, '');
    if (cleaned.length >= 16) {
        return `${cleaned.slice(0, 4)} •••• •••• ${cleaned.slice(-4)}`;
    }
    return raw;
};

const MastercardLogo = () => (
    <div className="flex items-center -space-x-2">
        <div className="w-6 h-6 rounded-full bg-red-500 opacity-90" />
        <div className="w-6 h-6 rounded-full bg-yellow-400 opacity-80" />
    </div>
);

const BrandMark = ({ brand }) => {
    if (brand === 'Mastercard') return <MastercardLogo />;
    return (
        <span className="text-sm font-bold italic tracking-tight opacity-90 leading-none">
            {brand}
        </span>
    );
};

const CreditCardVisual = ({ card, isDefault, onDeleteClick, isDeleting }) => {
    const brand = getCardBrand(card);
    const { gradient, chip } = BRAND_STYLES[brand] ?? BRAND_STYLES.CARD;
    const displayNumber = formatMaskedNumber(card.number || card.cardNumber || '');
    const expiry = `${String(card.expiryMonth || 'MM').padStart(2, '0')}/${card.expiryYear || 'YY'}`;

    return (
        <div className={`relative rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-xl overflow-hidden select-none`}
             style={{ minHeight: '172px' }}>
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -bottom-10 -left-6 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />

            <div className="relative flex flex-col h-full gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-6 rounded-md ${chip} border border-white/20 flex items-center justify-center`}>
                            <div className="w-5 h-4 rounded-sm border border-white/30 grid grid-cols-2 gap-px p-0.5">
                                <div className="bg-white/40 rounded-sm" />
                                <div className="bg-white/40 rounded-sm" />
                                <div className="bg-white/40 rounded-sm" />
                                <div className="bg-white/40 rounded-sm" />
                            </div>
                        </div>
                        {isDefault && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                                <Star className="w-2.5 h-2.5 fill-white" /> Default
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onDeleteClick}
                        disabled={isDeleting}
                        className="p-1.5 rounded-lg bg-black/20 hover:bg-red-500/70 transition-colors disabled:opacity-40"
                        title="Delete card"
                    >
                        {isDeleting
                            ? <span className="text-[10px] text-white/60">···</span>
                            : <Trash2 className="w-3.5 h-3.5 text-white/80" />
                        }
                    </button>
                </div>

                {card.cardLabel && (
                    <p className="text-[11px] font-semibold tracking-wide opacity-75 truncate max-w-[70%]">
                        {card.cardLabel}
                    </p>
                )}

                <p className="font-mono text-sm tracking-[0.22em] opacity-95 mt-1">
                    {displayNumber}
                </p>

                <div className="flex items-end justify-between mt-auto">
                    <div>
                        <p className="text-[9px] uppercase tracking-widest opacity-50 mb-0.5">Expires</p>
                        <p className="text-sm font-semibold">{expiry}</p>
                    </div>
                    <BrandMark brand={brand} />
                </div>
            </div>
        </div>
    );
};

export default CreditCardVisual;
