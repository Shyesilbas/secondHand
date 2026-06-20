import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { Truck, Hash, Send, AlertCircle } from 'lucide-react';
export const ShipOrderForm = ({
  onShip,
  carriers = [],
  isProcessing,
  CardComponent
}) => {
  const {
    t
  } = useTranslation();
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!carrier) {
      setError('Please select a carrier');
      return;
    }
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }
    try {
      await onShip({
        carrier,
        trackingNumber
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to ship order');
    }
  };
  return <CardComponent className="p-5 border-primary bg-indigo-50/30">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-medium text-text-primary">{t("ship_this_order")}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-caption font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t("select_carrier")}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {carriers.map(c => <button key={c.value} type="button" onClick={() => setCarrier(c.value)} className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${carrier === c.value ? 'bg-primary border-primary text-white shadow-md shadow-indigo-200' : 'bg-background-primary border-border-light text-slate-600 hover:border-primary hover:text-primary'}`}>
                {c.label}
              </button>)}
          </div>
        </div>

        <div>
          <label className="block text-caption font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t("tracking_number")}</label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold bg-background-primary" placeholder={t("e_g_ar123456789")} />
          </div>
        </div>

        {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>}

        <button type="submit" disabled={isProcessing} className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-slate-900/10">
          {isProcessing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}{t("mark_as_shipped")}</button>
      </form>
    </CardComponent>;
};