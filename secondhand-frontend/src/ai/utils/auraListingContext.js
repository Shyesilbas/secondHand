import { LISTING_TYPES, LISTING_STATUS } from '../../listing/types/index.js';

const TYPE_TR = {
  [LISTING_TYPES.VEHICLE]: 'Araç',
  [LISTING_TYPES.ELECTRONICS]: 'Elektronik',
  [LISTING_TYPES.REAL_ESTATE]: 'Gayrimenkul',
  [LISTING_TYPES.CLOTHING]: 'Giyim',
  [LISTING_TYPES.BOOKS]: 'Kitap',
  [LISTING_TYPES.SPORTS]: 'Spor',
};

const STATUS_TR = {
  [LISTING_STATUS.ACTIVE]: 'Yayında',
  [LISTING_STATUS.INACTIVE]: 'Pasif',
  [LISTING_STATUS.SOLD]: 'Satıldı',
  [LISTING_STATUS.PENDING]: 'Beklemede',
  [LISTING_STATUS.DRAFT]: 'Taslak',
  RESERVED: 'Rezerve',
};

export function listingTypeLabelTr(type) {
  if (!type) return null;
  return TYPE_TR[type] || type;
}

export function listingStatusLabelTr(status) {
  if (!status) return null;
  return STATUS_TR[status] || status;
}

/** Fiyat etiketi (görünüm + API metni için). */
export function formatListingPriceLabel(price, currency) {
  if (price == null || price === '') return null;
  const n = Number(price);
  if (Number.isNaN(n)) return `${price} ${currency || ''}`.trim();
  const cur = (currency || 'TRY').toUpperCase();
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: cur === 'TRY' || cur === 'USD' || cur === 'EUR' ? cur : 'TRY',
      maximumFractionDigits: cur === 'TRY' ? 0 : 2,
    }).format(n);
  } catch {
    return `${n.toLocaleString('tr-TR')} ${cur}`;
  }
}

/**
 * LLM için okunaklı Türkçe oturum metni (tek blok, pipe yok).
 */
function lookupLabel(dto) {
  if (!dto) return null;
  const l = dto.label ?? dto.name;
  return l && String(l).trim() ? String(l).trim() : null;
}

/** Elektronik ilan teknik satırları (LLM bağlamı). */
function electronicsContextLines(listing) {
  if (listing.type !== LISTING_TYPES.ELECTRONICS) return [];
  const brand = lookupLabel(listing.electronicBrand);
  const subtype = lookupLabel(listing.electronicType);
  const modelName = listing.model?.name?.trim() || null;
  const ram = listing.ram != null ? `${listing.ram} GB RAM` : null;
  const storage =
    listing.storage != null
      ? `${listing.storage} GB depolama${listing.storageType ? ` (${listing.storageType})` : ''}`
      : null;
  const processor = listing.processor ? `İşlemci: ${listing.processor}` : null;
  const battery =
    listing.batteryHealthPercent != null ? `Pil sağlığı: %${listing.batteryHealthPercent}` : null;
  const screen = listing.screenSize != null ? `Ekran: ${listing.screenSize}"` : null;
  const gpu = listing.gpuModel?.trim() ? `GPU: ${listing.gpuModel.trim()}` : null;
  const os = listing.operatingSystem?.trim() ? `İşletim sistemi: ${listing.operatingSystem.trim()}` : null;
  const year = listing.year != null ? `Model yılı: ${listing.year}` : null;
  return [
    brand || subtype ? `Cihaz: ${[brand, subtype, modelName].filter(Boolean).join(' · ')}` : modelName ? `Model: ${modelName}` : null,
    ram,
    storage,
    processor,
    battery,
    screen,
    gpu,
    os,
    year,
  ].filter(Boolean);
}

export function buildAuraListingSessionContext(listing) {
  if (!listing) return null;
  const priceLine = formatListingPriceLabel(listing.price, listing.currency);
  const typeTr = listingTypeLabelTr(listing.type);
  const statusTr = listingStatusLabelTr(listing.status);
  const location = [listing.district, listing.city].filter(Boolean).join(', ');
  const rawDesc =
    listing.description && String(listing.description).trim()
      ? String(listing.description).trim().replace(/\s+/g, ' ')
      : null;
  const desc =
    rawDesc && rawDesc.length > 400 ? `${rawDesc.slice(0, 400)}…` : rawDesc;
  const lines = [
    'Kullanıcı şu ilanla ilgili soru soruyor:',
    listing.title ? `İlan başlığı: ${listing.title}` : null,
    typeTr ? `Kategori: ${typeTr}` : null,
    priceLine ? `Fiyat: ${priceLine}` : null,
    location ? `Konum: ${location}` : null,
    statusTr ? `İlan durumu: ${statusTr}` : null,
    listing.listingNo ? `İlan numarası: ${listing.listingNo}` : null,
    listing.id ? `Teknik id: ${listing.id}` : null,
    ...electronicsContextLines(listing),
    desc ? `Açıklama özeti: ${desc}` : null,
  ];
  return lines.filter(Boolean).join('\n');
}
