import { LISTING_TYPES, LISTING_STATUS } from '../../listing/types/index.js';

const TYPE_LABELS = {
  [LISTING_TYPES.VEHICLE]: 'Vehicle',
  [LISTING_TYPES.ELECTRONICS]: 'Electronics',
  [LISTING_TYPES.REAL_ESTATE]: 'Real Estate',
  [LISTING_TYPES.CLOTHING]: 'Clothing',
  [LISTING_TYPES.BOOKS]: 'Books',
  [LISTING_TYPES.SPORTS]: 'Sports',
};

const STATUS_LABELS = {
  [LISTING_STATUS.ACTIVE]: 'Active',
  [LISTING_STATUS.INACTIVE]: 'Inactive',
  [LISTING_STATUS.SOLD]: 'Sold',
  [LISTING_STATUS.PENDING]: 'Pending',
  [LISTING_STATUS.DRAFT]: 'Draft',
  RESERVED: 'Reserved',
};

export function listingTypeLabel(type) {
  if (!type) return null;
  return TYPE_LABELS[type] || type;
}

export function listingStatusLabel(status) {
  if (!status) return null;
  return STATUS_LABELS[status] || status;
}

/** Fiyat etiketi (görünüm + API metni için). */
export function formatListingPriceLabel(price, currency) {
  if (price == null || price === '') return null;
  const n = Number(price);
  if (Number.isNaN(n)) return `${price} ${currency || ''}`.trim();
  const cur = (currency || 'TRY').toUpperCase();
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cur === 'TRY' || cur === 'USD' || cur === 'EUR' ? cur : 'TRY',
      maximumFractionDigits: cur === 'TRY' ? 0 : 2,
    }).format(n);
  } catch {
    return `${n.toLocaleString('en-US')} ${cur}`;
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
      ? `${listing.storage} GB storage${listing.storageType ? ` (${listing.storageType})` : ''}`
      : null;
  const processor = listing.processor ? `Processor: ${listing.processor}` : null;
  const battery =
    listing.batteryHealthPercent != null ? `Battery health: %${listing.batteryHealthPercent}` : null;
  const screen = listing.screenSize != null ? `Screen: ${listing.screenSize}"` : null;
  const gpu = listing.gpuModel?.trim() ? `GPU: ${listing.gpuModel.trim()}` : null;
  const os = listing.operatingSystem?.trim() ? `Operating system: ${listing.operatingSystem.trim()}` : null;
  const year = listing.year != null ? `Model year: ${listing.year}` : null;
  return [
    brand || subtype ? `Device: ${[brand, subtype, modelName].filter(Boolean).join(' · ')}` : modelName ? `Model: ${modelName}` : null,
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
  const typeStr = listingTypeLabel(listing.type);
  const statusStr = listingStatusLabel(listing.status);
  const location = [listing.district, listing.city].filter(Boolean).join(', ');
  const rawDesc =
    listing.description && String(listing.description).trim()
      ? String(listing.description).trim().replace(/\s+/g, ' ')
      : null;
  const desc =
    rawDesc && rawDesc.length > 400 ? `${rawDesc.slice(0, 400)}…` : rawDesc;
  const lines = [
    'User is asking about this listing:',
    listing.title ? `Listing title: ${listing.title}` : null,
    typeStr ? `Category: ${typeStr}` : null,
    priceLine ? `Price: ${priceLine}` : null,
    location ? `Location: ${location}` : null,
    statusStr ? `Status: ${statusStr}` : null,
    listing.listingNo ? `Listing number: ${listing.listingNo}` : null,
    listing.id ? `ID: ${listing.id}` : null,
    ...electronicsContextLines(listing),
    desc ? `Description summary: ${desc}` : null,
  ];
  return lines.filter(Boolean).join('\n');
}
