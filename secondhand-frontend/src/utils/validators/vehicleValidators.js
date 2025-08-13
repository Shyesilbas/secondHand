export const validateVehicleStep1 = (formData) => {
  const errors = {};
  if (!formData.title || !String(formData.title).trim()) errors.title = 'Başlık gereklidir';
  if (!formData.description || !String(formData.description).trim()) errors.description = 'Açıklama gereklidir';
  if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'Geçerli bir fiyat giriniz';
  return errors;
};

export const validateVehicleStep2 = (formData, { isCreate = false } = {}) => {
  const errors = {};
  if (isCreate) {
    if (!formData.brand) errors.brand = 'Marka seçiniz';
    if (!formData.fuelType) errors.fuelType = 'Yakıt türü seçiniz';
  }
  if (!formData.model || !String(formData.model).trim()) errors.model = 'Model giriniz';
  if (formData.year && parseInt(formData.year) < 1950) errors.year = 'Geçerli bir yıl giriniz';
  return errors;
};

export const validateVehicleStep3 = (formData) => {
  const errors = {};
  if (!formData.city || !String(formData.city).trim()) errors.city = 'Şehir gereklidir';
  if (!formData.district || !String(formData.district).trim()) errors.district = 'İlçe gereklidir';
  return errors;
};

export const validateVehicleAll = (formData) => {
  return {
    ...validateVehicleStep1(formData),
    ...validateVehicleStep2(formData, { isCreate: true }),
    ...validateVehicleStep3(formData),
  };
};

