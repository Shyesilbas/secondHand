import React from 'react';
import { FileText, MapPin, Receipt, Save } from 'lucide-react';
import { ORDER_LIMITS } from '../../constants/orderUiConstants.js';

export const AddressSection = React.memo(({
  CardComponent,
  isEditingAddress,
  addressesLoading,
  addresses,
  selectedShippingAddressId,
  selectedBillingAddressId,
  setSelectedShippingAddressId,
  setSelectedBillingAddressId,
  handleSaveAddress,
  handleCancelEditAddress,
  handleStartEditAddress,
  isSavingAddress,
  selectedOrder,
  isModifiable,
}) => {
  if (isEditingAddress) {
    return (
      <CardComponent className="p-5">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <MapPin className="w-3 h-3" /> Edit Addresses
        </h4>
        {addressesLoading ? (
          <p className="text-xs text-slate-500">Loading addresses...</p>
        ) : (
          <div className="space-y-3.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1.5 block">Shipping Address *</label>
              <select
                value={selectedShippingAddressId || ''}
                onChange={(e) => setSelectedShippingAddressId(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 bg-white shadow-sm transition-all"
              >
                <option value="">Select address...</option>
                {addresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.addressLine} — {addr.city}, {addr.postalCode}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1.5 block">Billing Address (optional)</label>
              <select
                value={selectedBillingAddressId || ''}
                onChange={(e) => setSelectedBillingAddressId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 bg-white shadow-sm transition-all"
              >
                <option value="">Same as shipping</option>
                {addresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.addressLine} — {addr.city}, {addr.postalCode}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSaveAddress}
                disabled={isSavingAddress || addressesLoading}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-900/10"
              >
                <Save className="w-3.5 h-3.5" /> Save Address
              </button>
              <button
                onClick={handleCancelEditAddress}
                disabled={isSavingAddress}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </CardComponent>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <CardComponent className="p-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> Shipping Address
          </h4>
          <p className="text-sm font-semibold text-slate-900">{selectedOrder.shippingAddress?.addressLine}</p>
          <p className="text-[12px] text-slate-500 mt-1">
            {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}
          </p>
        </CardComponent>
        <CardComponent className="p-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Receipt className="w-3 h-3" /> Billing Details
          </h4>
          <p className="text-sm font-semibold text-slate-900">{selectedOrder.billingAddress?.addressLine || 'Same as shipping'}</p>
          <p className="text-[12px] text-slate-500 mt-1">TR VAT: {selectedOrder.orderNumber}</p>
        </CardComponent>
      </div>
      {isModifiable ? (
        <button
          onClick={handleStartEditAddress}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 hover:bg-indigo-100 rounded-xl transition-all"
        >
          <MapPin className="w-3.5 h-3.5" /> Change Address
        </button>
      ) : null}
    </>
  );
});
AddressSection.displayName = 'AddressSection';

export const NotesSection = React.memo(({
  CardComponent,
  isEditingNotes,
  orderNotes,
  setOrderNotes,
  handleSaveNotes,
  handleCancelEditNotes,
  handleStartEditNotes,
  isSavingNotes,
  selectedOrder,
  isModifiable,
}) => {
  if (isEditingNotes) {
    return (
      <CardComponent className="p-5">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <FileText className="w-3 h-3" /> Edit Order Notes
        </h4>
        <textarea
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          maxLength={ORDER_LIMITS.ORDER_NOTES_MAX_LENGTH}
          rows={3}
          className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 bg-white resize-none shadow-sm transition-all"
          placeholder="Add a note to your order..."
        />
        <div className="flex items-center justify-between mt-2.5">
          <p className="text-[10px] text-slate-400">
            {orderNotes.length}/{ORDER_LIMITS.ORDER_NOTES_MAX_LENGTH}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-900/10"
            >
              <Save className="w-3.5 h-3.5" /> Save Notes
            </button>
            <button
              onClick={handleCancelEditNotes}
              disabled={isSavingNotes}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </CardComponent>
    );
  }

  return (
    <CardComponent className="p-5">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <FileText className="w-3 h-3" /> Order Notes
      </h4>
      {selectedOrder.notes ? (
        <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap mb-4">{selectedOrder.notes}</p>
      ) : (
        <p className="text-xs text-slate-400 italic mb-4">No notes added yet.</p>
      )}
      {isModifiable ? (
        <button
          onClick={handleStartEditNotes}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 hover:bg-indigo-100 rounded-xl transition-all"
        >
          <FileText className="w-3.5 h-3.5" /> {selectedOrder.notes ? 'Edit Notes' : 'Add Note'}
        </button>
      ) : null}
    </CardComponent>
  );
});
NotesSection.displayName = 'NotesSection';
