import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Check, AlertCircle, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../common/formatters.js';

const BulkSelectionModal = ({ isOpen, onClose, listings, showcaseListingIds, onProceed, pricing }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const threshold = pricing?.bulkDiscountThreshold || 4;
  const discountPct = pricing?.bulkDiscountPercentage || 10;

  // Filter listings that are NOT already in showcase
  const availableListings = useMemo(() => {
    return listings.filter(l => !showcaseListingIds.has(l.id));
  }, [listings, showcaseListingIds]);

  const filteredListings = useMemo(() => {
    return availableListings.filter(l => 
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.listingNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableListings, searchTerm]);

  if (!isOpen) return null;

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleProceed = () => {
    const selected = listings.filter(l => selectedIds.has(l.id));
    // Final unique check
    const unique = Array.from(new Map(selected.map(l => [l.id, l])).values());
    onProceed(unique);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Select Listings to Boost</h2>
              <p className="text-sm text-slate-500">Choose the items you want to feature in the showcase</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="px-8 py-3 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          
          {availableListings.length > 0 && (
            <button 
              onClick={() => {
                if (selectedIds.size === availableListings.length) setSelectedIds(new Set());
                else setSelectedIds(new Set(availableListings.map(l => l.id)));
              }}
              className="shrink-0 text-sm font-bold text-indigo-600 hover:text-indigo-700 px-3 py-2 hover:bg-indigo-50 rounded-lg transition-all"
            >
              {selectedIds.size === availableListings.length ? 'Deselect All' : 'Select All Eligible'}
            </button>
          )}
        </div>

        {/* Discount Notification */}
        {selectedIds.size > 0 && (
          <div className="px-8 py-3">
            {selectedIds.size >= threshold ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 flex items-center justify-between animate-in zoom-in-95">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-500 rounded-full p-1">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-bold text-emerald-700">Congratulations! You have earned a {discountPct}% discount!</span>
                </div>
                <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <div className="bg-amber-500 rounded-full p-1">
                  <AlertCircle className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-amber-700">
                  Select <span className="font-bold underline">{threshold - selectedIds.size} more</span> to earn a {discountPct}% discount!
                </span>
              </div>
            )}
          </div>
        )}

        {/* List */}
        <div className="p-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
          {filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">No eligible listings found</p>
              <p className="text-xs text-slate-400 mt-1">Only listings not currently in showcase can be selected</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {filteredListings.map(listing => (
                <div 
                  key={listing.id}
                  onClick={() => toggleSelect(listing.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${
                    selectedIds.has(listing.id) 
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-6 h-6 shrink-0 rounded-lg border-2 flex items-center justify-center transition-all ${
                    selectedIds.has(listing.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 group-hover:border-slate-300'
                  }`}>
                    {selectedIds.has(listing.id) && <Check className="w-4 h-4 text-white" />}
                  </div>

                  {/* Listing Image */}
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/50">
                    {(listing.imageUrl || listing.images?.[0]?.url) ? (
                      <img 
                        src={listing.imageUrl || listing.images[0].url} 
                        alt={listing.title} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                        <Search className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{listing.title}</h4>
                    <p className="text-xs text-slate-500">{listing.listingNo} • {formatCurrency(listing.price, listing.currency)}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                    <p className="text-xs font-bold text-emerald-600">{listing.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div className="text-sm">
            <span className="text-slate-500">Selected:</span>
            <span className="ml-1.5 font-bold text-slate-900">{selectedIds.size} items</span>
          </div>
          
          <button
            onClick={handleProceed}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default BulkSelectionModal;
