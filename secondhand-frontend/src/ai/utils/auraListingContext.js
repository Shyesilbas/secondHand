import { LISTING_TYPES, LISTING_STATUS } from '../../listing/types/index.js';
import { formatPrice, parsePrice } from '../../common/formatters.js';

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
  const n = typeof price === 'string' ? parsePrice(price) : Number(price);
  if (n == null || Number.isNaN(n)) return `${price} ${currency || ''}`.trim();
  const cur = (currency || 'TRY').toUpperCase();
  return `${formatPrice(n)} ${cur}`;
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
  const processor = listing.chipset || listing.processor ? `Processor: ${listing.chipset || listing.processor}` : null;
  const battery =
    listing.attributes?.batteryHealthPercent != null ? `Battery health: %${listing.attributes.batteryHealthPercent}` : null;
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

function vehicleContextLines(listing) {
  if (listing.type !== LISTING_TYPES.VEHICLE) return [];
  const vType = lookupLabel(listing.vehicleType);
  const brand = lookupLabel(listing.brand);
  const modelName = listing.model?.name?.trim() || null;
  const gen = lookupLabel(listing.generation);
  const engine = lookupLabel(listing.engine);
  const trim = lookupLabel(listing.trim);
  const year = listing.year != null ? `Model year: ${listing.year}` : null;
  const mileage = listing.mileage != null ? `Mileage: ${listing.mileage} km` : null;
  const fuel = listing.fuelType ? `Fuel: ${listing.fuelType}` : null;
  const gearbox = listing.gearbox ? `Gearbox: ${listing.gearbox}` : null;
  const hp = listing.horsePower != null ? `Horsepower: ${listing.horsePower} HP` : null;
  const cc = listing.engineCapacity != null ? `Engine capacity: ${listing.engineCapacity} cc` : null;
  const accident =
    listing.accidentHistory != null
      ? `Accident history: ${listing.accidentHistory ? 'Yes' : 'No'}${listing.accidentDetails ? ` (${listing.accidentDetails})` : ''}`
      : null;
  return [
    [vType, brand, modelName, gen, engine, trim].filter(Boolean).length
      ? `Vehicle: ${[vType, brand, modelName, gen, engine, trim].filter(Boolean).join(' · ')}`
      : null,
    year,
    mileage,
    fuel,
    gearbox,
    hp,
    cc,
    accident,
  ].filter(Boolean);
}

function realEstateContextLines(listing) {
  if (listing.type !== LISTING_TYPES.REAL_ESTATE) return [];
  const adType = lookupLabel(listing.adType);
  const reType = lookupLabel(listing.realEstateType);
  const heating = lookupLabel(listing.heatingType);
  const area =
    listing.grossAreaM2 != null || listing.netAreaM2 != null
      ? `Area: gross ${listing.grossAreaM2 ?? '-'} m², net ${listing.netAreaM2 ?? '-'} m²`
      : null;
  const rooms =
    listing.roomConfigKey || listing.roomCount != null
      ? `Rooms: ${listing.roomConfigKey || listing.roomCount}`
      : null;
  const floor =
    listing.floorKey || listing.floorNumber != null
      ? `Floor: ${listing.floorKey || listing.floorNumber}${listing.totalFloors != null ? ` / ${listing.totalFloors}` : ''}`
      : null;
  const age = listing.buildingAge != null ? `Building age: ${listing.buildingAge}` : null;
  return [
    [adType, reType].filter(Boolean).length ? `Property: ${[adType, reType].filter(Boolean).join(' · ')}` : null,
    area,
    rooms,
    floor,
    age,
    heating ? `Heating: ${heating}` : null,
  ].filter(Boolean);
}

function clothingContextLines(listing) {
  if (listing.type !== LISTING_TYPES.CLOTHING) return [];
  const brand = lookupLabel(listing.brand);
  const cType = lookupLabel(listing.clothingType);
  const size = listing.sizeSystem !== 'ONE_SIZE' ? listing.sizeLabel : null;
  const cond = listing.condition ? `Condition: ${listing.condition}` : null;
  const audience = listing.audience ? `For: ${listing.audience}` : null;
  return [
    [brand, cType].filter(Boolean).length ? `Item: ${[brand, cType].filter(Boolean).join(' · ')}` : null,
    size ? `Size: ${size}` : null,
    cond,
    audience,
    listing.fabricType ? `Fabric: ${listing.fabricType}` : null,
  ].filter(Boolean);
}

function booksContextLines(listing) {
  if (listing.type !== LISTING_TYPES.BOOKS) return [];
  const bType = lookupLabel(listing.bookType);
  const genre = lookupLabel(listing.genre);
  const lang = lookupLabel(listing.language);
  const format = lookupLabel(listing.format);
  const cond = lookupLabel(listing.condition);
  return [
    listing.author ? `Author: ${listing.author}` : null,
    [bType, genre].filter(Boolean).length ? `Genre: ${[bType, genre].filter(Boolean).join(' · ')}` : null,
    lang ? `Language: ${lang}` : null,
    format ? `Format: ${format}` : null,
    cond ? `Condition: ${cond}` : null,
    listing.publicationYear != null ? `Publication year: ${listing.publicationYear}` : null,
    listing.pageCount != null ? `Pages: ${listing.pageCount}` : null,
  ].filter(Boolean);
}

function sportsContextLines(listing) {
  if (listing.type !== LISTING_TYPES.SPORTS) return [];
  const discipline = lookupLabel(listing.discipline);
  const equip = lookupLabel(listing.equipmentType);
  const cond = lookupLabel(listing.condition);
  return [
    [discipline, equip].filter(Boolean).length ? `Equipment: ${[discipline, equip].filter(Boolean).join(' · ')}` : null,
    cond ? `Condition: ${cond}` : null,
  ].filter(Boolean);
}

export function buildAuraListingSessionContext(listing) {
  if (!listing) return null;
  const effectivePrice = listing.campaignPrice ?? listing.price;
  const priceLine = formatListingPriceLabel(effectivePrice, listing.currency);
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
    ...vehicleContextLines(listing),
    ...realEstateContextLines(listing),
    ...clothingContextLines(listing),
    ...booksContextLines(listing),
    ...sportsContextLines(listing),
    desc ? `Description summary: ${desc}` : null,
  ];
  return lines.filter(Boolean).join('\n');
}
