
export const AGREEMENT_TYPES = {
  TERMS_OF_SERVICE: 'TERMS_OF_SERVICE',
  PRIVACY_POLICY: 'PRIVACY_POLICY',
  KVKK: 'KVKK',
  DISTANCE_SELLING: 'DISTANCE_SELLING',
  PAYMENT_TERMS: 'PAYMENT_TERMS',
};

export const AGREEMENT_TYPE_LABELS = {
  [AGREEMENT_TYPES.TERMS_OF_SERVICE]: 'Kullanım Koşulları',
  [AGREEMENT_TYPES.PRIVACY_POLICY]: 'Gizlilik Politikası',
  [AGREEMENT_TYPES.KVKK]: 'KVKK Aydınlatma Metni',
  [AGREEMENT_TYPES.DISTANCE_SELLING]: 'Mesafeli Satış Sözleşmesi',
  [AGREEMENT_TYPES.PAYMENT_TERMS]: 'Ödeme Koşulları',
};

// Localized agreement name: `agreement_<type>` from the locale files, Turkish label as fallback.
export const agreementLabel = (t, type) =>
  t(`agreement_${String(type).toLowerCase()}`, AGREEMENT_TYPE_LABELS[type] || String(type));


