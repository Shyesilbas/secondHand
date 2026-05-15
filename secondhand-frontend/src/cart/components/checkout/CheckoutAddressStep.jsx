import { useState } from 'react';
import { ChevronDown, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../common/constants/routes.js';

const CheckoutAddressStep = ({
  addresses,
  selectedShippingAddressId,
  setSelectedShippingAddressId,
  selectedBillingAddressId,
  setSelectedBillingAddressId,
  notes,
  setNotes,
  orderName,
  setOrderName,
  onNext,
  onBack,
}) => {
  const navigate = useNavigate();
  const hasAddresses = Array.isArray(addresses) && addresses.length > 0;

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(
    () => !selectedBillingAddressId || selectedBillingAddressId === selectedShippingAddressId
  );

  const handleShippingChange = (id) => {
    setSelectedShippingAddressId(Number(id));
    if (billingSameAsShipping) {
      setSelectedBillingAddressId(Number(id));
    }
  };

  const handleBillingToggle = () => {
    const next = !billingSameAsShipping;
    setBillingSameAsShipping(next);
    if (next) {
      setSelectedBillingAddressId(selectedShippingAddressId);
    }
  };

  const isStepValid = selectedShippingAddressId && selectedBillingAddressId;

  const selectedBillingAddress = addresses?.find((a) => String(a.id) === String(selectedBillingAddressId));

  return (
    <div className="p-5 sm:p-7">
      {/* Section: Shipping */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#111]">Shipping address</h3>
          <span className="text-[10px] font-medium uppercase tracking-widest text-[#999]">Required</span>
        </div>

        {!hasAddresses ? (
          <div className="rounded-lg border border-dashed border-[#ddd] bg-[#fafaf9] py-10 text-center">
            <p className="mb-4 text-sm text-[#999]">No saved addresses.</p>
            <button
              type="button"
              onClick={() => navigate(ROUTES.PROFILE)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#1466c6] bg-[#1466c6] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#0f529e]"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Add address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {addresses.map((address) => {
              const isSelected = String(selectedShippingAddressId) === String(address.id);
              return (
                <label
                  key={address.id}
                  className={`relative cursor-pointer rounded-lg border p-4 transition-all duration-150 ${
                    isSelected
                      ? 'border-l-[3px] border-l-[#1466c6] border-t-[#e5e3df] border-r-[#e5e3df] border-b-[#e5e3df] bg-[#fafcff]'
                      : 'border-[#e5e3df] bg-white hover:border-[#bcb6b0]'
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    value={address.id}
                    checked={isSelected}
                    onChange={(e) => handleShippingChange(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-start gap-3">
                    {/* Radio indicator */}
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        isSelected ? 'border-[#1466c6]' : 'border-[#ccc]'
                      }`}
                    >
                      {isSelected && <span className="h-2 w-2 rounded-full bg-[#1466c6]" />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[#111]">{address.addressLine}</div>
                      <div className="mt-0.5 text-xs text-[#555]">
                        {address.city}, {address.state} {address.postalCode}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-[#999]">{address.country}</span>
                        {address.mainAddress && (
                          <span className="rounded border border-[#e5e3df] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-[#999]">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Billing toggle */}
      {hasAddresses && (
        <div className="mb-6 rounded-lg border border-[#e5e3df] bg-[#fafaf9] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer select-none items-center gap-3">
              <input
                type="checkbox"
                checked={billingSameAsShipping}
                onChange={handleBillingToggle}
                className="h-4 w-4 rounded border-[#ccc] text-[#1466c6] focus:ring-[#1466c6]/20"
              />
              <span className="text-sm font-medium text-[#111]">Billing same as shipping</span>
            </label>

            {!billingSameAsShipping && (
              <div className="relative w-full sm:w-64">
                <select
                  value={selectedBillingAddressId || ''}
                  onChange={(e) => setSelectedBillingAddressId(Number(e.target.value))}
                  className="w-full appearance-none rounded-lg border border-[#e5e3df] bg-white px-3 py-2.5 pr-9 text-sm text-[#111] outline-none transition focus:border-[#1466c6] focus:ring-2 focus:ring-[#1466c6]/15"
                >
                  <option value="">Choose billing address</option>
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.addressLine} — {a.city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
                {selectedBillingAddress && !billingSameAsShipping && (
                  <p className="mt-1.5 truncate pl-0.5 text-[11px] text-[#999]">
                    {selectedBillingAddress.city}, {selectedBillingAddress.state}{' '}
                    {selectedBillingAddress.postalCode}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order name & notes */}
      <div className="mb-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#555]">
            Order name <span className="font-normal text-[#bbb]">(optional)</span>
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-[#e5e3df] bg-white px-3 py-2.5 text-sm text-[#111] outline-none transition placeholder:text-[#bbb] focus:border-[#1466c6] focus:ring-2 focus:ring-[#1466c6]/15"
            placeholder="e.g. Birthday gift"
            value={orderName || ''}
            onChange={(e) => setOrderName(e.target.value)}
            maxLength={100}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#555]">
            Notes <span className="font-normal text-[#bbb]">(optional)</span>
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-[#e5e3df] bg-white px-3 py-2.5 text-sm text-[#111] outline-none transition placeholder:text-[#bbb] focus:border-[#1466c6] focus:ring-2 focus:ring-[#1466c6]/15"
            placeholder="Delivery notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Navigation — desktop */}
      <div className="hidden items-center justify-between border-t border-[#f0efed] pt-5 sm:flex">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-[#555] transition-colors hover:text-[#111]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isStepValid}
          className="flex items-center gap-2 rounded-lg border border-[#1466c6] bg-[#1466c6] px-6 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:border-[#0f529e] hover:bg-[#0f529e] disabled:cursor-not-allowed disabled:border-[#e8e6e4] disabled:bg-[#e8e6e4] disabled:text-[#9c9894] active:scale-[0.99]"
        >
          Continue
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Navigation — mobile */}
      <div className="sticky bottom-0 -mx-5 mt-4 grid grid-cols-2 gap-2 border-t border-[#f0efed] bg-white px-5 py-4 sm:hidden">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-[#e5e3df] bg-white py-3 text-sm font-medium text-[#111] transition-all hover:bg-[#fafaf9]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isStepValid}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-[#1466c6] bg-[#1466c6] py-3 text-sm font-medium text-white transition-all hover:bg-[#0f529e] disabled:border-[#e8e6e4] disabled:bg-[#e8e6e4] disabled:text-[#9c9894]"
        >
          Continue
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default CheckoutAddressStep;
