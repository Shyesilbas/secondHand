
export const formatPhoneNumber = (value, allowPlus = true) => {
  let cleaned = value.replace(/[^\d+]/g, '');
  
  if (cleaned.includes('+') && !cleaned.startsWith('+')) {
    cleaned = cleaned.replace(/\+/g, '');
  }
  
  if (!allowPlus && cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  if (cleaned.startsWith('+')) {
    const digits = cleaned.substring(1);
    cleaned = '+' + digits.substring(0, 15);
  } else {
    cleaned = cleaned.substring(0, 15);
  }
  
  return cleaned;
};

export const validatePhoneNumber = (phone) => {
  if (!phone || !phone.trim()) {
    return { valid: false, error: 'Phone number is required' };
  }
  
  const phonePattern = /^\+?[0-9]\d{1,14}$/;
  
  if (!phonePattern.test(phone)) {
    return { valid: false, error: 'Please enter a valid phone number' };
  }
  
  return { valid: true };
};


export const formatPhoneForDisplay = (phone) => {
  if (!phone) return '';
  
  const digits = phone.replace(/^\+/, '');
  
  if (digits.length === 11 && digits.startsWith('0')) {
    return `${digits.substring(0, 4)} ${digits.substring(4, 7)} ${digits.substring(7, 9)} ${digits.substring(9)}`;
  }
  
  if (digits.length > 6) {
    return digits.replace(/(\d{3})(?=\d)/g, '$1 ');
  }
  
  return phone;
};
