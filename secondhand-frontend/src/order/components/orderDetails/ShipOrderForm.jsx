import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { Truck } from 'lucide-react';
import Button from '../../../common/components/ui/Button.jsx';

// The backend creates the shipment with the chosen provider and assigns the tracking number itself.
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
 const [error, setError] = useState('');
 const handleSubmit = async e => {
 e.preventDefault();
 if (!carrier) {
 setError('Please select a carrier');
 return;
 }
 setError('');
 try {
 await onShip({
 providerName: carrier
 });
 } catch (err) {
 setError(err?.response?.data?.message || 'Failed to ship order');
 }
 };
 return <CardComponent className="p-5">
 <div className="mb-4 flex items-center gap-2">
 <Truck className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 <h3 className="text-sm font-medium text-text-primary">{t("ship_this_order")}</h3>
 </div>

 <form onSubmit={handleSubmit} noValidate className="space-y-4">
 <fieldset>
 <legend className="mb-2 text-sm text-text-secondary">{t("select_carrier")}</legend>
 {carriers.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup">
 {carriers.map(c => <button key={c.value} type="button" role="radio" aria-checked={carrier === c.value} onClick={() => {
 setCarrier(c.value);
 setError('');
 }} className={`h-10 rounded border px-3 text-sm transition-colors ${carrier === c.value ? 'border-primary text-text-primary ring-1 ring-primary' : 'border-border text-text-secondary hover:border-card-border-hover hover:text-text-primary'}`}>
 {c.label}
 </button>)}
 </div> : <p className="text-sm text-status-error-text">No cargo provider is available. Please try again later.</p>}
 </fieldset>

 {error && <p role="alert" className="text-sm text-status-error-text">{error}</p>}

 <Button type="submit" disabled={isProcessing || !carriers.length} className="w-full">
 {isProcessing ? 'Shipping...' : t("mark_as_shipped")}
 </Button>
 </form>
 </CardComponent>;
};
