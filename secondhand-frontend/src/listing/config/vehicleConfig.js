import { lazy } from 'react';
import GenericListingDetails from '../components/details/GenericListingDetails.jsx';
const VehicleCreateForm = lazy(() => import('../../vehicle/components/VehicleCreateForm.jsx'));
import { vehicleService } from '../../vehicle/services/vehicleService.js';
import { VehicleCreateRequestDTO } from '../../vehicle/vehicles.js';
import { filterConfigs } from '../filters/filterConfigs.js';
import {
  applyEngineCatalogDefaults,
  bodyTypeOptions,
  brandIdsForType,
  clearVehicleHierarchy,
  enginesForGeneration,
  filterModels,
  findEngine,
  generationsForModel,
  getVehicleTypeName,
  isCarVehicle,
  showEngineFields,
  showGenerationFields,
  showTrimFields,
  toLookupOptions,
  toModelOptions,
  trimsForGeneration,
} from '../../vehicle/utils/vehicleCatalogUtils.js';

const resetFromType = ({ ctx }) => {
  clearVehicleHierarchy(ctx.setValue, 'type');
};

const resetFromBrand = ({ ctx }) => {
  clearVehicleHierarchy(ctx.setValue, 'brand');
};

const resetFromModel = ({ ctx }) => {
  clearVehicleHierarchy(ctx.setValue, 'model');
};

const syncModelBrandType = ({ value, ctx }) => {
  ctx.setValue('vehicleModelId', value);
  resetFromModel({ ctx });
  const m = (ctx.enums?.vehicleModels || []).find((x) => String(x?.id ?? '') === String(value || ''));
  if (!m) return;
  const modelBrandId = String(m?.brandId ?? m?.brand_id ?? '');
  const modelTypeId = String(m?.typeId ?? m?.type_id ?? '');
  if (modelBrandId) ctx.setValue('_modelBrandId', modelBrandId);
  if (modelTypeId) ctx.setValue('_modelTypeId', modelTypeId);
  if (modelBrandId && String(ctx.formData?.brandId ?? '') !== modelBrandId) {
    ctx.setValue('brandId', modelBrandId);
  }
  if (modelTypeId && String(ctx.formData?.vehicleTypeId ?? '') !== modelTypeId) {
    ctx.setValue('vehicleTypeId', modelTypeId);
  }
};

const onEnginePicked = ({ value, ctx }) => {
  ctx.setValue('vehicleEngineId', value);
  const eng = findEngine(ctx.enums, value);
  applyEngineCatalogDefaults(eng, ctx.setValue);
};

export const vehicleConfig = {
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
          { label: 'Generation', key: 'generation', enumKey: 'vehicleGenerations' },
          { label: 'Year', key: 'year' },
          { label: 'Color', key: 'color', enumKey: 'colors' },
        ],
      },
      {
        id: 'mechanical',
        label: 'Mechanical',
        title: 'Mechanical',
        fields: [
          { label: 'Engine Variant', key: 'engine', enumKey: 'vehicleEngines' },
          { label: 'Trim Package', key: 'trim', enumKey: 'vehicleTrims' },
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
          { label: 'Kilometer', key: 'mileage', format: (_listing, v) => (v ? `${Number(v).toLocaleString('tr-TR')} km` : null) },
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
          { label: 'Accident History', key: 'accidentHistory', format: (_listing, v) => (v === true ? 'Yes' : v === false ? 'No' : null) },
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
      vehicleGenerationId: '',
      vehicleEngineId: '',
      vehicleTrimId: '',
    },
    steps: [
      { id: 1, title: 'Basic Information', description: 'Set the title, description and price of your listing', kind: 'basics', showQuantity: false },
      {
        id: 2,
        title: 'Vehicle Specifications',
        description: 'Specify the technical details of your vehicle',
        kind: 'details',
        sections: [
          {
            id: 'vehicle-basic',
            title: 'Basic Information',
            description: 'Brand, model and basic features of the vehicle',
            fields: [
              {
                name: 'vehicleTypeId',
                label: 'Vehicle Type',
                type: 'enum',
                enumKey: 'vehicleTypes',
                required: true,
                onChange: ({ value, ctx }) => {
                  ctx.setValue('vehicleTypeId', value);
                  resetFromType({ ctx });
                },
              },
              {
                name: 'brandId',
                label: 'Brand',
                type: 'enum',
                enumKey: 'carBrands',
                required: true,
                getOptions: (ctx) => {
                  const allBrands = ctx.enums?.carBrands || [];
                  const typeId = ctx.formData?.vehicleTypeId;
                  if (!typeId) return allBrands;
                  const ids = brandIdsForType(ctx.enums?.vehicleModels || [], typeId);
                  if (ids.size === 0) return allBrands;
                  const filtered = allBrands.filter((b) => ids.has(String(b?.id ?? '')));
                  return filtered.length > 0 ? filtered : allBrands;
                },
                onChange: ({ value, ctx }) => {
                  ctx.setValue('brandId', value);
                  resetFromBrand({ ctx });
                },
              },
              {
                name: 'vehicleModelId',
                label: 'Model',
                type: 'searchable',
                enumKey: 'vehicleModels',
                required: true,
                disabledWhen: (ctx) => !ctx.formData?.vehicleTypeId || !ctx.formData?.brandId,
                getOptions: (ctx) =>
                  toModelOptions(
                    filterModels(ctx.enums?.vehicleModels || [], {
                      typeId: ctx.formData?.vehicleTypeId,
                      brandId: ctx.formData?.brandId,
                    }),
                  ),
                onChange: syncModelBrandType,
              },
              {
                name: 'vehicleGenerationId',
                label: 'Generation / Kasa',
                type: 'enum',
                enumKey: 'vehicleGenerations',
                requiredWhen: (ctx) => showGenerationFields(ctx),
                visibleWhen: showGenerationFields,
                disabledWhen: (ctx) => !ctx.formData?.vehicleModelId,
                getOptions: (ctx) =>
                  toLookupOptions(generationsForModel(ctx.enums, ctx.formData?.vehicleModelId)),
                onChange: ({ value, ctx }) => {
                  ctx.setValue('vehicleGenerationId', value);
                  ctx.setValue('vehicleEngineId', '');
                  ctx.setValue('vehicleTrimId', '');
                },
              },
              {
                name: 'vehicleEngineId',
                label: 'Engine / Motor',
                type: 'enum',
                enumKey: 'vehicleEngines',
                requiredWhen: (ctx) => showEngineFields(ctx),
                visibleWhen: showEngineFields,
                disabledWhen: (ctx) => !ctx.formData?.vehicleGenerationId,
                getOptions: (ctx) =>
                  toLookupOptions(enginesForGeneration(ctx.enums, ctx.formData?.vehicleGenerationId)),
                onChange: onEnginePicked,
              },
              {
                name: 'vehicleTrimId',
                label: 'Trim / Donanım',
                type: 'enum',
                enumKey: 'vehicleTrims',
                visibleWhen: showTrimFields,
                disabledWhen: (ctx) => !ctx.formData?.vehicleGenerationId,
                getOptions: (ctx) =>
                  toLookupOptions(trimsForGeneration(ctx.enums, ctx.formData?.vehicleGenerationId)),
              },
              { name: 'year', label: 'Year', type: 'number', required: true, min: 1950, max: new Date().getFullYear() + 1 },
              {
                name: 'fuelType',
                label: 'Fuel Type',
                type: 'enum',
                enumKey: 'fuelTypes',
                required: true,
                visibleWhen: (ctx) => ['CAR', 'MOTORCYCLE', 'OTHER'].includes(getVehicleTypeName(ctx)),
              },
              { name: 'color', label: 'Color', type: 'enum', enumKey: 'colors' },
              {
                name: 'doors',
                label: 'Door Count',
                type: 'enum',
                enumKey: 'doors',
                visibleWhen: (ctx) => isCarVehicle(ctx),
              },
              {
                name: 'gearbox',
                label: 'Gearbox',
                type: 'enum',
                enumKey: 'gearTypes',
                required: true,
                visibleWhen: (ctx) => isCarVehicle(ctx),
              },
              {
                name: 'seatCount',
                label: 'Seat Count',
                type: 'enum',
                enumKey: 'seatCounts',
                visibleWhen: (ctx) => isCarVehicle(ctx),
              },
              {
                name: 'drivetrain',
                label: 'Drivetrain',
                type: 'enum',
                enumKey: 'drivetrains',
                visibleWhen: (ctx) => isCarVehicle(ctx),
              },
              {
                name: 'bodyType',
                label: 'Body Type',
                type: 'enum',
                enumKey: 'bodyTypes',
                required: true,
                visibleWhen: (ctx) => isCarVehicle(ctx),
              },
            ],
          },
          {
            id: 'vehicle-tech',
            title: 'Technical Specifications',
            description: 'Engine, performance and other technical details',
            fields: [
              {
                name: 'mileage',
                label: 'Kilometer (km)',
                type: 'number',
                visibleWhen: (ctx) => ['CAR', 'MOTORCYCLE', 'OTHER'].includes(getVehicleTypeName(ctx)),
              },
              {
                name: 'engineCapacity',
                label: 'Engine Capacity (cc)',
                type: 'number',
                requiredWhen: (ctx) => ['MOTORCYCLE'].includes(getVehicleTypeName(ctx)),
                visibleWhen: (ctx) => ['CAR', 'MOTORCYCLE', 'OTHER'].includes(getVehicleTypeName(ctx)),
              },
              {
                name: 'horsePower',
                label: 'Horse Power',
                type: 'number',
                visibleWhen: (ctx) => ['CAR', 'OTHER'].includes(getVehicleTypeName(ctx)),
              },
              { name: 'wheels', label: 'Wheel Size (inch)', type: 'number' },
              {
                name: 'fuelCapacity',
                label: 'Fuel Capacity (L)',
                type: 'number',
                visibleWhen: (ctx) => ['CAR', 'OTHER'].includes(getVehicleTypeName(ctx)),
              },
              {
                name: 'fuelConsumption',
                label: 'Fuel Consumption (L/100km)',
                type: 'number',
                visibleWhen: (ctx) => ['CAR', 'OTHER'].includes(getVehicleTypeName(ctx)),
              },
              {
                name: 'inspectionValidUntil',
                label: 'Inspection Valid Until',
                type: 'date',
                visibleWhen: (ctx) => ['CAR', 'OTHER'].includes(getVehicleTypeName(ctx)),
              },
            ],
          },
          {
            id: 'vehicle-extras',
            title: 'Additional Information',
            description: 'Accident history and swap status',
            fields: [
              { name: 'accidentHistory', label: 'This vehicle has accident history', type: 'toggle' },
              {
                name: 'accidentDetails',
                label: 'Accident Details',
                type: 'textarea',
                rows: 3,
                placeholder: 'Describe the accident or damage details...',
                fullWidth: true,
                visibleWhen: (ctx) => Boolean(ctx.formData?.accidentHistory),
              },
              { name: 'swap', label: 'Open To Swap', description: 'Check if you are willing to swap', type: 'toggle' },
            ],
          },
        ],
      },
      { id: 3, title: 'Location', description: 'Set the location of your item', kind: 'mediaLocation' },
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
        if (modelBrandId && String(ctx.formData?._modelBrandId ?? '') !== modelBrandId) {
          ctx.setValue('_modelBrandId', modelBrandId);
        }
        if (modelTypeId && String(ctx.formData?._modelTypeId ?? '') !== modelTypeId) {
          ctx.setValue('_modelTypeId', modelTypeId);
        }
        const engineId = ctx.formData?.vehicleEngineId;
        if (engineId) {
          const eng = findEngine(ctx.enums, engineId);
          if (eng?.fuelType && ctx.formData?.fuelType !== eng.fuelType) {
            ctx.setValue('fuelType', eng.fuelType);
          }
        }
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
          if (showGenerationFields(ctx) && !ctx.formData?.vehicleGenerationId) {
            errors.vehicleGenerationId = 'Please select a generation';
          }
          if (showEngineFields(ctx) && !ctx.formData?.vehicleEngineId) {
            errors.vehicleEngineId = 'Please select an engine variant';
          }
          return errors;
        },
      },
    ],
    getTitle: ({ isEdit }) => (isEdit ? 'Edit Vehicle Listing' : 'Create Vehicle Listing'),
    getSubtitle: ({ isEdit }) =>
      isEdit ? 'Update your vehicle listing details' : 'Create your vehicle listing step by step',
    normalizeInitialData: (data) => {
      if (!data) return null;
      return {
        ...data,
        brandId: data?.brandId || data?.brand?.id || '',
        vehicleModelId: data?.vehicleModelId || data?.model?.id || '',
        vehicleTypeId: data?.vehicleTypeId || data?.vehicleType?.id || '',
        vehicleGenerationId: data?.vehicleGenerationId || data?.generation?.id || '',
        vehicleEngineId: data?.vehicleEngineId || data?.engine?.id || '',
        vehicleTrimId: data?.vehicleTrimId || data?.trim?.id || '',
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
        description: 'Select a brand to narrow options.',
        kind: 'grid',
        dependsOn: ['vehicleTypeId'],
        paramKey: 'brandIds',
        getOptions: ({ enums, selection }) => {
          const allBrands = enums?.carBrands || [];
          const typeId = selection?.vehicleTypeId;
          if (!typeId) return allBrands;
          const ids = brandIdsForType(enums?.vehicleModels || [], typeId);
          if (ids.size === 0) return allBrands;
          return allBrands.filter((b) => ids.has(String(b?.id ?? '')));
        },
      },
      {
        enumKey: 'bodyTypes',
        initialDataKey: 'bodyType',
        title: 'Kasa Tipi / Body Type',
        description: 'Select body type.',
        kind: 'grid',
        dependsOn: ['brandId', 'vehicleTypeId'],
        paramKey: 'bodyType',
        visibleWhen: (ctx) => isCarVehicle(ctx),
        getOptions: ({ enums, selection }) => bodyTypeOptions(enums, selection?.brandId),
      },
      {
        enumKey: 'vehicleModels',
        initialDataKey: 'vehicleModelId',
        title: 'Choose model',
        description: 'Select model series.',
        kind: 'grid',
        dependsOn: ['brandId', 'bodyType', 'vehicleTypeId'],
        paramKey: 'vehicleModelIds',
        getOptions: ({ enums, selection }) =>
          toModelOptions(
            filterModels(enums?.vehicleModels || [], {
              brandId: selection?.brandId,
              typeId: selection?.vehicleTypeId,
              bodyType: isCarVehicle({ enums, selection }) ? selection?.bodyType : undefined,
            }),
          ),
      },
      {
        enumKey: 'vehicleGenerations',
        initialDataKey: 'vehicleGenerationId',
        title: 'Kasa / Generation',
        description: 'Select model generation.',
        kind: 'grid',
        dependsOn: ['vehicleModelId'],
        paramKey: 'vehicleGenerationId',
        visibleWhen: showGenerationFields,
        getOptions: ({ enums, selection }) =>
          toLookupOptions(generationsForModel(enums, selection?.vehicleModelId)),
      },
      {
        enumKey: 'vehicleEngines',
        initialDataKey: 'vehicleEngineId',
        title: 'Motor / Engine',
        description: 'Select engine variant.',
        kind: 'grid',
        dependsOn: ['vehicleGenerationId'],
        paramKey: 'vehicleEngineId',
        visibleWhen: showEngineFields,
        getOptions: ({ enums, selection }) =>
          toLookupOptions(enginesForGeneration(enums, selection?.vehicleGenerationId)),
      },
      {
        enumKey: 'vehicleTrims',
        initialDataKey: 'vehicleTrimId',
        title: 'Donanım / Trim',
        description: 'Select trim package (optional).',
        kind: 'grid',
        dependsOn: ['vehicleGenerationId'],
        paramKey: 'vehicleTrimId',
        optional: true,
        visibleWhen: showTrimFields,
        getOptions: ({ enums, selection }) =>
          toLookupOptions(trimsForGeneration(enums, selection?.vehicleGenerationId)),
      },
      {
        enumKey: 'colors',
        initialDataKey: 'color',
        title: 'Choose color',
        description: 'Select color.',
        kind: 'grid',
        dependsOn: ['vehicleModelId'],
        paramKey: 'color',
        prefilter: false,
      },
    ],
  },
  filterConfig: filterConfigs.VEHICLE,
  sortOptions: [
    { value: 'year', label: 'Year' },
    { value: 'mileage', label: 'Mileage' },
    { value: 'brand', label: 'Brand' },
    { value: 'price', label: 'Price' },
    { value: 'createdAt', label: 'Date Added' },
  ],
  compactBadges: (listing) =>
    [
      { label: listing.brand?.label || listing.brand?.name || listing.brand, icon: '🚗', show: !!listing.brand },
      { label: listing.generation?.name || listing.generation?.label, icon: '🏷️', show: !!(listing.generation?.name || listing.generation?.label) },
      { label: listing.year, icon: '📅', show: !!listing.year },
      { label: listing.mileage ? `${listing.mileage.toLocaleString('tr-TR')} km` : null, icon: '🛣️', show: !!listing.mileage },
      { label: listing.fuelType, icon: '⛽', show: !!listing.fuelType },
    ].filter((badge) => badge.show),
  defaultFilters: { minYear: 1980, maxYear: new Date().getFullYear() },
};
