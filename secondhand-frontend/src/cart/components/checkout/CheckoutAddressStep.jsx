import { useTranslation } from 'react-i18next';
import { useState, useMemo, useEffect, memo } from 'react';
import { ArrowRight, Check, MapPin, Plus } from 'lucide-react';
import AddressForm from '../../../user/components/address/AddressForm.jsx';
import useAddresses from '../../../user/hooks/useAddresses.js';
import Button from '../../../common/components/ui/Button.jsx';
import { inputNormal } from '../../../common/components/forms/inputStyles.js';
import CheckoutStepFooter from './CheckoutStepFooter.jsx';
import logger from '../../../common/utils/logger.js';

const PREDEFINED_HUBS = [
  'Kadıköy İskele Meydanı',
  'Mecidiyeköy Meydanı / Metro Çıkışı',
  'Beşiktaş Çarşı / Kartal Heykeli',
  'Kızılay Meydanı (Ankara)',
  'Konak Vapur İskelesi (İzmir)'
];

const optionClass = (selected, disabled = false) => {
  if (disabled) return 'cursor-not-allowed border-border bg-background-secondary opacity-50';
  return selected
    ? 'cursor-pointer border-primary ring-1 ring-primary'
    : 'cursor-pointer border-border hover:border-card-border-hover';
};

const RadioDot = ({ selected }) => (
  <span
    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-primary bg-primary' : 'border-border-dark'}`}
    aria-hidden
  >
    {selected && <span className="h-1.5 w-1.5 rounded-full bg-background-primary" />}
  </span>
);

const Section = ({ title, action, children }) => (
  <section className="px-5 py-5 sm:px-6">
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

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
  deliveryMethod,
  setDeliveryMethod,
  meetupLocation,
  setMeetupLocation,
  cartItems,
  onNext,
  onBack
}) => {
  const { t } = useTranslation();
  const { addAddress, loading: addressMutating, error: addressError } = useAddresses();
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const hasAddresses = Array.isArray(addresses) && addresses.length > 0;
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(
    () => !selectedBillingAddressId || selectedBillingAddressId === selectedShippingAddressId
  );
  const [customLocationActive, setCustomLocationActive] = useState(
    () => !!meetupLocation && !PREDEFINED_HUBS.includes(meetupLocation)
  );
  const [extrasOpen, setExtrasOpen] = useState(() => !!(orderName || notes));
  const isMeetup = deliveryMethod === 'SAFE_MEETUP';

  const handleAddAddressSubmit = async (newAddress) => {
    try {
      const result = await addAddress(newAddress);
      if (result?.id) {
        setSelectedShippingAddressId(Number(result.id));
        setSelectedBillingAddressId(Number(result.id));
      }
      setIsAddAddressModalOpen(false);
    } catch (e) {
      logger.error('Failed to add address:', e);
    }
  };

  const handleShippingChange = (id) => {
    setSelectedShippingAddressId(Number(id));
    if (billingSameAsShipping || isMeetup) {
      setSelectedBillingAddressId(Number(id));
    }
  };

  const handleBillingToggle = () => {
    const next = !billingSameAsShipping;
    setBillingSameAsShipping(next);
    if (next) setSelectedBillingAddressId(selectedShippingAddressId);
  };

  useEffect(() => {
    if (isMeetup && hasAddresses) {
      if (!selectedShippingAddressId) {
        const mainAddress = addresses.find(a => a.mainAddress);
        const defaultId = mainAddress ? mainAddress.id : addresses[0].id;
        setSelectedShippingAddressId(Number(defaultId));
        setSelectedBillingAddressId(Number(defaultId));
      } else if (selectedBillingAddressId !== selectedShippingAddressId) {
        setSelectedBillingAddressId(selectedShippingAddressId);
      }
    }
  }, [isMeetup, selectedShippingAddressId, selectedBillingAddressId, addresses, hasAddresses, setSelectedShippingAddressId, setSelectedBillingAddressId]);

  const canMeetup = Array.isArray(cartItems) && cartItems.length > 0 && cartItems.every(item => Boolean(item.listing?.allowMeetup));
  const sellerLocations = useMemo(() => {
    if (!Array.isArray(cartItems)) return [];
    const locations = cartItems
      .map(item => [item.listing?.city, item.listing?.district].filter(Boolean).join(' / '))
      .filter(Boolean);
    return Array.from(new Set(locations));
  }, [cartItems]);

  const hasMeetupLocation = !!meetupLocation?.trim();
  const isStepValid = selectedShippingAddressId && selectedBillingAddressId && (!isMeetup || hasMeetupLocation);

  let hint = null;
  if (!hasAddresses) hint = t('checkout_hint_add_address', 'Devam etmek için bir adres ekle.');
  else if (!selectedShippingAddressId) hint = t('checkout_hint_pick_address', 'Bir adres seç.');
  else if (!selectedBillingAddressId) hint = t('checkout_hint_pick_billing', 'Bir fatura adresi seç.');
  else if (isMeetup && !hasMeetupLocation) hint = t('checkout_hint_pick_meetup', 'Bir buluşma noktası seç.');

  const deliveryOptions = [
    {
      value: 'CARGO',
      title: t('checkout_cargo', 'Kargo ile gönderim'),
      body: t('checkout_cargo_desc', 'Ücretsiz, takip numaralı. Satıcı 72 saat içinde kargolar.'),
      disabled: false
    },
    {
      value: 'SAFE_MEETUP',
      title: t('checkout_meetup', 'Elden güvenli buluşma'),
      body: canMeetup
        ? [t('checkout_meetup_desc', 'Buluşmada ürünü inceleyip PIN kodu ile teslim alırsın.'), sellerLocations.length > 0 ? sellerLocations.join(', ') : null].filter(Boolean).join(' ')
        : t('checkout_meetup_unavailable', 'Sepetteki bazı ürünler elden teslimatı desteklemiyor.'),
      disabled: !canMeetup
    }
  ];

  const addAddressButton = (
    <Button variant="ghost" size="sm" onClick={() => setIsAddAddressModalOpen(true)}>
      <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      <span>{t('add_address', 'Yeni adres')}</span>
    </Button>
  );

  return (
    <div>
      <div className="divide-y divide-border-light">
        <Section title={t('delivery_method', 'Teslimat yöntemi')}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup">
            {deliveryOptions.map(option => {
              const selected = deliveryMethod === option.value;
              return (
                <label key={option.value} className={`flex items-start gap-3 rounded-md border p-4 transition-colors duration-150 ${optionClass(selected, option.disabled)}`}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value={option.value}
                    checked={selected}
                    disabled={option.disabled}
                    onChange={() => setDeliveryMethod(option.value)}
                    className="sr-only"
                  />
                  <RadioDot selected={selected} />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-text-primary">{option.title}</span>
                    <span className="mt-0.5 block text-sm text-text-secondary">{option.body}</span>
                  </span>
                </label>
              );
            })}
          </div>

          {isMeetup && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-text-tertiary">{t('checkout_meetup_point', 'Buluşma noktası')}</p>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_HUBS.map(hub => {
                  const selected = !customLocationActive && meetupLocation === hub;
                  return (
                    <button
                      key={hub}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setMeetupLocation(hub);
                        setCustomLocationActive(false);
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors duration-150 ${
                        selected ? 'border-primary bg-primary text-text-inverse' : 'border-border text-text-secondary hover:border-card-border-hover hover:text-text-primary'
                      }`}
                    >
                      {selected && <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />}
                      {hub}
                    </button>
                  );
                })}
                <button
                  type="button"
                  aria-pressed={customLocationActive}
                  onClick={() => {
                    setCustomLocationActive(true);
                    if (PREDEFINED_HUBS.includes(meetupLocation)) setMeetupLocation('');
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors duration-150 ${
                    customLocationActive ? 'border-primary bg-primary text-text-inverse' : 'border-border text-text-secondary hover:border-card-border-hover hover:text-text-primary'
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                  {t('checkout_other_location', 'Başka bir yer')}
                </button>
              </div>
              {customLocationActive && (
                <input
                  type="text"
                  value={meetupLocation || ''}
                  onChange={e => setMeetupLocation(e.target.value)}
                  className={`${inputNormal} mt-3`}
                  placeholder={t('checkout_meetup_placeholder', 'Örn: Levent Metro çıkışı')}
                  aria-label={t('checkout_meetup_point', 'Buluşma noktası')}
                  autoFocus
                />
              )}
            </div>
          )}
        </Section>

        <Section
          title={isMeetup ? t('billing_address', 'Fatura adresi') : t('shipping_address', 'Teslimat adresi')}
          action={hasAddresses ? addAddressButton : null}
        >
          {!hasAddresses ? (
            <div className="rounded-md border border-dashed border-border p-6 text-center">
              <p className="text-sm font-medium text-text-primary">{t('no_saved_addresses', 'Kayıtlı adresin yok')}</p>
              <p className="mt-1 text-sm text-text-secondary">{t('checkout_add_first_address', 'Siparişi tamamlamak için bir adres ekle.')}</p>
              <Button size="sm" className="mt-4" onClick={() => setIsAddAddressModalOpen(true)}>
                <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                <span>{t('add_address', 'Adres ekle')}</span>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2" role="radiogroup">
                {addresses.map(address => {
                  const selected = String(selectedShippingAddressId) === String(address.id);
                  return (
                    <label key={address.id} className={`flex items-start gap-3 rounded-md border p-4 transition-colors duration-150 ${optionClass(selected)}`}>
                      <input
                        type="radio"
                        name="shipping"
                        value={address.id}
                        checked={selected}
                        onChange={e => handleShippingChange(e.target.value)}
                        className="sr-only"
                      />
                      <RadioDot selected={selected} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-text-primary">{address.title || t('address', 'Adres')}</span>
                          {address.mainAddress && (
                            <span className="inline-flex shrink-0 items-center rounded border border-border px-1.5 py-0.5 text-[11px] font-medium text-text-secondary bg-background-secondary">
                              {t('default', 'Varsayılan')}
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-sm text-text-secondary">{address.addressLine}</span>
                        <span className="mt-0.5 block text-xs text-text-tertiary">
                          {[address.city, address.state].filter(Boolean).join(' / ')} {address.postalCode}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>

              {!isMeetup && (
                <div className="mt-4 space-y-3">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-text-primary">
                    <input
                      type="checkbox"
                      checked={billingSameAsShipping}
                      onChange={handleBillingToggle}
                      className="h-4 w-4 rounded-sm border-border text-primary focus:ring-border-focus"
                    />
                    {t('billing_same_as_shipping', 'Fatura adresi teslimat adresiyle aynı')}
                  </label>
                  {!billingSameAsShipping && (
                    <select
                      value={selectedBillingAddressId || ''}
                      onChange={e => setSelectedBillingAddressId(Number(e.target.value))}
                      className={`${inputNormal} sm:max-w-sm`}
                      aria-label={t('billing_address', 'Fatura adresi')}
                    >
                      <option value="">{t('choose_billing_address', 'Fatura adresi seç')}</option>
                      {addresses.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.title ? `${a.title}: ` : ''}{a.addressLine} ({a.city})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              {isMeetup && (
                <p className="mt-3 text-xs text-text-tertiary">
                  {t('checkout_meetup_billing_note', 'Elden teslimatta fatura bu adrese düzenlenir.')}
                </p>
              )}
            </>
          )}
        </Section>

        <section className="px-5 py-4 sm:px-6">
          {extrasOpen ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-text-tertiary">{t('order_name', 'Sipariş adı')}</span>
                <input
                  type="text"
                  className={inputNormal}
                  placeholder={t('e_g_birthday_gift', 'Örn: Doğum günü hediyesi')}
                  value={orderName || ''}
                  onChange={e => setOrderName(e.target.value)}
                  maxLength={100}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-text-tertiary">{t('notes', 'Teslimat notu')}</span>
                <input
                  type="text"
                  className={inputNormal}
                  placeholder={t('delivery_notes', 'Örn: Zile basmayın')}
                  value={notes || ''}
                  onChange={e => setNotes(e.target.value)}
                />
              </label>
            </div>
          ) : (
            <Button variant="ghost" size="sm" className="-ml-3" onClick={() => setExtrasOpen(true)}>
              <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              <span>{t('checkout_add_note', 'Sipariş adı veya not ekle')}</span>
            </Button>
          )}
        </section>
      </div>

      <CheckoutStepFooter onBack={onBack} backLabel={t('back_to_cart', 'Sepete dön')} hint={isStepValid ? null : hint}>
        <Button onClick={onNext} disabled={!isStepValid}>
          <span>{t('checkout_continue_payment', 'Ödemeye geç')}</span>
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        </Button>
      </CheckoutStepFooter>

      <AddressForm
        isOpen={isAddAddressModalOpen}
        onClose={() => setIsAddAddressModalOpen(false)}
        onSubmit={handleAddAddressSubmit}
        loading={addressMutating}
        error={addressError}
      />
    </div>
  );
};

export default memo(CheckoutAddressStep);
