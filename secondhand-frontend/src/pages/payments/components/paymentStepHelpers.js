export const STEP = {
  REVIEW: 'REVIEW',
  VERIFY: 'VERIFY'
};

export const getStepTitle = (step) => step === STEP.REVIEW ? 'Ödeme Onayı' : 'Doğrulama';

export const getPrimaryButton = ({ step, isProcessing, isPaymentReady, isCodeValid }) => {
  if (step === STEP.REVIEW) {
    return {
      label: isProcessing ? 'İşleniyor...' : 'Ödemeyi Başlat',
      disabled: !isPaymentReady || isProcessing,
      variant: 'primary'
    };
  }
  return {
    label: isProcessing ? 'Doğrulanıyor...' : 'Doğrula ve Öde',
    disabled: isProcessing || !isCodeValid,
    variant: 'success'
  };
};

export const isPaymentMethodAvailable = (paymentType, paymentMethods, isLoading) => {
  if (isLoading) return false;
  if (paymentType === 'CREDIT_CARD') return (paymentMethods?.creditCards?.length || 0) > 0;
  if (paymentType === 'TRANSFER') return (paymentMethods?.bankAccounts?.length || 0) > 0;
  return false;
};


