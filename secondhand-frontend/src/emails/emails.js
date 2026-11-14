import { formatMonetaryAmountsInText } from '../common/formatters.js';

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
  AUDIT_ALERT: 'AUDIT_ALERT',
  COMPLAINT_SUBMITTED: 'COMPLAINT_SUBMITTED',
  COMPLAINT_RESOLVED: 'COMPLAINT_RESOLVED',
  COMPLAINT_DISMISSED: 'COMPLAINT_DISMISSED',
  MODERATION_WARNING: 'MODERATION_WARNING',
  MODERATION_LISTING_SUSPENDED: 'MODERATION_LISTING_SUSPENDED',
  MODERATION_TEMP_BAN: 'MODERATION_TEMP_BAN',
  MODERATION_PERM_BAN: 'MODERATION_PERM_BAN',
  MODERATION_APPEAL_OUTCOME: 'MODERATION_APPEAL_OUTCOME'
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
  [EMAIL_TYPES.AUDIT_ALERT]: 'Güvenlik Uyarısı',
  [EMAIL_TYPES.COMPLAINT_SUBMITTED]: 'Şikayet Alındı',
  [EMAIL_TYPES.COMPLAINT_RESOLVED]: 'Şikayet Sonuçlandı',
  [EMAIL_TYPES.COMPLAINT_DISMISSED]: 'Şikayet Kapatıldı',
  [EMAIL_TYPES.MODERATION_WARNING]: 'Topluluk İhtarı',
  [EMAIL_TYPES.MODERATION_LISTING_SUSPENDED]: 'İlan Askıya Alındı',
  [EMAIL_TYPES.MODERATION_TEMP_BAN]: 'Hesap Kısıtlaması',
  [EMAIL_TYPES.MODERATION_PERM_BAN]: 'Hesap Kapatıldı',
  [EMAIL_TYPES.MODERATION_APPEAL_OUTCOME]: 'İtiraz Sonucu'
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
  [EMAIL_TYPES.AUDIT_ALERT]: 'bg-status-error',
  [EMAIL_TYPES.COMPLAINT_SUBMITTED]: 'bg-text-muted',
  [EMAIL_TYPES.COMPLAINT_RESOLVED]: 'bg-status-success',
  [EMAIL_TYPES.COMPLAINT_DISMISSED]: 'bg-text-muted',
  [EMAIL_TYPES.MODERATION_WARNING]: 'bg-status-warning',
  [EMAIL_TYPES.MODERATION_LISTING_SUSPENDED]: 'bg-status-warning',
  [EMAIL_TYPES.MODERATION_TEMP_BAN]: 'bg-status-error',
  [EMAIL_TYPES.MODERATION_PERM_BAN]: 'bg-status-error',
  [EMAIL_TYPES.MODERATION_APPEAL_OUTCOME]: 'bg-primary'
};

const EMOJI_STRIP_RE = /(?:[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]|\u{FE0F}|\u{200D})/gu;

export const stripEmailEmojis = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(EMOJI_STRIP_RE, '');
};

export const decodeHtmlEntities = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&nbsp;/gi, ' ')
    .replace(/&copy;|\u00A9/gi, '')
    .replace(/&quot;/gi, '"')
    .replace(/&(?:apos|#39|#x27);/gi, "'")
    .replace(/&lsquo;|&rsquo;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '—')
    .replace(/&hellip;/gi, '…')
    .replace(/&bull;/gi, '•')
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCodePoint(parseInt(dec, 10));
      } catch {
        return '';
      }
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch {
        return '';
      }
    })
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&');
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
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>/gi, ' ')
    .replace(/<div[^>]*class=["'][^"']*(?:brand-badge|brand-name|crown-icon|benefit-icon)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, ' ')
    .replace(/<div[^>]*class=["'][^"']*(?:header|footer)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, ' ')
    .replace(/<p[^>]*class=["'][^"']*greeting[^"']*["'][^>]*>[\s\S]*?<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');

  const decoded = decodeHtmlEntities(cleaned);
  let text = stripEmailEmojis(decoded).replace(/\s+/g, ' ').trim();

  if (subject) {
    const cleanSubj = stripEmailEmojis(String(subject)).trim();
    if (cleanSubj && text.toLowerCase().startsWith(cleanSubj.toLowerCase())) {
      text = text.slice(cleanSubj.length).trim();
    }
  }

  text = text
    .replace(/^(?:Merhaba|Sayın|Sevgili)\s+[^,]{1,40},?\s*/i, '')
    .replace(/\s*Saygılarımızla,?\s*SecondHand\s*Ekibi.*$/i, '')
    .replace(/\s*20\d{2}\s*SecondHand.*$/i, '')
    .trim();

  return formatMonetaryAmountsInText(text);
};

const EDITORIAL_EMAIL_STYLE = `
<style id="sh-editorial-email-style">
  *, *::before, *::after {
    box-sizing: border-box;
  }
  html, body {
    margin: 0 !important;
    padding: 16px 20px !important;
    background-color: #FAF7F2 !important;
    color: #1C1917 !important;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
    font-variant-numeric: tabular-nums !important;
    -webkit-font-smoothing: antialiased !important;
  }
  .container {
    max-width: 680px !important;
    margin: 0 auto !important;
    padding: 0 !important;
    background-color: #FFFFFF !important;
    border: 1px solid #E8E2D8 !important;
    border-radius: 12px !important;
    overflow: hidden !important;
    box-shadow: 0 1px 3px rgba(28, 25, 23, 0.04) !important;
  }
  .header,
  .brand-badge,
  .crown-icon,
  .benefit-icon {
    display: none !important;
  }
  .content {
    padding: 20px 24px !important;
    color: #44403C !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
  }
  .content p,
  .greeting,
  .intro-text {
    margin: 0 0 12px 0 !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
    color: #44403C !important;
  }
  .greeting {
    font-size: 15px !important;
    font-weight: 600 !important;
    color: #1C1917 !important;
  }
  .details-box {
    background-color: #FAF7F2 !important;
    border: 1px solid #E8E2D8 !important;
    border-radius: 10px !important;
    padding: 14px 16px !important;
    margin: 12px 0 !important;
  }
  .details-box .details-table {
    width: 100% !important;
    background-color: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    margin: 4px 0 0 0 !important;
    box-shadow: none !important;
  }
  .details-box .details-table td {
    padding: 7px 0 !important;
    border-bottom: 1px solid #E8E2D8 !important;
    background-color: transparent !important;
  }
  .details-box .details-table tr:last-child td {
    border-bottom: none !important;
  }
  .signoff {
    margin-top: 16px !important;
    padding-top: 12px !important;
    border-top: 1px solid #F3EFE8 !important;
    font-size: 13px !important;
    color: #57534E !important;
  }
  .footer {
    background-color: #FAF7F2 !important;
    padding: 12px 24px !important;
    margin-top: 0 !important;
    text-align: left !important;
    font-size: 12px !important;
    color: #6B645C !important;
    border-top: 1px solid #E8E2D8 !important;
  }
  @media (max-width: 640px) {
    html, body {
      padding: 10px 8px !important;
    }
    .content, .footer {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
  }
</style>
`;

export const getProcessedContent = (content) => {
  if (!content) return '';
  const formatted = formatMonetaryAmountsInText(String(content));
  const htmlEndIdx = formatted.toLowerCase().indexOf('</html>');
  const bounded = htmlEndIdx !== -1 ? formatted.slice(0, htmlEndIdx + 7) : formatted;
  const cleaned = stripEmailEmojis(bounded);

  const isHtml = /<[a-z][\s\S]*>/i.test(cleaned);
  if (isHtml) {
    if (/<\/head>/i.test(cleaned)) {
      return cleaned.replace(/<\/head>/i, `<base target="_top">${EDITORIAL_EMAIL_STYLE}</head>`);
    }
    if (/<head>/i.test(cleaned)) {
      return cleaned.replace(/<head>/i, `<head><base target="_top">${EDITORIAL_EMAIL_STYLE}`);
    }
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><base target="_top">${EDITORIAL_EMAIL_STYLE}</head><body><div class="container"><div class="content">${cleaned}</div></div></body></html>`;
  }

  const escaped = cleaned
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><base target="_top">${EDITORIAL_EMAIL_STYLE}</head><body><div class="container"><div class="content" style="white-space: pre-wrap; word-wrap: break-word;">${escaped}</div></div></body></html>`;
};

