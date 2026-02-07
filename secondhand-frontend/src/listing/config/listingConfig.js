
import { LISTING_TYPES } from '../types/index.js';

import GenericListingDetails from '../components/details/GenericListingDetails.jsx';

import VehicleCreateForm from '../../vehicle/components/VehicleCreateForm.jsx';
import ElectronicCreateForm from '../../electronics/electronics/components/ElectronicCreateForm.jsx';
import RealEstateCreateForm from '../../realEstate/components/RealEstateCreateForm.jsx';
import ClothingCreateForm from '../../clothing/components/ClothingCreateForm.jsx';
import BooksCreateForm from '../../books/components/BooksCreateForm.jsx';
import SportsCreateForm from '../../sports/components/SportsCreateForm.jsx';

import { vehicleService } from '../../vehicle/services/vehicleService.js';
import { electronicService } from '../../electronics/electronics/services/electronicService.js';
import { realEstateService } from '../../realEstate/services/realEstateService.js';
import { clothingService } from '../../clothing/services/clothingService.js';
import { booksService } from '../../books/services/booksService.js';
import { sportsService } from '../../sports/services/sportsService.js';

import { VehicleCreateRequestDTO } from '../../vehicle/vehicles.js';
import { ElectronicCreateRequestDTO } from '../../electronics/electronics.js';
import { RealEstateCreateRequestDTO } from '../../realEstate/realEstates.js';

import { filterConfigs } from '../components/filters/filterConfigs.js';
import FilterRenderer from '../components/filters/FilterRenderer.jsx';

export const listingTypeConfig = {
  [LISTING_TYPES.VEHICLE]: {
    label: 'Vehicle',
    icon: '🚗',
    description: 'Cars, motorcycles, bicycles and other vehicles',
    
    detailsComponent: GenericListingDetails,
    detailsSchema: {
      title: 'Vehicle Information',
      sections: [
        {
          id: 'basic',
          label: 'Basic',
          title: 'Basic',
          fields: [
            { label: 'Brand', key: 'brand', enumKey: 'carBrands' },
            { label: 'Model', key: 'model' },
            { label: 'Year', key: 'year' },
            { label: 'Color', key: 'color', enumKey: 'colors' },
          ],
        },
        {
          id: 'mechanical',
          label: 'Mechanical',
          title: 'Mechanical',
          fields: [
            { label: 'Gear Type', key: 'gearbox', enumKey: 'gearTypes' },
            { label: 'Fuel Type', key: 'fuelType', enumKey: 'fuelTypes' },
            { label: 'Horse Power', key: 'horsePower', format: (_listing, v) => (v ? `${v} HP` : null) },
            { label: 'Engine Capacity', key: 'engineCapacity', format: (_listing, v) => (v ? `${v} cc` : null) },
            { label: 'Drivetrain', key: 'drivetrain', enumKey: 'drivetrains' },
            { label: 'Body Type', key: 'bodyType', enumKey: 'bodyTypes' },
            { label: 'Door', key: 'doors', enumKey: 'doors' },
            { label: 'Seat Count', key: 'seatCount', enumKey: 'seatCounts' },
          ],
        },
        {
          id: 'usage',
          label: 'Usage',
          title: 'Usage',
          fields: [
            {
              label: 'Kilometer',
              key: 'mileage',
              format: (_listing, v) => (v ? `${Number(v).toLocaleString('tr-TR')} km` : null),
            },
            { label: 'Fuel Consumption', key: 'fuelConsumption', format: (_listing, v) => (v ? `${v} L/100km` : null) },
            { label: 'Kilometers/Liter', key: 'kilometersPerLiter', format: (_listing, v) => (v ? `${v} km/L` : null) },
            { label: 'Wheels', key: 'wheels', format: (_listing, v) => (v ? `${v}"` : null) },
          ],
        },
        {
          id: 'history',
          label: 'History',
          title: 'History',
          fields: [
            {
              label: 'Accident History',
              key: 'accidentHistory',
              format: (_listing, v) => (v === true ? 'Yes' : v === false ? 'No' : null),
            },
            { label: 'Accident Details', key: 'accidentDetails' },
            { label: 'Inspection Valid Until', key: 'inspectionValidUntil' },
          ],
        },
        {
          id: 'extras',
          label: 'Extras',
          title: 'Extras',
          fields: [{ label: 'Open To Swap', key: 'swap', format: (_listing, v) => (v ? 'Yes' : 'No') }],
        },
      ],
    },
    createComponent: VehicleCreateForm,
    formSchema: {
      initialData: {
        ...VehicleCreateRequestDTO,
        title: '',
        description: '',
        price: '',
        year: '',
        mileage: '',
        engineCapacity: '',
        wheels: '',
        fuelCapacity: '',
        fuelConsumption: '',
        horsePower: '',
        kilometersPerLiter: '',
      },
      steps: [
        {
          id: 1,
          title: 'Basic Information',
          description: 'Set the title, description and price of your listing',
          kind: 'basics',
          showQuantity: false,
        },
        {
          id: 2,
          title: 'Vehicle Specifications',
          description: 'Specify the technical details of your vehicle',
          kind: 'details',
          sections: [
            {
              id: 'vehicle-basic',
              title: 'Temel Bilgiler',
              description: 'Araç markası, model ve temel özellikler',
              fields: [
                {
                  name: 'vehicleTypeId',
                  label: 'Araç Tipi',
                  type: 'enum',
                  enumKey: 'vehicleTypes',
                  required: true,
                  onChange: ({ value, ctx }) => {
                    ctx.setValue('vehicleTypeId', value);
                    ctx.setValue('brandId', '');
                    ctx.setValue('vehicleModelId', '');
                  },
                },
                {
                  name: 'brandId',
                  label: 'Marka',
                  type: 'enum',
                  enumKey: 'carBrands',
                  required: true,
                  getOptions: (ctx) => {
                    const allBrands = ctx.enums?.carBrands || [];
                    const typeId = ctx.formData?.vehicleTypeId;
                    if (!typeId) return allBrands;
                    const models = ctx.enums?.vehicleModels || [];
                    const ids = new Set(
                      models
                        .filter((m) => String(m?.typeId ?? m?.type_id ?? '') === String(typeId))
                        .map((m) => m?.brandId ?? m?.brand_id)
                        .filter(Boolean)
                        .map((x) => String(x))
                    );
                    if (ids.size === 0) return allBrands;
                    const filtered = allBrands.filter((b) => ids.has(String(b?.id ?? b?.value ?? '')));
                    return filtered.length > 0 ? filtered : allBrands;
                  },
                  onChange: ({ value, ctx }) => {
                    ctx.setValue('brandId', value);
                    ctx.setValue('vehicleModelId', '');
                  },
                },
                {
                  name: 'vehicleModelId',
                  label: 'Model',
                  type: 'searchable',
                  required: true,
                  disabledWhen: (ctx) => !ctx.formData?.vehicleTypeId || !ctx.formData?.brandId,
                  getOptions: (ctx) => {
                    const typeId = ctx.formData?.vehicleTypeId;
                    const brandId = ctx.formData?.brandId;
                    const models = ctx.enums?.vehicleModels || [];
                    return models
                      .filter((m) => {
                        const b = m?.brandId ?? m?.brand_id;
                        const t = m?.typeId ?? m?.type_id;
                        if (typeId && String(t) !== String(typeId)) return false;
                        if (brandId && String(b) !== String(brandId)) return false;
                        return true;
                      })
                      .map((m) => ({ id: String(m?.id ?? ''), label: String(m?.name ?? '') }))
                      .filter((o) => o.id && o.label);
                  },
                  onChange: ({ value, ctx }) => {
                    ctx.setValue('vehicleModelId', value);
                    const m = (ctx.enums?.vehicleModels || []).find((x) => String(x?.id ?? '') === String(value || ''));
                    if (m) {
                      const modelBrandId = String(m?.brandId ?? m?.brand_id ?? '');
                      const modelTypeId = String(m?.typeId ?? m?.type_id ?? '');
                      if (modelBrandId) ctx.setValue('_modelBrandId', modelBrandId);
                      if (modelTypeId) ctx.setValue('_modelTypeId', modelTypeId);
                      if (modelBrandId && String(ctx.formData?.brandId ?? '') !== modelBrandId) ctx.setValue('brandId', modelBrandId);
                      if (modelTypeId && String(ctx.formData?.vehicleTypeId ?? '') !== modelTypeId) ctx.setValue('vehicleTypeId', modelTypeId);
                    }
                  },
                },
                {
                  name: 'year',
                  label: 'Yıl',
                  type: 'number',
                  required: true,
                  min: 1950,
                  max: new Date().getFullYear() + 1,
                },
                {
                  name: 'fuelType',
                  label: 'Yakıt Tipi',
                  type: 'enum',
                  enumKey: 'fuelTypes',
                  required: true,
                  visibleWhen: (ctx) => ['CAR', 'MOTORCYCLE', 'SCOOTER', 'TRUCK', 'VAN', 'OTHER'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()),
                },
                {
                  name: 'color',
                  label: 'Renk',
                  type: 'enum',
                  enumKey: 'colors',
                },
                {
                  name: 'doors',
                  label: 'Kapı Sayısı',
                  type: 'enum',
                  enumKey: 'doors',
                  visibleWhen: (ctx) => ['CAR', 'TRUCK', 'VAN'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()),
                },
                {
                  name: 'gearbox',
                  label: 'Vites',
                  type: 'enum',
                  enumKey: 'gearTypes',
                  required: true,
                  visibleWhen: (ctx) => String(ctx.formData?._vehicleTypeName || '').toUpperCase() === 'CAR',
                },
                {
                  name: 'seatCount',
                  label: 'Koltuk Sayısı',
                  type: 'enum',
                  enumKey: 'seatCounts',
                  visibleWhen: (ctx) => ['CAR', 'TRUCK', 'VAN'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()),
                },
                {
                  name: 'drivetrain',
                  label: 'Çekiş',
                  type: 'enum',
                  enumKey: 'drivetrains',
                  visibleWhen: (ctx) => String(ctx.formData?._vehicleTypeName || '').toUpperCase() === 'CAR',
                },
                {
                  name: 'bodyType',
                  label: 'Kasa Tipi',
                  type: 'enum',
                  enumKey: 'bodyTypes',
                  required: true,
                  visibleWhen: (ctx) => String(ctx.formData?._vehicleTypeName || '').toUpperCase() === 'CAR',
                },
              ],
            },
            {
              id: 'vehicle-tech',
              title: 'Teknik Özellikler',
              description: 'Motor, performans ve diğer teknik detaylar',
              fields: [
                {
                  name: 'mileage',
                  label: 'Kilometre (km)',
                  type: 'number',
                  visibleWhen: (ctx) => ['CAR', 'MOTORCYCLE', 'SCOOTER', 'TRUCK', 'VAN', 'OTHER'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()),
                },
                {
                  name: 'engineCapacity',
                  label: 'Motor Hacmi (cc)',
                  type: 'number',
                  requiredWhen: (ctx) => ['MOTORCYCLE', 'SCOOTER'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()),
                  visibleWhen: (ctx) => ['CAR', 'MOTORCYCLE', 'SCOOTER', 'TRUCK', 'VAN', 'OTHER'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()),
                },
                {
                  name: 'horsePower',
                  label: 'Beygir Gücü',
                  type: 'number',
                  visibleWhen: (ctx) => ['CAR', 'TRUCK', 'VAN', 'OTHER'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()),
                },
                {
                  name: 'wheels',
                  label: 'Jant Boyutu (inch)',
                  type: 'number',
                },
                {
                  name: 'fuelCapacity',
                  label: 'Yakıt Kapasitesi (L)',
                  type: 'number',
                  visibleWhen: (ctx) => ['CAR', 'TRUCK', 'VAN', 'OTHER'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()),
                },
                {
                  name: 'fuelConsumption',
                  label: 'Yakıt Tüketimi (L/100km)',
                  type: 'number',
                  visibleWhen: (ctx) => ['CAR', 'TRUCK', 'VAN', 'OTHER'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()),
                },
                {
                  name: 'inspectionValidUntil',
                  label: 'Muayene Geçerlilik Tarihi',
                  type: 'date',
                  visibleWhen: (ctx) => ['CAR', 'TRUCK', 'VAN', 'OTHER'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()),
                },
              ],
            },
            {
              id: 'vehicle-extras',
              title: 'Ek Bilgiler',
              description: 'Kaza geçmişi ve takas durumu',
              fields: [
                {
                  name: 'accidentHistory',
                  label: 'Bu aracın kaza geçmişi var',
                  type: 'toggle',
                },
                {
                  name: 'accidentDetails',
                  label: 'Kaza Detayları',
                  type: 'textarea',
                  rows: 3,
                  placeholder: 'Kaza veya hasar detaylarını açıklayın...',
                  fullWidth: true,
                  visibleWhen: (ctx) => Boolean(ctx.formData?.accidentHistory),
                },
                {
                  name: 'swap',
                  label: 'Takasa Açık',
                  description: 'Takas yapmaya istekliyseniz işaretleyin',
                  type: 'toggle',
                },
              ],
            },
          ],
        },
        {
          id: 3,
          title: 'Location',
          description: 'Set the location of your item',
          kind: 'mediaLocation',
        },
      ],
      derivedFields: [
        { sourceField: 'vehicleTypeId', enumKey: 'vehicleTypes', targetField: '_vehicleTypeName', uppercase: true },
      ],
      effects: [
        (ctx) => {
          const mId = ctx.formData?.vehicleModelId;
          if (!mId) return;
          const m = (ctx.enums?.vehicleModels || []).find((x) => String(x?.id ?? '') === String(mId));
          if (!m) return;
          const modelBrandId = String(m?.brandId ?? m?.brand_id ?? '');
          const modelTypeId = String(m?.typeId ?? m?.type_id ?? '');
          if (modelBrandId && String(ctx.formData?._modelBrandId ?? '') !== modelBrandId) ctx.setValue('_modelBrandId', modelBrandId);
          if (modelTypeId && String(ctx.formData?._modelTypeId ?? '') !== modelTypeId) ctx.setValue('_modelTypeId', modelTypeId);
        },
      ],
      customValidators: [
        {
          when: ({ stepId }) => Number(stepId) === 2 || stepId === 'all',
          validate: ({ ctx }) => {
            const errors = {};
            const modelId = ctx.formData?.vehicleModelId;
            const typeId = ctx.formData?.vehicleTypeId;
            const brandId = ctx.formData?.brandId;
            const modelTypeId = ctx.formData?._modelTypeId;
            const modelBrandId = ctx.formData?._modelBrandId;

            if (modelId && typeId && modelTypeId && String(modelTypeId) !== String(typeId)) {
              errors.vehicleModelId = 'Selected model does not belong to selected vehicle type';
            }
            if (modelId && brandId && modelBrandId && String(modelBrandId) !== String(brandId)) {
              errors.vehicleModelId = 'Selected model does not belong to selected brand';
            }
            return errors;
          },
        },
      ],
      getTitle: ({ isEdit }) => (isEdit ? 'Edit Vehicle Listing' : 'Create Vehicle Listing'),
      getSubtitle: ({ isEdit }) => (isEdit ? 'Update your vehicle listing details' : 'Create your vehicle listing step by step'),
      normalizeInitialData: (data) => {
        if (!data) return null;
        return {
          ...data,
          brandId: data?.brandId || data?.brand?.id || '',
          vehicleModelId: data?.vehicleModelId || data?.model?.id || '',
          vehicleTypeId: data?.vehicleTypeId || data?.vehicleType?.id || '',
        };
      },
    },
    service: {
      getById: (id) => vehicleService.getVehicleById(id),
      update: (id, payload) => vehicleService.updateVehicleListing(id, payload),
    },
    createFlow: {
      subtypeSelector: {
        enumKey: 'vehicleTypes',
        queryParamKey: 'vehicleTypeId',
        initialDataKey: 'vehicleTypeId',
        title: 'Choose vehicle type',
        description: 'Select a type to tailor the form fields.',
        paramKey: 'vehicleTypeIds',
      },
      preFormSelectors: [
        {
          enumKey: 'carBrands',
          initialDataKey: 'brandId',
          title: 'Choose brand',
          description: 'Select a brand to narrow model options.',
          kind: 'searchable',
          dependsOn: ['vehicleTypeId'],
          paramKey: 'brandIds',
          getOptions: ({ enums, selection }) => {
            const allBrands = enums?.carBrands || [];
            const typeId = selection?.vehicleTypeId;
            if (!typeId) return allBrands;
            const models = enums?.vehicleModels || [];
            const brandIds = new Set(
              models
                .filter((m) => String(m?.typeId ?? m?.type_id ?? '') === String(typeId))
                .map((m) => m?.brandId ?? m?.brand_id)
                .filter(Boolean)
                .map((x) => String(x))
            );
            if (brandIds.size === 0) return allBrands;
            return allBrands.filter((b) => brandIds.has(String(b?.id ?? b?.value ?? '')));
          },
        },
        {
          enumKey: 'vehicleModels',
          initialDataKey: 'vehicleModelId',
          title: 'Choose model',
          description: 'Select a model to tailor the form fields.',
          kind: 'searchable',
          dependsOn: ['vehicleTypeId', 'brandId'],
          paramKey: 'vehicleModelIds',
          getOptions: ({ enums, selection }) => {
            const typeId = selection?.vehicleTypeId;
            const brandId = selection?.brandId;
            const models = enums?.vehicleModels || [];
            return models
              .filter((m) => (!brandId || String(m?.brandId ?? m?.brand_id ?? '') === String(brandId)))
              .filter((m) => (!typeId || String(m?.vehicleTypeId ?? m?.typeId ?? m?.vehicle_type_id ?? '') === String(typeId)))
              .map((m) => ({ id: String(m?.id ?? ''), label: String(m?.name ?? '') }))
              .filter((o) => o.id && o.label);
          },
        },
      ],
    },
    
    filterConfig: filterConfigs.VEHICLE,
    
    sortOptions: [
      { value: 'year', label: 'Year' },
      { value: 'mileage', label: 'Mileage' },
      { value: 'brand', label: 'Brand' },
      { value: 'price', label: 'Price' },
      { value: 'createdAt', label: 'Date Added' }
    ],
    
    compactBadges: (listing) => [
      { label: listing.brand?.label || listing.brand?.name || listing.brand, icon: '🚗', show: !!listing.brand },
      { label: listing.year, icon: '📅', show: !!listing.year },
      { 
        label: listing.mileage ? `${listing.mileage.toLocaleString('tr-TR')} km` : null, 
        icon: '🛣️', 
        show: !!listing.mileage 
      },
      { label: listing.fuelType, icon: '⛽', show: !!listing.fuelType },
    ].filter(badge => badge.show),
    
    defaultFilters: {
      minYear: 1980,
      maxYear: new Date().getFullYear(),
    }
  },

  [LISTING_TYPES.ELECTRONICS]: {
    label: 'Electronics',
    icon: '📱',
    description: 'Mobile phones, laptops, TVs and electronic devices',
    
    detailsComponent: GenericListingDetails,
    detailsSchema: {
      title: 'Electronics Information',
      fields: [
        { label: 'Type', key: 'electronicType', enumKey: 'electronicTypes' },
        { label: 'Brand', key: 'electronicBrand', enumKey: 'electronicBrands' },
        { label: 'Model', key: 'model' },
        { label: 'Origin', key: 'origin' },
        { label: 'Year', key: 'year' },
        { label: 'Color', key: 'color', enumKey: 'colors' },
        { label: 'Warranty Proof', key: 'warrantyProof', format: (_listing, v) => (v ? 'Yes' : 'No') },
        { label: 'RAM', key: 'ram', format: (_listing, v) => (v ? `${v} GB` : null) },
        { label: 'Storage', key: 'storage', format: (_listing, v) => (v ? `${v} GB` : null) },
        { label: 'Screen Size', key: 'screenSize', format: (_listing, v) => (v ? `${v}"` : null) },
        { label: 'Processor', key: 'processor', enumKey: 'processors' },
      ],
    },
    createComponent: ElectronicCreateForm,
    formSchema: {
      initialData: {
        ...ElectronicCreateRequestDTO,
        _electronicTypeName: '',
        price: '',
        year: '',
        ram: '',
        storage: '',
        screenSize: '',
        batteryHealthPercent: '',
        batteryCapacityMah: '',
        cameraMegapixels: '',
        batteryLifeHours: '',
      },
      steps: [
        {
          id: 1,
          title: 'Basic Information',
          description: 'Set the title, description and price of your listing',
          kind: 'basics',
          showQuantity: true,
        },
        {
          id: 2,
          title: 'Electronic Details',
          description: 'Specify the electronic specifications',
          kind: 'details',
          sections: [
            {
              id: 'electronics-basic',
              title: 'Temel Bilgiler',
              description: 'Ürün tipi, marka ve model bilgileri',
              fields: [
                {
                  name: 'electronicTypeId',
                  label: 'Tip',
                  type: 'enum',
                  enumKey: 'electronicTypes',
                  required: true,
                  onChange: ({ value, ctx }) => {
                    ctx.setValue('electronicTypeId', value);
                    ctx.setValue('electronicModelId', '');
                  },
                },
                {
                  name: 'electronicBrandId',
                  label: 'Marka',
                  type: 'enum',
                  enumKey: 'electronicBrands',
                  required: true,
                  onChange: ({ value, ctx }) => {
                    ctx.setValue('electronicBrandId', value);
                    ctx.setValue('electronicModelId', '');
                  },
                },
                {
                  name: 'electronicModelId',
                  label: 'Model',
                  type: 'searchable',
                  required: true,
                  disabledWhen: (ctx) => !ctx.formData?.electronicTypeId || !ctx.formData?.electronicBrandId,
                  getOptions: (ctx) => {
                    const brandId = ctx.formData?.electronicBrandId;
                    const typeId = ctx.formData?.electronicTypeId;
                    const allModels = ctx.enums?.electronicModels || [];
                    const filtered = allModels
                      .filter((m) => (!brandId || String(m?.brandId ?? m?.brand_id ?? '') === String(brandId)))
                      .filter((m) => (!typeId || String(m?.typeId ?? m?.type_id ?? '') === String(typeId)));
                    return filtered
                      .map((m) => ({ id: String(m?.id ?? ''), label: String(m?.name ?? '') }))
                      .filter((o) => o.id && o.label);
                  },
                },
                {
                  name: 'origin',
                  label: 'Menşei',
                  type: 'text',
                  placeholder: 'e.g. Apple Store TR',
                },
                {
                  name: 'year',
                  label: 'Yıl',
                  type: 'number',
                  required: true,
                  min: 1990,
                  max: new Date().getFullYear() + 1,
                  placeholder: 'YYYY',
                },
                {
                  name: 'color',
                  label: 'Renk',
                  type: 'enum',
                  enumKey: 'colors',
                  required: true,
                },
              ],
            },
            {
              id: 'electronics-laptop',
              title: 'Teknik Özellikler',
              description: 'RAM, depolama ve ekran bilgileri',
              visibleWhen: (ctx) => String(ctx.formData?._electronicTypeName || '').toUpperCase() === 'LAPTOP',
              fields: [
                { name: 'ram', label: 'RAM (GB)', type: 'number', required: true, min: 1, placeholder: '8, 16, 32...' },
                { name: 'storage', label: 'Depolama (GB)', type: 'number', required: true, min: 1, placeholder: '256, 512, 1024...' },
                { name: 'storageType', label: 'Depolama Tipi', type: 'enum', enumKey: 'storageTypes', required: true },
                { name: 'screenSize', label: 'Ekran Boyutu (inch)', type: 'number', required: true, min: 1, step: 0.1, placeholder: '13.3, 15.6...' },
                { name: 'processor', label: 'İşlemci', type: 'enum', enumKey: 'processors' },
                { name: 'gpuModel', label: 'Ekran Kartı', type: 'text', placeholder: 'e.g. RTX 3060, M2 10-core' },
                { name: 'operatingSystem', label: 'İşletim Sistemi', type: 'text', placeholder: 'Windows 11, macOS, Linux...' },
                { name: 'batteryHealthPercent', label: 'Pil Sağlığı (%)', type: 'number', min: 1, max: 100, placeholder: 'e.g. 90' },
              ],
            },
            {
              id: 'electronics-mobile',
              title: 'Telefon Özellikleri',
              description: 'Batarya, ekran ve bağlantı özellikleri',
              visibleWhen: (ctx) => String(ctx.formData?._electronicTypeName || '').toUpperCase() === 'MOBILE_PHONE',
              fields: [
                { name: 'storage', label: 'Depolama (GB)', type: 'number', required: true, min: 1, placeholder: '128, 256...' },
                { name: 'screenSize', label: 'Ekran Boyutu (inch)', type: 'number', required: true, min: 1, step: 0.1, placeholder: '6.1, 6.7...' },
                { name: 'batteryCapacityMah', label: 'Batarya (mAh)', type: 'number', required: true, min: 1, placeholder: '4000' },
                { name: 'cameraMegapixels', label: 'Kamera (MP)', type: 'number', min: 1, placeholder: '12, 48...' },
                { name: 'supports5g', label: '5G Destekli', type: 'toggle' },
                { name: 'dualSim', label: 'Çift SIM', type: 'toggle' },
                { name: 'hasNfc', label: 'NFC', type: 'toggle' },
              ],
            },
            {
              id: 'electronics-headphones',
              title: 'Kulaklık Özellikleri',
              description: 'Bağlantı tipi ve özellikler',
              visibleWhen: (ctx) => String(ctx.formData?._electronicTypeName || '').toUpperCase() === 'HEADPHONES',
              fields: [
                {
                  name: 'connectionType',
                  label: 'Bağlantı Tipi',
                  type: 'enum',
                  enumKey: 'electronicConnectionTypes',
                  required: true,
                  onChange: ({ value, ctx }) => {
                    ctx.setValue('connectionType', value);
                    const v = String(value || '').toUpperCase();
                    const wireless = v === 'BLUETOOTH' || v === 'BOTH';
                    ctx.setValue('wireless', wireless);
                    if (!wireless) ctx.setValue('batteryLifeHours', '');
                  },
                },
                { name: 'noiseCancelling', label: 'Aktif Gürültü Engelleme', type: 'toggle' },
                { name: 'hasMicrophone', label: 'Mikrofon', type: 'toggle' },
                {
                  name: 'batteryLifeHours',
                  label: 'Pil Ömrü (saat)',
                  type: 'number',
                  required: true,
                  min: 1,
                  placeholder: 'e.g. 20',
                  visibleWhen: (ctx) => Boolean(ctx.formData?.wireless),
                },
              ],
            },
            {
              id: 'electronics-extras',
              title: 'Ek Bilgiler',
              description: 'Garanti belgesi durumu',
              fields: [
                {
                  name: 'warrantyProof',
                  label: 'Garanti Belgesi Mevcut',
                  description: 'Orijinal garanti belgeleriniz varsa işaretleyin',
                  type: 'toggle',
                },
              ],
            },
          ],
        },
        {
          id: 3,
          title: 'Location',
          description: 'Set the location of your item',
          kind: 'mediaLocation',
        },
      ],
      derivedFields: [
        { sourceField: 'electronicTypeId', enumKey: 'electronicTypes', targetField: '_electronicTypeName', uppercase: true },
      ],
      getTitle: ({ isEdit }) => (isEdit ? 'Edit Electronics Listing' : 'Create Electronics Listing'),
      getSubtitle: ({ isEdit }) => (isEdit ? 'Update product details and location' : 'Enter product details and location'),
      normalizeInitialData: (data) => {
        if (!data) return null;
        return {
          ...data,
          electronicTypeId: data?.electronicTypeId || data?.electronicType?.id || '',
          electronicBrandId: data?.electronicBrandId || data?.electronicBrand?.id || '',
          electronicModelId: data?.electronicModelId || data?.model?.id || '',
        };
      },
    },
    service: {
      getById: (id) => electronicService.getElectronicById(id),
      update: (id, payload) => electronicService.updateElectronicListing(id, payload),
    },
    createFlow: {
      subtypeSelector: {
        enumKey: 'electronicTypes',
        queryParamKey: 'electronicTypeId',
        initialDataKey: 'electronicTypeId',
        title: 'Choose electronics type',
        description: 'Select a type to tailor the form fields.',
        paramKey: 'electronicTypeIds',
      },
      preFormSelectors: [
        {
          enumKey: 'electronicBrands',
          initialDataKey: 'electronicBrandId',
          title: 'Choose brand',
          description: 'Select a brand to narrow model options.',
          kind: 'searchable',
          paramKey: 'electronicBrandIds',
        },
        {
          enumKey: 'electronicModels',
          initialDataKey: 'electronicModelId',
          title: 'Choose model',
          description: 'Select a model to tailor the form fields.',
          kind: 'searchable',
          dependsOn: ['electronicTypeId', 'electronicBrandId'],
          paramKey: 'electronicModelIds',
          getOptions: ({ enums, selection }) => {
            const brandId = selection?.electronicBrandId;
            const typeId = selection?.electronicTypeId;
            const allModels = enums?.electronicModels || [];
            const filtered = allModels
              .filter((m) => (!brandId || String(m?.brandId ?? m?.brand_id ?? '') === String(brandId)))
              .filter((m) => (!typeId || String(m?.typeId ?? m?.type_id ?? '') === String(typeId)));
            return filtered
              .map((m) => ({ id: String(m?.id ?? ''), label: String(m?.name ?? '') }))
              .filter((o) => o.id && o.label);
          },
        },
      ],
    },
    
    filterConfig: filterConfigs.ELECTRONICS,
    
    sortOptions: [
      { value: 'year', label: 'Year' },
      { value: 'brand', label: 'Brand' },
      { value: 'type', label: 'Type' },
      { value: 'price', label: 'Price' },
      { value: 'createdAt', label: 'Date Added' }
    ],
    
    compactBadges: (listing) => [
      { label: listing.electronicType?.label || listing.electronicType?.name || listing.electronicType, icon: '📱', show: !!listing.electronicType },
      { label: listing.electronicBrand?.label || listing.electronicBrand?.name || listing.electronicBrand, icon: '🏷️', show: !!listing.electronicBrand },
      { label: listing.year, icon: '📅', show: !!listing.year },
      { label: listing.color, icon: '🎨', show: !!listing.color },
    ].filter(badge => badge.show),
    
    defaultFilters: {
      minYear: 2000,
      maxYear: new Date().getFullYear(),
    }
  },

  [LISTING_TYPES.REAL_ESTATE]: {
    label: 'Real Estate',
    icon: '🏠',
    description: 'Houses, apartments, land and real estate properties',
    
    detailsComponent: GenericListingDetails,
    detailsSchema: {
      title: 'Real Estate Information',
      fields: [
        { label: 'Ad Type', key: 'adType', enumKey: 'realEstateAdTypes' },
        { label: 'Property Type', key: 'realEstateType', enumKey: 'realEstateTypes' },
        { label: 'Heating Type', key: 'heatingType', enumKey: 'heatingTypes' },
        { label: 'Owner Type', key: 'ownerType', enumKey: 'ownerTypes' },
        { label: 'Square Meters', key: 'squareMeters', format: (_listing, v) => (v ? `${v} m²` : null) },
        { label: 'Room Count', key: 'roomCount' },
        { label: 'Bathroom Count', key: 'bathroomCount' },
        { label: 'Floor', key: 'floor' },
        { label: 'Building Age', key: 'buildingAge', format: (_listing, v) => (v ? `${v} years` : null) },
        { label: 'Furnished', key: 'furnished', format: (_listing, v) => (v ? 'Yes' : 'No') },
      ],
    },
    createComponent: RealEstateCreateForm,
    formSchema: {
      initialData: {
        ...RealEstateCreateRequestDTO,
        title: '',
        description: '',
        price: '',
        squareMeters: '',
        roomCount: '',
        bathroomCount: '',
        floor: '',
        buildingAge: '',
        zoningStatus: '',
        _realEstateTypeName: '',
      },
      steps: [
        {
          id: 1,
          title: 'Basic Information',
          description: 'Set the title, description and price of your listing',
          kind: 'basics',
          showQuantity: false,
        },
        {
          id: 2,
          title: 'Property Details',
          description: 'Specify the property specifications',
          kind: 'details',
          sections: [
            {
              id: 'realestate-basic',
              title: 'Temel Bilgiler',
              description: 'İlan tipi, gayrimenkul tipi ve sahiplik durumu',
              fields: [
                { name: 'adTypeId', label: 'Ad Type', type: 'enum', enumKey: 'realEstateAdTypes', required: true },
                { name: 'realEstateTypeId', label: 'Property Type', type: 'enum', enumKey: 'realEstateTypes', required: true },
                {
                  name: 'heatingTypeId',
                  label: 'Heating Type',
                  type: 'enum',
                  enumKey: 'heatingTypes',
                  required: true,
                  visibleWhen: (ctx) => !['LAND', 'FARM'].includes(String(ctx.formData?._realEstateTypeName || '').toUpperCase()),
                },
                { name: 'ownerTypeId', label: 'Owner Type', type: 'enum', enumKey: 'ownerTypes', required: true },
              ],
            },
            {
              id: 'realestate-physical',
              title: 'Fiziksel Özellikler',
              description: 'Metrekare, oda sayısı ve diğer detaylar',
              fields: [
                { name: 'squareMeters', label: 'Square Meters', type: 'number', required: true, min: 0 },
                {
                  name: 'roomCount',
                  label: 'Room Count',
                  type: 'number',
                  required: true,
                  min: 0,
                  visibleWhen: (ctx) => !['LAND', 'FARM'].includes(String(ctx.formData?._realEstateTypeName || '').toUpperCase()),
                },
                {
                  name: 'bathroomCount',
                  label: 'Bathroom Count',
                  type: 'number',
                  min: 0,
                  visibleWhen: (ctx) => !['LAND', 'FARM'].includes(String(ctx.formData?._realEstateTypeName || '').toUpperCase()),
                },
                {
                  name: 'floor',
                  label: 'Floor',
                  type: 'number',
                  min: 0,
                  visibleWhen: (ctx) => !['LAND', 'FARM'].includes(String(ctx.formData?._realEstateTypeName || '').toUpperCase()),
                },
                {
                  name: 'buildingAge',
                  label: 'Building Age',
                  type: 'number',
                  min: 0,
                  visibleWhen: (ctx) => !['LAND', 'FARM'].includes(String(ctx.formData?._realEstateTypeName || '').toUpperCase()),
                },
                {
                  name: 'zoningStatus',
                  label: 'Zoning Status',
                  type: 'text',
                  required: true,
                  visibleWhen: (ctx) => ['LAND', 'FARM'].includes(String(ctx.formData?._realEstateTypeName || '').toUpperCase()),
                },
              ],
            },
            {
              id: 'realestate-extras',
              title: 'Ek Bilgiler',
              description: 'Eşyalı durumu',
              visibleWhen: (ctx) => !['LAND', 'FARM'].includes(String(ctx.formData?._realEstateTypeName || '').toUpperCase()),
              fields: [
                { name: 'furnished', label: 'Eşyalı', type: 'toggle' },
              ],
            },
          ],
        },
        {
          id: 3,
          title: 'Location',
          description: 'Set the location of your item',
          kind: 'mediaLocation',
        },
      ],
      derivedFields: [
        { sourceField: 'realEstateTypeId', enumKey: 'realEstateTypes', targetField: '_realEstateTypeName', uppercase: true },
      ],
      effects: [
        (ctx) => {
          const typeName = String(ctx.formData?._realEstateTypeName || '').toUpperCase();
          const isLand = typeName === 'LAND' || typeName === 'FARM';
          if (isLand) {
            if (ctx.formData?.heatingTypeId) ctx.setValue('heatingTypeId', '');
            if (String(ctx.formData?.roomCount ?? '') !== '0') ctx.setValue('roomCount', 0);
            if (ctx.formData?.bathroomCount) ctx.setValue('bathroomCount', '');
            if (ctx.formData?.floor) ctx.setValue('floor', '');
            if (ctx.formData?.buildingAge) ctx.setValue('buildingAge', '');
            if (Boolean(ctx.formData?.furnished)) ctx.setValue('furnished', false);
          } else {
            if (ctx.formData?.zoningStatus) ctx.setValue('zoningStatus', '');
          }
        },
      ],
      getTitle: ({ isEdit }) => (isEdit ? 'Edit Real Estate Listing' : 'Create Real Estate Listing'),
      getSubtitle: ({ isEdit }) => (isEdit ? 'Update your real estate listing details' : 'Create your real estate listing step by step'),
      normalizeInitialData: (data) => {
        if (!data) return null;
        return {
          ...data,
          adTypeId: data?.adTypeId || data?.adType?.id || '',
          realEstateTypeId: data?.realEstateTypeId || data?.realEstateType?.id || '',
          heatingTypeId: data?.heatingTypeId || data?.heatingType?.id || '',
          ownerTypeId: data?.ownerTypeId || data?.ownerType?.id || '',
        };
      },
    },
    service: {
      getById: (id) => realEstateService.getRealEstateById(id),
      update: (id, payload) => realEstateService.updateRealEstateListing(id, payload),
    },
    createFlow: {
      subtypeSelector: {
        enumKey: 'realEstateTypes',
        queryParamKey: 'realEstateTypeId',
        initialDataKey: 'realEstateTypeId',
        title: 'Choose property type',
        description: 'Select a type to tailor the form fields.',
        paramKey: 'realEstateTypeIds',
      },
      preFormSelectors: [
        {
          enumKey: 'realEstateAdTypes',
          initialDataKey: 'adTypeId',
          title: 'Choose ad type',
          description: 'Select an ad type to tailor the form fields.',
          kind: 'grid',
          dependsOn: ['realEstateTypeId'],
          paramKey: 'adTypeId',
        },
        {
          enumKey: 'heatingTypes',
          initialDataKey: 'heatingTypeId',
          title: 'Choose heating type',
          description: 'Select a heating type to tailor the form fields.',
          kind: 'grid',
          dependsOn: ['realEstateTypeId'],
          prefilter: false,
        },
        {
          enumKey: 'ownerTypes',
          initialDataKey: 'ownerTypeId',
          title: 'Choose owner type',
          description: 'Select an owner type to tailor the form fields.',
          kind: 'grid',
          dependsOn: ['realEstateTypeId'],
          paramKey: 'ownerTypeId',
        },
      ],
    },
    
    filterConfig: filterConfigs.REAL_ESTATE,
    
    sortOptions: [
      { value: 'squareMeters', label: 'Square Meters' },
      { value: 'roomCount', label: 'Room Count' },
      { value: 'buildingAge', label: 'Building Age' },
      { value: 'floor', label: 'Floor' },
      { value: 'price', label: 'Price' },
      { value: 'createdAt', label: 'Date Added' }
    ],
    
    compactBadges: (listing) => [
      { label: listing.realEstateType, icon: '🏠', show: !!listing.realEstateType },
      { label: listing.adType, icon: '📋', show: !!listing.adType },
      { 
        label: listing.squareMeters ? `${listing.squareMeters} m²` : null, 
        icon: '📏', 
        show: !!listing.squareMeters 
      },
      { 
        label: listing.roomCount ? `${listing.roomCount} rooms` : null, 
        icon: '🚪', 
        show: !!listing.roomCount 
      },
      { label: listing.heatingType, icon: '🔥', show: !!listing.heatingType },
      { label: listing.ownerType, icon: '👤', show: !!listing.ownerType },
    ].filter(badge => badge.show),
    
    defaultFilters: {
      minSquareMeters: 0,
      minRoomCount: 1,
    }
  },

  [LISTING_TYPES.CLOTHING]: {
    label: 'Clothing',
    icon: '👕',
    description: 'Clothing, shoes and fashion accessories',
    
    detailsComponent: GenericListingDetails,
    detailsSchema: {
      title: 'Clothing Information',
      fields: [
        { label: 'Brand', key: 'brand', enumKey: 'clothingBrands' },
        { label: 'Type', key: 'clothingType', enumKey: 'clothingTypes' },
        { label: 'Color', key: 'color', enumKey: 'colors' },
        { label: 'Condition', key: 'condition', enumKey: 'clothingConditions' },
        { label: 'Clothing Gender', key: 'clothingGender', enumKey: 'clothingGenders' },
        { label: 'Clothing Category', key: 'clothingCategory', enumKey: 'clothingCategories' },
        {
          label: 'Purchase Year',
          key: 'purchaseDate',
          format: (_listing, v) => (v ? String(new Date(v).getFullYear()) : null),
        },
      ],
    },
    createComponent: ClothingCreateForm,
    formSchema: {
      initialData: {
        title: '',
        description: '',
        price: '',
        currency: 'TRY',
        quantity: 1,
        brandId: '',
        clothingTypeId: '',
        _clothingTypeName: '',
        color: '',
        condition: '',
        size: '',
        shoeSizeEu: '',
        material: '',
        clothingGender: '',
        clothingCategory: '',
        purchaseYear: '',
        city: '',
        district: '',
        imageUrl: '',
      },
      steps: [
        {
          id: 1,
          title: 'Basic Information',
          description: 'Set the title, description and price of your listing',
          kind: 'basics',
          showQuantity: true,
        },
        {
          id: 2,
          title: 'Clothing Specifications',
          description: 'Specify the details of your clothing item',
          kind: 'details',
          sections: [
            {
              id: 'clothing-details',
              title: 'Ürün Detayları',
              description: 'Kıyafet tipi, marka ve diğer özellikler',
              fields: [
                { name: 'brandId', label: 'Brand', type: 'enum', enumKey: 'clothingBrands', required: true },
                { name: 'clothingTypeId', label: 'Type', type: 'enum', enumKey: 'clothingTypes', required: true },
                { name: 'color', label: 'Color', type: 'enum', enumKey: 'colors', required: true },
                { name: 'condition', label: 'Condition', type: 'enum', enumKey: 'clothingConditions', required: true },
                { name: 'clothingGender', label: 'Clothing Gender', type: 'enum', enumKey: 'clothingGenders', required: true },
                { name: 'clothingCategory', label: 'Clothing Category', type: 'enum', enumKey: 'clothingCategories', required: true },
                {
                  name: 'size',
                  label: 'Size',
                  type: 'enum',
                  enumKey: 'clothingSizes',
                  required: true,
                  visibleWhen: (ctx) => {
                    const t = String(ctx.formData?._clothingTypeName || '').toUpperCase();
                    const footwear = ['SHOES', 'SNEAKERS', 'BOOTS', 'SANDALS', 'HEELS', 'FLATS'].includes(t);
                    const accessory = ['HAT', 'CAP', 'SCARF', 'GLOVES', 'BELT', 'TIE', 'BAG'].includes(t);
                    return Boolean(t) && !footwear && !accessory;
                  },
                },
                {
                  name: 'shoeSizeEu',
                  label: 'Shoe Size (EU)',
                  type: 'number',
                  required: true,
                  min: 20,
                  max: 55,
                  visibleWhen: (ctx) => {
                    const t = String(ctx.formData?._clothingTypeName || '').toUpperCase();
                    return ['SHOES', 'SNEAKERS', 'BOOTS', 'SANDALS', 'HEELS', 'FLATS'].includes(t);
                  },
                },
                { name: 'material', label: 'Material', type: 'text' },
                {
                  name: 'purchaseYear',
                  label: 'Satın Alma Tarihi',
                  type: 'number',
                  required: true,
                  min: 1900,
                  max: new Date().getFullYear(),
                },
              ],
            },
          ],
        },
        {
          id: 3,
          title: 'Location',
          description: 'Set the location of your item',
          kind: 'mediaLocation',
        },
      ],
      derivedFields: [
        { sourceField: 'clothingTypeId', enumKey: 'clothingTypes', targetField: '_clothingTypeName', uppercase: true },
      ],
      effects: [
        (ctx) => {
          const t = String(ctx.formData?._clothingTypeName || '').toUpperCase();
          const footwear = ['SHOES', 'SNEAKERS', 'BOOTS', 'SANDALS', 'HEELS', 'FLATS'].includes(t);
          const accessory = ['HAT', 'CAP', 'SCARF', 'GLOVES', 'BELT', 'TIE', 'BAG'].includes(t);
          const apparel = Boolean(t) && !footwear && !accessory;
          if (footwear) {
            if (ctx.formData?.size) ctx.setValue('size', '');
          }
          if (apparel) {
            if (ctx.formData?.shoeSizeEu) ctx.setValue('shoeSizeEu', '');
          }
          if (accessory) {
            if (ctx.formData?.size) ctx.setValue('size', '');
            if (ctx.formData?.shoeSizeEu) ctx.setValue('shoeSizeEu', '');
          }
        },
      ],
      getTitle: ({ isEdit }) => (isEdit ? 'Edit Clothing Listing' : 'Create Clothing Listing'),
      getSubtitle: ({ isEdit }) => (isEdit ? 'Update your clothing listing details' : 'Create your clothing listing step by step'),
      normalizeInitialData: (data) => {
        if (!data) return null;
        return {
          ...data,
          brandId: data?.brandId || data?.brand?.id || '',
          clothingTypeId: data?.clothingTypeId || data?.clothingType?.id || '',
        };
      },
    },
    service: {
      getById: (id) => clothingService.getClothingDetails(id),
      update: (id, payload) => clothingService.updateClothingListing(id, payload),
    },
    createFlow: {
      subtypeSelector: {
        enumKey: 'clothingTypes',
        queryParamKey: 'clothingTypeId',
        initialDataKey: 'clothingTypeId',
        title: 'Choose clothing type',
        description: 'Select a type to tailor the form fields.',
        paramKey: 'types',
      },
      preFormSelectors: [
        {
          enumKey: 'clothingBrands',
          initialDataKey: 'brandId',
          title: 'Choose brand',
          description: 'Select a brand to tailor the form fields.',
          kind: 'searchable',
          paramKey: 'brands',
        },
        {
          enumKey: 'colors',
          initialDataKey: 'color',
          title: 'Choose color',
          description: 'Select a color to tailor the form fields.',
          kind: 'searchable',
          dependsOn: ['clothingTypeId'],
          prefilter: false,
        },
        {
          enumKey: 'clothingConditions',
          initialDataKey: 'condition',
          title: 'Choose condition',
          description: 'Select a condition to tailor the form fields.',
          kind: 'grid',
          dependsOn: ['clothingTypeId'],
          prefilter: false,
        },
        {
          enumKey: 'clothingGenders',
          initialDataKey: 'clothingGender',
          title: 'Choose clothing gender',
          description: 'Select a clothing gender to tailor the form fields.',
          kind: 'grid',
          dependsOn: ['clothingTypeId'],
          prefilter: false,
        },
        {
          enumKey: 'clothingCategories',
          initialDataKey: 'clothingCategory',
          title: 'Choose clothing category',
          description: 'Select a clothing category to tailor the form fields.',
          kind: 'grid',
          dependsOn: ['clothingTypeId'],
          prefilter: false,
        },
      ],
    },
    
    filterConfig: filterConfigs.CLOTHING,
    
    sortOptions: [
      { value: 'brand', label: 'Brand' },
      { value: 'type', label: 'Type' },
      { value: 'condition', label: 'Condition' },
      { value: 'clothingGender', label: 'Clothing Gender' },
      { value: 'clothingCategory', label: 'Clothing Category' },
      { value: 'purchaseDate', label: 'Purchase Date' },
      { value: 'price', label: 'Price' },
      { value: 'createdAt', label: 'Date Added' }
    ],
    
    compactBadges: (listing) => [
      { label: listing.brand?.label || listing.brand?.name || listing.brand, icon: '🏷️', show: !!listing.brand },
      { label: listing.clothingType?.label || listing.clothingType?.name || listing.clothingType, icon: '👕', show: !!listing.clothingType },
      { label: listing.color, icon: '🎨', show: !!listing.color },
      { label: listing.condition, icon: '⭐', show: !!listing.condition },
      { label: listing.clothingGender, icon: '👤', show: !!listing.clothingGender },
      { label: listing.clothingCategory, icon: '👶', show: !!listing.clothingCategory },
      { 
        label: listing.purchaseDate ? String(new Date(listing.purchaseDate).getFullYear()) : null, 
        icon: '📅', 
        show: !!listing.purchaseDate 
      },
    ].filter(badge => badge.show),
    
    defaultFilters: {}
  },

  [LISTING_TYPES.BOOKS]: {
    label: 'Books',
    icon: '📚',
    description: 'Books, magazines and printed materials',
    
    detailsComponent: GenericListingDetails,
    detailsSchema: {
      title: 'Books Information',
      fields: [
        { label: 'Author', key: 'author' },
        { label: 'Book Type', key: 'bookType', enumKey: 'bookTypes' },
        { label: 'Genre', key: 'genre', enumKey: 'bookGenres' },
        { label: 'Language', key: 'language', enumKey: 'bookLanguages' },
        { label: 'Publication Year', key: 'publicationYear' },
        { label: 'Page Count', key: 'pageCount' },
        { label: 'Format', key: 'format', enumKey: 'bookFormats' },
        { label: 'Condition', key: 'condition', enumKey: 'bookConditions' },
        { label: 'ISBN', key: 'isbn' },
      ],
    },
    createComponent: BooksCreateForm,
    formSchema: {
      initialData: {
        title: '',
        description: '',
        price: '',
        currency: 'TRY',
        quantity: 1,
        author: '',
        bookTypeId: '',
        genreId: '',
        _genreBookTypeId: '',
        languageId: '',
        publicationYear: '',
        pageCount: '',
        formatId: '',
        conditionId: '',
        isbn: '',
        city: '',
        district: '',
        imageUrl: '',
      },
      steps: [
        {
          id: 1,
          title: 'Basic Information',
          description: 'Set the title, description and price of your listing',
          kind: 'basics',
          showQuantity: true,
        },
        {
          id: 2,
          title: 'Book Specifications',
          description: 'Specify the details of your book',
          kind: 'details',
          sections: [
            {
              id: 'books-details',
              title: 'Kitap Detayları',
              description: 'Kitap bilgileri ve özellikleri',
              fields: [
                { name: 'author', label: 'Author', type: 'text', required: true },
                {
                  name: 'bookTypeId',
                  label: 'Book Type',
                  type: 'enum',
                  enumKey: 'bookTypes',
                  required: true,
                  onChange: ({ value, ctx }) => {
                    ctx.setValue('bookTypeId', value);
                    ctx.setValue('genreId', '');
                  },
                },
                {
                  name: 'genreId',
                  label: 'Genre',
                  type: 'enum',
                  enumKey: 'bookGenres',
                  required: true,
                  disabledWhen: (ctx) => !ctx.formData?.bookTypeId,
                  getOptions: (ctx) => (ctx.enums?.bookGenres || []).filter((g) => !ctx.formData?.bookTypeId || String(g?.bookTypeId ?? '') === String(ctx.formData?.bookTypeId)),
                },
                { name: 'languageId', label: 'Language', type: 'enum', enumKey: 'bookLanguages', required: true },
                { name: 'publicationYear', label: 'Publication Year', type: 'number', required: true },
                { name: 'pageCount', label: 'Page Count', type: 'number', required: true, min: 1 },
                { name: 'formatId', label: 'Format', type: 'enum', enumKey: 'bookFormats', required: true },
                { name: 'conditionId', label: 'Condition', type: 'enum', enumKey: 'bookConditions', required: true },
                { name: 'isbn', label: 'ISBN', type: 'text' },
              ],
            },
          ],
        },
        {
          id: 3,
          title: 'Location',
          description: 'Set the location of your item',
          kind: 'mediaLocation',
        },
      ],
      effects: [
        (ctx) => {
          const genreId = ctx.formData?.genreId;
          if (!genreId) {
            if (ctx.formData?._genreBookTypeId) ctx.setValue('_genreBookTypeId', '');
            return;
          }
          const g = (ctx.enums?.bookGenres || []).find((x) => String(x?.id ?? x?.value ?? '') === String(genreId));
          const next = String(g?.bookTypeId ?? '');
          if (String(ctx.formData?._genreBookTypeId ?? '') !== String(next)) ctx.setValue('_genreBookTypeId', next);
          if (ctx.formData?.bookTypeId && next && String(next) !== String(ctx.formData?.bookTypeId)) {
            ctx.setValue('genreId', '');
          }
        },
      ],
      customValidators: [
        {
          when: ({ stepId }) => Number(stepId) === 2 || stepId === 'all',
          validate: ({ ctx }) => {
            const errors = {};
            if (
              ctx.formData?.bookTypeId &&
              ctx.formData?.genreId &&
              ctx.formData?._genreBookTypeId &&
              String(ctx.formData._genreBookTypeId) !== String(ctx.formData.bookTypeId)
            ) {
              errors.genreId = 'Genre does not belong to selected book type';
            }
            return errors;
          },
        },
      ],
      getTitle: ({ isEdit }) => (isEdit ? 'Edit Books Listing' : 'Create Books Listing'),
      getSubtitle: ({ isEdit }) => (isEdit ? 'Update your book listing details' : 'Create your book listing step by step'),
      normalizeInitialData: (data) => {
        if (!data) return null;
        return {
          ...data,
          bookTypeId: data?.bookTypeId || data?.bookType?.id || '',
          genreId: data?.genreId || data?.genre?.id || '',
          languageId: data?.languageId || data?.language?.id || '',
          formatId: data?.formatId || data?.format?.id || '',
          conditionId: data?.conditionId || data?.condition?.id || '',
        };
      },
    },
    service: {
      getById: (id) => booksService.getBooksDetails(id),
      update: (id, payload) => booksService.updateBooksListing(id, payload),
    },
    createFlow: {
      subtypeSelector: {
        enumKey: 'bookTypes',
        queryParamKey: 'bookTypeId',
        initialDataKey: 'bookTypeId',
        title: 'Choose book type',
        description: 'Select a type to tailor the form fields.',
        paramKey: 'bookTypeIds',
      },
      preFormSelectors: [
        {
          enumKey: 'bookGenres',
          initialDataKey: 'genreId',
          title: 'Choose genre',
          description: 'Select a genre to tailor the form fields.',
          kind: 'searchable',
          dependsOn: ['bookTypeId'],
          paramKey: 'genreIds',
          getOptions: ({ enums, selection }) => {
            const bookTypeId = selection?.bookTypeId;
            const all = enums?.bookGenres || [];
            return all
              .filter((g) => !bookTypeId || String(g?.bookTypeId ?? '') === String(bookTypeId))
              .map((g) => ({ id: String(g?.id ?? ''), label: String(g?.label ?? g?.name ?? '') }))
              .filter((o) => o.id && o.label);
          },
        },
        {
          enumKey: 'bookLanguages',
          initialDataKey: 'languageId',
          title: 'Choose language',
          description: 'Select a language to tailor the form fields.',
          kind: 'grid',
          dependsOn: ['bookTypeId'],
          prefilter: false,
        },
        {
          enumKey: 'bookFormats',
          initialDataKey: 'formatId',
          title: 'Choose format',
          description: 'Select a format to tailor the form fields.',
          kind: 'grid',
          dependsOn: ['bookTypeId'],
          prefilter: false,
        },
        {
          enumKey: 'bookConditions',
          initialDataKey: 'conditionId',
          title: 'Choose condition',
          description: 'Select a condition to tailor the form fields.',
          kind: 'grid',
          dependsOn: ['bookTypeId'],
          prefilter: false,
        },
      ],
    },
    
    filterConfig: filterConfigs.BOOKS,
    
    sortOptions: [
      { value: 'author', label: 'Author' },
      { value: 'publicationYear', label: 'Year' },
      { value: 'pageCount', label: 'Page Count' },
      { value: 'genre', label: 'Genre' },
      { value: 'price', label: 'Price' },
      { value: 'createdAt', label: 'Date Added' }
    ],
    
    compactBadges: (listing) => [
      { label: listing.author, icon: '✍️', show: !!listing.author },
      { label: listing.bookType?.label || listing.bookType?.name || listing.bookType, icon: '📚', show: !!listing.bookType },
      { label: listing.genre?.label || listing.genre?.name || listing.genre, icon: '🏷️', show: !!listing.genre },
      { label: listing.publicationYear, icon: '📅', show: !!listing.publicationYear },
      { 
        label: listing.pageCount ? `${listing.pageCount} pages` : null, 
        icon: '📖', 
        show: !!listing.pageCount 
      },
    ].filter(badge => badge.show),
    
    defaultFilters: {
      minYear: 1450,
      maxYear: new Date().getFullYear(),
    }
  },

  [LISTING_TYPES.SPORTS]: {
    label: 'Sports',
    icon: '⚽',
    description: 'Sports equipment and accessories',
    
    detailsComponent: GenericListingDetails,
    detailsSchema: {
      title: 'Sports Information',
      fields: [
        { label: 'Discipline', key: 'discipline', enumKey: 'sportDisciplines' },
        { label: 'Equipment Type', key: 'equipmentType', enumKey: 'sportEquipmentTypes' },
        { label: 'Condition', key: 'condition', enumKey: 'sportConditions' },
      ],
    },
    createComponent: SportsCreateForm,
    formSchema: {
      initialData: {
        title: '',
        description: '',
        price: '',
        currency: 'TRY',
        quantity: 1,
        disciplineId: '',
        equipmentTypeId: '',
        conditionId: '',
        city: '',
        district: '',
        imageUrl: '',
      },
      steps: [
        {
          id: 1,
          title: 'Basic Information',
          description: 'Set the title, description and price of your listing',
          kind: 'basics',
          showQuantity: true,
        },
        {
          id: 2,
          title: 'Sports Details',
          description: 'Specify the sports equipment specifications',
          kind: 'details',
          sections: [
            {
              id: 'sports-details',
              title: 'Spor Ekipmanı Detayları',
              description: 'Spor tipi, ekipman tipi ve durum',
              fields: [
                { name: 'disciplineId', label: 'Spor Tipi', type: 'enum', enumKey: 'sportDisciplines', required: true },
                { name: 'equipmentTypeId', label: 'Ekipman Tipi', type: 'enum', enumKey: 'sportEquipmentTypes', required: true },
                { name: 'conditionId', label: 'Durum', type: 'enum', enumKey: 'sportConditions', required: true },
              ],
            },
          ],
        },
        {
          id: 3,
          title: 'Location',
          description: 'Set the location of your item',
          kind: 'mediaLocation',
        },
      ],
      getTitle: ({ isEdit }) => (isEdit ? 'Edit Sports Listing' : 'Create Sports Listing'),
      getSubtitle: ({ isEdit }) => (isEdit ? 'Update your sports listing details' : 'Create your sports listing step by step'),
      normalizeInitialData: (data) => {
        if (!data) return null;
        return {
          ...data,
          disciplineId: data?.disciplineId || data?.discipline?.id || '',
          equipmentTypeId: data?.equipmentTypeId || data?.equipmentType?.id || '',
          conditionId: data?.conditionId || data?.condition?.id || '',
        };
      },
    },
    service: {
      getById: (id) => sportsService.getSportsDetails(id),
      update: (id, payload) => sportsService.updateSportsListing(id, payload),
    },
    createFlow: {
      subtypeSelector: {
        enumKey: 'sportDisciplines',
        queryParamKey: 'disciplineId',
        initialDataKey: 'disciplineId',
        title: 'Choose sport discipline',
        description: 'Select a discipline to tailor the form fields.',
        paramKey: 'disciplineIds',
      },
      preFormSelectors: [
        {
          enumKey: 'sportEquipmentTypes',
          initialDataKey: 'equipmentTypeId',
          title: 'Choose equipment type',
          description: 'Select an equipment type to tailor the form fields.',
          kind: 'grid',
          dependsOn: ['disciplineId'],
          paramKey: 'equipmentTypeIds',
        },
        {
          enumKey: 'sportConditions',
          initialDataKey: 'conditionId',
          title: 'Choose condition',
          description: 'Select a condition to tailor the form fields.',
          kind: 'grid',
          dependsOn: ['disciplineId'],
          paramKey: 'conditionIds',
        },
      ],
    },
    
    filterConfig: filterConfigs.SPORTS,
    
    sortOptions: [
      { value: 'discipline', label: 'Discipline' },
      { value: 'equipmentType', label: 'Equipment Type' },
      { value: 'condition', label: 'Condition' },
      { value: 'price', label: 'Price' },
      { value: 'createdAt', label: 'Date Added' }
    ],
    
    compactBadges: (listing) => [
      { label: listing.discipline?.label || listing.discipline?.name || listing.discipline, icon: '🏅', show: !!listing.discipline },
      { label: listing.equipmentType?.label || listing.equipmentType?.name || listing.equipmentType, icon: '🎽', show: !!listing.equipmentType },
      { label: listing.condition?.label || listing.condition?.name || listing.condition, icon: '⭐', show: !!listing.condition },
    ].filter(badge => badge.show),
    
    defaultFilters: {}
  }
};


export const getListingConfig = (listingType) => {
  return listingTypeConfig[listingType] || null;
};

export const getPrefilterSelectors = (listingType) => {
  const config = listingTypeConfig[listingType];
  if (!config?.createFlow) return [];
  const { subtypeSelector, preFormSelectors = [] } = config.createFlow;
  const prefilterPreForm = preFormSelectors.filter((s) => s.prefilter !== false);
  const subtype = subtypeSelector ? [{ ...subtypeSelector, label: subtypeSelector.title }] : [];
  return [...subtype, ...prefilterPreForm.map((s) => ({ ...s, label: s.title }))];
};

export const getAllListingTypes = () => {
  return Object.keys(listingTypeConfig);
};

export const getListingTypeOptions = () => {
  return Object.entries(listingTypeConfig).map(([value, config]) => ({
    value,
    label: config.label,
    icon: config.icon,
    description: config.description
  }));
};

export const isValidListingType = (listingType) => {
  return listingType && listingTypeConfig.hasOwnProperty(listingType);
};

export const listingTypeRegistry = Object.fromEntries(
  Object.entries(listingTypeConfig).map(([type, config]) => [
    type,
    {
      detailsComponent: config.detailsComponent,
      editComponent: config.createComponent,       compactBadges: config.compactBadges
    }
  ])
);

export const createFormRegistry = Object.fromEntries(
  Object.entries(listingTypeConfig).map(([type, config]) => [
    type,
    config.createComponent
  ])
);

export default listingTypeConfig;
