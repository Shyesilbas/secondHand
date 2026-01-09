import React, { memo } from 'react';
import { Scale, X, Trash2, Image as ImageIcon } from 'lucide-react';
import { useComparison } from '../hooks/useComparison.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import { formatCurrencyCompact } from '../../common/formatters.js';

const CompareFloatingBar = memo(() => {
    const { items, category, itemCount, maxItems, removeFromComparison, clearComparison, openModal } = useComparison();
    const { getListingTypeLabel } = useEnums();

    if (itemCount === 0) return null;

    const canCompare = itemCount >= 2;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
            <div className="max-w-4xl mx-auto px-4 pb-4">
                <div className="pointer-events-auto bg-background-primary/95 backdrop-blur-lg border border-border-light rounded-2xl shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-r from-accent-indigo-600/10 to-accent-indigo-500/5 border-b border-border-light">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-accent-indigo-600 rounded-lg">
                                    <Scale className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-text-primary">
                                        Compare {getListingTypeLabel(category)}
                                    </span>
                                    <span className="text-xs text-text-secondary ml-2">
                                        {itemCount} of {maxItems} selected
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={clearComparison}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-status-error-DEFAULT hover:bg-status-error-bg rounded-lg transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Clear All
                            </button>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="relative group flex-shrink-0 w-20 bg-secondary-50 rounded-xl border border-border-light overflow-hidden hover:border-accent-indigo-300 transition-colors"
                                    >
                                        <div className="aspect-square relative">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-secondary-100">
                                                    <ImageIcon className="w-5 h-5 text-text-muted" />
                                                </div>
                                            )}
                                            <button
                                                onClick={() => removeFromComparison(item.id)}
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-status-error-DEFAULT text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-status-error-hover"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="p-1.5">
                                            <p className="text-[10px] font-medium text-text-primary truncate" title={item.title}>
                                                {item.title}
                                            </p>
                                            <p className="text-[10px] font-bold text-accent-indigo-600">
                                                {formatCurrencyCompact(item.campaignPrice || item.price, item.currency)}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {Array.from({ length: maxItems - itemCount }).map((_, index) => (
                                    <div
                                        key={`empty-${index}`}
                                        className="flex-shrink-0 w-20 aspect-square rounded-xl border-2 border-dashed border-border-light flex items-center justify-center"
                                    >
                                        <span className="text-[10px] text-text-muted">+</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex-shrink-0 pl-3 border-l border-border-light">
                                <button
                                    onClick={openModal}
                                    disabled={!canCompare}
                                    className={`
                                        flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                                        ${canCompare
                                            ? 'bg-accent-indigo-600 text-white hover:bg-accent-indigo-700 shadow-lg shadow-accent-indigo-600/25 hover:shadow-xl hover:shadow-accent-indigo-600/30'
                                            : 'bg-secondary-100 text-text-muted cursor-not-allowed'
                                        }
                                    `}
                                >
                                    <Scale className="w-4 h-4" />
                                    Compare
                                </button>
                                {!canCompare && (
                                    <p className="text-[10px] text-text-muted mt-1 text-center">
                                        Select at least 2
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

CompareFloatingBar.displayName = 'CompareFloatingBar';

export default CompareFloatingBar;

