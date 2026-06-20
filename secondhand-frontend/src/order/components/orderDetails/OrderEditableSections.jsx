import { useTranslation } from "react-i18next";
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
  isModifiable
}) => {
  const { t } = useTranslation();
  if (isEditingAddress) {
    return <CardComponent className="p-5">
        <h4 className="text-caption font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <MapPin className="w-3 h-3" />{t("edit_addresses")}</h4>
        {addressesLoading ? <p className="text-xs text-slate-500">{t("loading_addresses")}</p> : <div className="space-y-3.5">
            <div>
              <label className="text-caption font-semibold text-slate-500 mb-1.5 block">{t("shipping_address")}</label>
              <select value={selectedShippingAddressId || ''} onChange={e => setSelectedShippingAddressId(Number(e.target.value))} className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 bg-white shadow-sm transition-all">
                <option value="">{t("select_address")}</option>
                {addresses.map(addr => <option key={addr.id} value={addr.id}>
                    {addr.addressLine} — {addr.city}, {addr.postalCode}
                  </option>)}
              </select>
            </div>
            <div>
              <label className="text-caption font-semibold text-slate-500 mb-1.5 block">{t("billing_address_optional")}</label>
              <select value={selectedBillingAddressId || ''} onChange={e => setSelectedBillingAddressId(e.target.value ? Number(e.target.value) : null)} className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 bg-white shadow-sm transition-all">
                <option value="">{t("same_as_shipping")}</option>
                {addresses.map(addr => <option key={addr.id} value={addr.id}>
                    {addr.addressLine} — {addr.city}, {addr.postalCode}
                  </option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button onClick={handleSaveAddress} disabled={isSavingAddress || addressesLoading} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-900/10">
                <Save className="w-3.5 h-3.5" />{t("save_address")}</button>
              <button onClick={handleCancelEditAddress} disabled={isSavingAddress} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50">{t("cancel")}</button>
            </div>
          </div>}
      </CardComponent>;
  }
  return <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <CardComponent className="p-4">
          <h4 className="text-caption font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />{t("shipping_address")}</h4>
          <p className="text-sm font-semibold text-slate-900">{selectedOrder.shippingAddress?.addressLine}</p>
          <p className="text-body text-slate-500 mt-1">
            {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}
          </p>
        </CardComponent>
        <CardComponent className="p-4">
          <h4 className="text-caption font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Receipt className="w-3 h-3" />{t("billing_details")}</h4>
          <p className="text-sm font-semibold text-slate-900">{selectedOrder.billingAddress?.addressLine || 'Same as shipping'}</p>
          <p className="text-body text-slate-500 mt-1">{t("tr_vat")}{selectedOrder.orderNumber}</p>
        </CardComponent>
      </div>
      {isModifiable ? <button onClick={handleStartEditAddress} className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 hover:bg-indigo-100 rounded-xl transition-all">
          <MapPin className="w-3.5 h-3.5" />{t("change_address")}</button> : null}
    </>;
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
  isModifiable
}) => {
  const { t } = useTranslation();
  if (isEditingNotes) {
    return <CardComponent className="p-5">
        <h4 className="text-caption font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <FileText className="w-3 h-3" />{t("edit_order_notes")}</h4>
        <textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)} maxLength={ORDER_LIMITS.ORDER_NOTES_MAX_LENGTH} rows={3} className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 bg-white resize-none shadow-sm transition-all" placeholder={t("add_a_note_to_your_order")} />
        <div className="flex items-center justify-between mt-2.5">
          <p className="text-caption text-slate-400">
            {orderNotes.length}/{ORDER_LIMITS.ORDER_NOTES_MAX_LENGTH}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={handleSaveNotes} disabled={isSavingNotes} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-900/10">
              <Save className="w-3.5 h-3.5" />{t("save_notes")}</button>
            <button onClick={handleCancelEditNotes} disabled={isSavingNotes} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50">{t("cancel")}</button>
          </div>
        </div>
      </CardComponent>;
  }
  return <CardComponent className="p-5">
      <h4 className="text-caption font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <FileText className="w-3 h-3" />{t("order_notes")}</h4>
      {selectedOrder.notes ? <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap mb-4">{selectedOrder.notes}</p> : <p className="text-xs text-slate-400 italic mb-4">{t("no_notes_added_yet")}</p>}
      {isModifiable ? <button onClick={handleStartEditNotes} className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 hover:bg-indigo-100 rounded-xl transition-all">
          <FileText className="w-3.5 h-3.5" /> {selectedOrder.notes ? 'Edit Notes' : 'Add Note'}
        </button> : null}
    </CardComponent>;
});
NotesSection.displayName = 'NotesSection';