export const EMAIL_TYPES = {
  VERIFICATION: 'VERIFICATION',
  VERIFICATION_CODE: 'VERIFICATION_CODE',
  PASSWORD_RESET: 'PASSWORD_RESET',
  WELCOME: 'WELCOME',
  PHONE_UPDATE: 'PHONE_UPDATE',
  NOTIFICATION: 'NOTIFICATION',
  OFFER_RECEIVED: 'OFFER_RECEIVED',
  OFFER_COUNTER_RECEIVED: 'OFFER_COUNTER_RECEIVED',
  OFFER_ACCEPTED: 'OFFER_ACCEPTED',
  OFFER_REJECTED: 'OFFER_REJECTED',
  OFFER_EXPIRED: 'OFFER_EXPIRED',
  OFFER_COMPLETED: 'OFFER_COMPLETED',
  PROMOTIONAL: 'PROMOTIONAL',
  PAYMENT_VERIFICATION: 'PAYMENT_VERIFICATION',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_RECEIPT: 'PAYMENT_RECEIPT',
  AGREEMENT_UPDATED: 'AGREEMENT_UPDATED',
  AGREEMENT_UPDATE: 'AGREEMENT_UPDATE',
  SYSTEM: 'SYSTEM',
  ORDER_CONFIRMATION: 'ORDER_CONFIRMATION',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  ORDER_COMPLETED: 'ORDER_COMPLETED',
  ORDER_REFUNDED: 'ORDER_REFUNDED',
  SALE_NOTIFICATION: 'SALE_NOTIFICATION',
  MEMBERSHIP_ACTIVATED: 'MEMBERSHIP_ACTIVATED',
  MEMBERSHIP_UPGRADE: 'MEMBERSHIP_UPGRADE',
  GREAT_SELLER: 'GREAT_SELLER',
  PRICE_CHANGE: 'PRICE_CHANGE',
  NEW_LISTING: 'NEW_LISTING',
  NEW_LISTING_NOTIFICATION: 'NEW_LISTING_NOTIFICATION',
  AUDIT_ALERT: 'AUDIT_ALERT'
};

export const EmailDto = (data) => ({
  id: data.id || null,
  recipientEmail: data.recipientEmail || '',
  senderEmail: data.senderEmail || '',
  subject: data.subject || '',
  content: data.content || '',
  emailType: data.emailType || EMAIL_TYPES.SYSTEM,
  sentAt: data.sentAt || null,
  createdAt: data.createdAt || null,
  isRead: data.isRead || false
});

export const EMAIL_TYPE_LABELS = {
  [EMAIL_TYPES.VERIFICATION]: 'Doğrulama Kodu',
  [EMAIL_TYPES.VERIFICATION_CODE]: 'Doğrulama Kodu',
  [EMAIL_TYPES.PASSWORD_RESET]: 'Şifre Sıfırlama',
  [EMAIL_TYPES.WELCOME]: 'Hoş Geldiniz',
  [EMAIL_TYPES.PHONE_UPDATE]: 'Telefon Güncelleme',
  [EMAIL_TYPES.NOTIFICATION]: 'Bildirim',
  [EMAIL_TYPES.OFFER_RECEIVED]: 'Yeni Teklif Geldi',
  [EMAIL_TYPES.OFFER_COUNTER_RECEIVED]: 'Karşı Teklif',
  [EMAIL_TYPES.OFFER_ACCEPTED]: 'Teklif Kabul Edildi',
  [EMAIL_TYPES.OFFER_REJECTED]: 'Teklif Reddedildi',
  [EMAIL_TYPES.OFFER_EXPIRED]: 'Teklif Zaman Aşımı',
  [EMAIL_TYPES.OFFER_COMPLETED]: 'Teklif Tamamlandı',
  [EMAIL_TYPES.PROMOTIONAL]: 'Kampanya / Tanıtım',
  [EMAIL_TYPES.PAYMENT_VERIFICATION]: 'Ödeme 2FA Onayı',
  [EMAIL_TYPES.PAYMENT_SUCCESS]: 'Ödeme Alındısı',
  [EMAIL_TYPES.PAYMENT_RECEIPT]: 'Ödeme Makbuzu',
  [EMAIL_TYPES.AGREEMENT_UPDATED]: 'Sözleşme Güncellemesi',
  [EMAIL_TYPES.AGREEMENT_UPDATE]: 'Sözleşme Güncellemesi',
  [EMAIL_TYPES.SYSTEM]: 'Sistem Bildirimi',
  [EMAIL_TYPES.ORDER_CONFIRMATION]: 'Sipariş Onayı',
  [EMAIL_TYPES.ORDER_CANCELLED]: 'Sipariş İptali',
  [EMAIL_TYPES.ORDER_COMPLETED]: 'Sipariş Tamamlandı',
  [EMAIL_TYPES.ORDER_REFUNDED]: 'Sipariş İadesi',
  [EMAIL_TYPES.SALE_NOTIFICATION]: 'Ürün Satıldı (Satıcı)',
  [EMAIL_TYPES.MEMBERSHIP_ACTIVATED]: 'Premium Üyelik',
  [EMAIL_TYPES.MEMBERSHIP_UPGRADE]: 'Premium Üyelik',
  [EMAIL_TYPES.GREAT_SELLER]: 'Great Seller Rozeti',
  [EMAIL_TYPES.PRICE_CHANGE]: 'Fiyat Düşüş Fırsatı',
  [EMAIL_TYPES.NEW_LISTING]: 'Yeni İlan Bildirimi',
  [EMAIL_TYPES.NEW_LISTING_NOTIFICATION]: 'Yeni İlan Bildirimi',
  [EMAIL_TYPES.AUDIT_ALERT]: 'Güvenlik Uyarısı'
};

export const EMAIL_TYPE_DOT_COLORS = {
  [EMAIL_TYPES.VERIFICATION]: 'bg-status-warning',
  [EMAIL_TYPES.VERIFICATION_CODE]: 'bg-status-warning',
  [EMAIL_TYPES.PASSWORD_RESET]: 'bg-status-error',
  [EMAIL_TYPES.WELCOME]: 'bg-status-success',
  [EMAIL_TYPES.PHONE_UPDATE]: 'bg-status-warning',
  [EMAIL_TYPES.NOTIFICATION]: 'bg-primary',
  [EMAIL_TYPES.OFFER_RECEIVED]: 'bg-primary',
  [EMAIL_TYPES.OFFER_COUNTER_RECEIVED]: 'bg-primary',
  [EMAIL_TYPES.OFFER_ACCEPTED]: 'bg-status-success',
  [EMAIL_TYPES.OFFER_REJECTED]: 'bg-status-error',
  [EMAIL_TYPES.OFFER_EXPIRED]: 'bg-text-muted',
  [EMAIL_TYPES.OFFER_COMPLETED]: 'bg-status-success',
  [EMAIL_TYPES.PROMOTIONAL]: 'bg-primary',
  [EMAIL_TYPES.PAYMENT_VERIFICATION]: 'bg-status-warning',
  [EMAIL_TYPES.PAYMENT_SUCCESS]: 'bg-status-success',
  [EMAIL_TYPES.PAYMENT_RECEIPT]: 'bg-status-success',
  [EMAIL_TYPES.AGREEMENT_UPDATED]: 'bg-text-muted',
  [EMAIL_TYPES.AGREEMENT_UPDATE]: 'bg-text-muted',
  [EMAIL_TYPES.SYSTEM]: 'bg-text-muted',
  [EMAIL_TYPES.ORDER_CONFIRMATION]: 'bg-status-success',
  [EMAIL_TYPES.ORDER_CANCELLED]: 'bg-status-error',
  [EMAIL_TYPES.ORDER_COMPLETED]: 'bg-status-success',
  [EMAIL_TYPES.ORDER_REFUNDED]: 'bg-status-warning',
  [EMAIL_TYPES.SALE_NOTIFICATION]: 'bg-status-success',
  [EMAIL_TYPES.MEMBERSHIP_ACTIVATED]: 'bg-primary',
  [EMAIL_TYPES.MEMBERSHIP_UPGRADE]: 'bg-primary',
  [EMAIL_TYPES.GREAT_SELLER]: 'bg-status-success',
  [EMAIL_TYPES.PRICE_CHANGE]: 'bg-primary',
  [EMAIL_TYPES.NEW_LISTING]: 'bg-primary',
  [EMAIL_TYPES.NEW_LISTING_NOTIFICATION]: 'bg-primary',
  [EMAIL_TYPES.AUDIT_ALERT]: 'bg-status-error'
};

export const EMAIL_TYPE_BADGE_COLORS = Object.fromEntries(
  Object.values(EMAIL_TYPES).map((type) => [
    type,
    'bg-background-secondary text-text-secondary border-border'
  ])
);

const EMOJI_STRIP_RE = /(?:[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]|\u{FE0F}|\u{200D})/gu;

export const stripEmailEmojis = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(EMOJI_STRIP_RE, '');
};

export const extractEmailPreview = (rawContent, subject = '') => {
  if (!rawContent || typeof rawContent !== 'string') return '';

  const htmlEndIdx = rawContent.toLowerCase().indexOf('</html>');
  const bounded = htmlEndIdx !== -1 ? rawContent.slice(0, htmlEndIdx + 7) : rawContent;

  const cleaned = bounded
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<div[^>]*style=["'][^"']*display\s*:\s*none[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, ' ')
    .replace(/<div[^>]*class=["'][^"']*(?:header|footer|brand-badge|brand-name)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&copy;|\u00A9/gi, '')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"');

  let text = stripEmailEmojis(cleaned).replace(/\s+/g, ' ').trim();

  if (subject) {
    const cleanSubj = stripEmailEmojis(String(subject)).trim();
    if (cleanSubj && text.toLowerCase().startsWith(cleanSubj.toLowerCase())) {
      text = text.slice(cleanSubj.length).trim();
    }
  }

  text = text
    .replace(/^Merhaba\s+[^,]{1,40},\s*/i, '')
    .replace(/\s*Saygılarımızla,?\s*SecondHand\s*Ekibi.*$/i, '')
    .replace(/\s*20\d{2}\s*SecondHand.*$/i, '')
    .trim();

  return text;
};

