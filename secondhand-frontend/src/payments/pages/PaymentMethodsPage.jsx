import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {
    ArrowLeft as ArrowLeftIcon,
    Banknote as BanknotesIcon,
    CreditCard as CreditCardIcon,
    CreditCard,
    Plus as PlusIcon,
    Shield,
    Star,
    Trash2,
    Wallet as WalletIcon,
    X,
} from 'lucide-react';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import FinancialCards from '../components/FinancialCards.jsx';
import {useNotification} from '../../notification/NotificationContext.jsx';
import {formatCurrency} from '../../common/formatters.js';
import {useBankAccountMutations, useCreditCard} from '../hooks/useFinancialAccountManager.js';
import {useBankAccountsQuery, usePaymentStatisticsQuery} from '../hooks/queries.js';
import {useEWallet} from '../../ewallet/hooks/useEWallet.js';
import {EWalletActions, EWalletBalance} from '../components/WalletOverview.jsx';

const BankAccountsSection = () => {
    const notification = useNotification();
    const { data: bankAccounts = [], isLoading, error } = useBankAccountsQuery();
    const { createBankAccount, deleteBankAccount, isCreating, isDeleting } = useBankAccountMutations();
    const { data: statsData } = usePaymentStatisticsQuery('TRANSFER');
    const totalSpent = typeof statsData?.totalAmount !== 'undefined' ? statsData.totalAmount : null;

    const handleCreateBankAccount = async () => {
        notification.showConfirmation(
            'Create Bank Account',
            'Are you sure you want to create a new bank account?',
            async () => {
                try {
                    await createBankAccount();
                    notification.showSuccess('Success', 'Bank account created successfully!');
                } catch (err) {
                    const errorMessage = err.response?.data?.message || 'Error occurred while creating bank account';
                    notification.showError('Error', errorMessage);
                } finally {
                }
            }
        );
    };

    const handleDeleteBankAccount = async () => {
        notification.showConfirmation(
            'Delete Bank Account',
            'Are you sure you want to delete this bank account?',
            async () => {
                try {
                    await deleteBankAccount();
                    notification.showSuccess('Success', 'Bank account deleted successfully!');
                } catch (err) {
                    const errorMessage = err.response?.data?.message || 'Error occurred while deleting bank account';
                    notification.showError('Error', errorMessage);
                } finally {
                }
            }
        );
    };

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                        Bank Accounts ({bankAccounts.length})
                    </h2>
                    {totalSpent != null && (
                        <div className="mt-2 text-sm text-slate-500">
                            Total Spent (Bank Transfer):
                            <span className="ml-2 font-semibold text-slate-900">{formatCurrency(totalSpent)}</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleCreateBankAccount}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    disabled={isCreating}
                >
                    <PlusIcon className="w-4 h-4" />
                    {isCreating ? 'Creating...' : 'Add Bank Account'}
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600">{error?.response?.data?.message || error?.message || error}</p>
                </div>
            )}

            {isLoading ? (
                <div className="animate-pulse space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl border border-slate-200 p-6">
                            <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-200 p-6">
                            <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                        </div>
                    </div>
                </div>
            ) : bankAccounts.length === 0 ? (
                <EmptyState
                    title="No Bank Account Found"
                    description="You don't have a registered bank account yet."
                    variant="green"
                    primaryAction={{
                        label: isCreating ? 'Creating...' : 'Create Bank Account',
                        onClick: handleCreateBankAccount,
                        disabled: isCreating,
                        variant: 'green'
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bankAccounts.map((account, index) => (
                        <FinancialCards
                            key={index}
                            account={account}
                            onDelete={handleDeleteBankAccount}
                            isDeleting={isDeleting}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

/* Tüm kartlar siyah arka plan */
const BRAND_STYLES = {
    VISA:       { gradient: 'from-zinc-900 via-zinc-900 to-black', chip: 'bg-white/10' },
    Mastercard: { gradient: 'from-zinc-900 via-zinc-900 to-black', chip: 'bg-white/10' },
    AMEX:       { gradient: 'from-zinc-900 via-zinc-900 to-black', chip: 'bg-white/10' },
    Discover:   { gradient: 'from-zinc-900 via-zinc-900 to-black', chip: 'bg-white/10' },
    CARD:       { gradient: 'from-zinc-900 via-zinc-900 to-black', chip: 'bg-white/10' },
};

const getCardBrand = (card) => {
    /* Backend maskeli döndürüyor: "4539 **** **** 1234" — ilk 4 hane yeterli */
    const raw = card.number || card.cardNumber || '';
    const first4 = raw.replace(/\s/g, '').slice(0, 4);
    if (first4.startsWith('4')) return 'VISA';
    if (/^5[1-5]/.test(first4)) return 'Mastercard';
    if (/^2[2-7]/.test(first4)) return 'Mastercard'; // Mastercard yeni aralık
    if (/^3[47]/.test(first4)) return 'AMEX';
    if (/^6/.test(first4)) return 'Discover';
    return 'CARD';
};

/* Backend "1234 **** **** 5678" ya da ham 16 hane */
const formatMaskedNumber = (raw) => {
    if (!raw) return '•••• •••• •••• ••••';
    const cleaned = raw.replace(/\s/g, '');
    if (cleaned.length >= 16) {
        return `${cleaned.slice(0, 4)} •••• •••• ${cleaned.slice(-4)}`;
    }
    /* Backend maskeli geliyorsa olduğu gibi döndür */
    return raw;
};

/* Mastercard çift daire logosu */
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

const CreditCardVisual = ({ card, index, isDefault, onDeleteClick, isDeleting }) => {
    const brand = getCardBrand(card);
    const { gradient, chip } = BRAND_STYLES[brand] ?? BRAND_STYLES.CARD;
    const displayNumber = formatMaskedNumber(card.number || card.cardNumber || '');
    const expiry = `${String(card.expiryMonth || 'MM').padStart(2, '0')}/${card.expiryYear || 'YY'}`;

    return (
        <div className={`relative rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-xl overflow-hidden select-none`}
             style={{ minHeight: '172px' }}>
            {/* Dekoratif daireler */}
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -bottom-10 -left-6 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />

            <div className="relative flex flex-col h-full gap-4">
                {/* Üst: chip + default badge + sil */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* SIM chip */}
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

                {/* Kart etiketi */}
                {card.cardLabel && (
                    <p className="text-[11px] font-semibold tracking-wide opacity-75 truncate max-w-[70%]">
                        {card.cardLabel}
                    </p>
                )}

                {/* Kart numarası */}
                <p className="font-mono text-sm tracking-[0.22em] opacity-95 mt-1">
                    {displayNumber}
                </p>

                {/* Alt: Expires + Brand */}
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

const CreditCardsSection = () => {
    const notification = useNotification();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deletingCardId, setDeletingCardId] = useState(null); // hangi kartın silineceği
    const [cardMode, setCardMode] = useState('mock');
    const [creditCardLimit, setCreditCardLimit] = useState('');
    const [cardLabel, setCardLabel] = useState('');
    const [manualCard, setManualCard] = useState({ cardNumber: '', cvv: '', expiryMonth: '', expiryYear: '' });

    const {
        creditCards,
        isLoading,
        isDeleting,
        error,
        createCreditCard,
        deleteCreditCard,
    } = useCreditCard();

    const resetModal = () => {
        setShowCreateModal(false);
        setCardMode('mock');
        setCreditCardLimit('');
        setCardLabel('');
        setManualCard({ cardNumber: '', cvv: '', expiryMonth: '', expiryYear: '' });
    };

    const formatCardNumberInput = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 16);
        return digits.replace(/(.{4})/g, '$1 ').trim();
    };

    const handleCreateCreditCard = async () => {
        if (!creditCardLimit || isNaN(parseFloat(creditCardLimit))) {
            notification.showError('Error', 'Please enter a valid limit amount');
            return;
        }
        try {
            const cardData = cardMode === 'manual'
                ? { ...manualCard, cardLabel: cardLabel || undefined }
                : (cardLabel ? { cardLabel } : null);
            await createCreditCard(parseFloat(creditCardLimit), cardData);
            resetModal();
        } catch {
        }
    };

    const handleDeleteConfirmed = async () => {
        try {
            await deleteCreditCard(deletingCardId);
            setDeletingCardId(null);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error occurred while deleting credit card';
            notification.showError('Error', errorMessage);
            setDeletingCardId(null);
        }
    };

    return (
        <div>
            {/* Başlık + buton */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-base font-bold text-slate-900">Saved Cards</h2>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Encrypted &amp; secure
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
                >
                    <PlusIcon className="w-4 h-4" />
                    Add Card
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-pulse">
                    {[1, 2].map(i => (
                        <div key={i} className="h-44 rounded-2xl bg-slate-200" />
                    ))}
                </div>
            ) : creditCards.length === 0 ? (
                <EmptyState
                    title="No Credit Cards Found"
                    description="You don't have any credit cards registered yet."
                    variant="blue"
                    primaryAction={{
                        label: 'Add your first card',
                        onClick: () => setShowCreateModal(true),
                        variant: 'blue'
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {creditCards.map((card, index) => (
                        <CreditCardVisual
                            key={card.id || card.number || index}
                            card={card}
                            index={index}
                            isDefault={index === 0}
                            onDeleteClick={() => setDeletingCardId(card.id)}
                            isDeleting={isDeleting && deletingCardId === card.id}
                        />
                    ))}
                </div>
            )}

            {/* Delete confirmation modal */}
            {deletingCardId && (
                <div
                    className="fixed inset-0 z-[90] p-4 sm:p-6 flex items-center justify-center bg-slate-900/65 backdrop-blur-md"
                    onClick={() => !isDeleting && setDeletingCardId(null)}
                >
                    <div
                        className="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_-24px_rgba(15,23,42,0.55)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                                    <Trash2 className="w-5 h-5 text-rose-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-slate-900">Delete Credit Card</h3>
                                    <p className="text-sm text-slate-500 mt-0.5">This action cannot be undone.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => !isDeleting && setDeletingCardId(null)}
                                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="px-6 py-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setDeletingCardId(null)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirmed}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors text-sm font-semibold disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 z-[90] p-4 sm:p-6 flex items-center justify-center bg-slate-900/65 backdrop-blur-md"
                    onClick={resetModal}
                >
                    <div
                        className="w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_-24px_rgba(15,23,42,0.55)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 shrink-0">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Add Credit Card</h3>
                                        <p className="text-xs text-slate-500">Secure card registration</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={resetModal}
                                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 px-6 py-5">
                            {/* Mod seçici */}
                            <div className="flex bg-slate-100 rounded-xl p-1 mb-5 gap-1">
                                <button
                                    onClick={() => setCardMode('mock')}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${cardMode === 'mock' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Auto Generate
                                </button>
                                <button
                                    onClick={() => setCardMode('manual')}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${cardMode === 'manual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Enter Manually
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Kart etiketi — her iki modda da opsiyonel */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                        Card Label <span className="font-normal text-slate-400">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={50}
                                        placeholder="e.g. Personal, Business, Travel..."
                                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                                        value={cardLabel}
                                        onChange={(e) => setCardLabel(e.target.value)}
                                    />
                                </div>

                                {/* Manuel mod alanları */}
                                {cardMode === 'manual' && (
                                    <>
                                        {/* Kart numarası */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Card Number</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={19}
                                                placeholder="1234 5678 9012 3456"
                                                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-mono tracking-wider text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                                                value={manualCard.cardNumber}
                                                onChange={(e) => setManualCard(p => ({ ...p, cardNumber: formatCardNumberInput(e.target.value) }))}
                                            />
                                        </div>

                                        {/* CVV + Expiry yan yana */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">CVV</label>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={4}
                                                    placeholder="123"
                                                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-mono focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                                                    value={manualCard.cvv}
                                                    onChange={(e) => setManualCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Month</label>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={2}
                                                    placeholder="MM"
                                                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-mono focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                                                    value={manualCard.expiryMonth}
                                                    onChange={(e) => setManualCard(p => ({ ...p, expiryMonth: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Year</label>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={4}
                                                    placeholder="YYYY"
                                                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-mono focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                                                    value={manualCard.expiryYear}
                                                    onChange={(e) => setManualCard(p => ({ ...p, expiryYear: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Auto mod açıklaması */}
                                {cardMode === 'mock' && (
                                    <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
                                        <Shield className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                        <p className="text-xs text-blue-700">
                                            A valid card number, CVV and expiry date will be automatically generated for you.
                                        </p>
                                    </div>
                                )}

                                {/* Limit */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Credit Limit</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                                        placeholder="e.g. 5000"
                                        value={creditCardLimit}
                                        onChange={(e) => setCreditCardLimit(e.target.value)}
                                    />
                                    {creditCardLimit && !isNaN(parseFloat(creditCardLimit)) && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            {formatCurrency(parseFloat(creditCardLimit))}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={resetModal}
                                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors font-semibold text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateCreditCard}
                                disabled={isLoading}
                                className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 font-semibold text-sm"
                            >
                                {isLoading ? 'Adding...' : 'Add Card'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const EWalletSection = () => {
    const { eWallet, loading, error, createEWallet, updateLimits, updateSpendingWarningLimit, deposit, withdraw } = useEWallet({ enabled: true });

    const [statisticsLoaded, setStatisticsLoaded] = useState(false);
    const { data: statsData, refetch: refetchStats } = usePaymentStatisticsQuery('EWALLET', { enabled: false });
    const totalSpent = typeof statsData?.totalAmount !== 'undefined' ? statsData.totalAmount : null;

    const fetchStatistics = useCallback(async () => {
        if (statisticsLoaded) return;
        try {
            await refetchStats();
        } finally {
            setStatisticsLoaded(true);
        }
    }, [statisticsLoaded, refetchStats]);

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">eWallet</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage your wallet balance, limits and transfers</p>
                </div>
                {eWallet && (
                    <EWalletActions
                        eWallet={eWallet}
                        loading={loading}
                        onCreateEWallet={createEWallet}
                        onUpdateLimits={updateLimits}
                        onUpdateSpendingWarningLimit={updateSpendingWarningLimit}
                        onDeposit={deposit}
                        onWithdraw={withdraw}
                    />
                )}
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                    {error}
                </div>
            )}

            {!eWallet ? (
                <EmptyState
                    title="No eWallet Found"
                    description="You don't have an eWallet yet. Create one to start using digital payments."
                    variant="neutral"
                    primaryAction={{
                        label: loading ? 'Creating...' : 'Create eWallet',
                        onClick: createEWallet,
                        disabled: loading,
                        variant: 'neutral'
                    }}
                />
            ) : (
                <EWalletBalance
                    eWallet={eWallet}
                    totalSpent={totalSpent}
                    statisticsLoaded={statisticsLoaded}
                    onLoadStatistics={fetchStatistics}
                />
            )}

        </div>
    );
};

const PaymentMethodsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('credit-cards');

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam && ['bank-accounts', 'credit-cards', 'ewallet'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    const tabs = [
        {
            id: 'credit-cards',
            label: 'Credit Cards',
            icon: CreditCardIcon
        },
        {
            id: 'bank-accounts',
            label: 'Bank Accounts',
            icon: BanknotesIcon
        },
        {
            id: 'ewallet',
            label: 'eWallet',
            icon: WalletIcon
        }
    ];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        const url = new URL(window.location);
        url.searchParams.set('tab', tabId);
        window.history.replaceState({}, '', url);
    };

    return (
        <div className="min-h-screen bg-slate-50 tracking-tight">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-200/80 group shrink-0"
                    >
                        <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                            <CreditCardIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payment Methods</h1>
                            <p className="text-sm text-slate-500 mt-0.5">Manage your saved cards, accounts and wallet</p>
                        </div>
                    </div>
                </div>

                {/* Tab bar */}
                <div className="flex bg-slate-200/50 rounded-2xl p-1.5 gap-1.5 mb-10 w-full lg:max-w-xl">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-300
                                    ${isActive
                                        ? 'bg-white text-slate-900 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.1)] ring-1 ring-slate-200/50'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* İçerik */}
                <div>
                    <div key={activeTab}>
                        {activeTab === 'credit-cards' && <CreditCardsSection />}
                        {activeTab === 'bank-accounts' && <BankAccountsSection />}
                        {activeTab === 'ewallet' && <EWalletSection />}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PaymentMethodsPage;

