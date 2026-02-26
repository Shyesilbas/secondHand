import GenericListingDetails from '../components/details/GenericListingDetails.jsx';
import VehicleCreateForm from '../../vehicle/components/VehicleCreateForm.jsx';
import {vehicleService} from '../../vehicle/services/vehicleService.js';
import {VehicleCreateRequestDTO} from '../../vehicle/vehicles.js';
import {filterConfigs} from '../components/filters/filterConfigs.js';

export const vehicleConfig = {
  label: 'Vehicle',
  icon: '🚗',
  description: 'Cars, motorcycles, bicycles and other vehicles',

  detailsComponent: GenericListingDetails,
  detailsSchema: {
    title: 'Vehicle Information',
    sections: [
      {
        id: 'basic', label: 'Basic', title: 'Basic',
        fields: [
          { label: 'Brand', key: 'brand', enumKey: 'carBrands' },
          { label: 'Model', key: 'model' },
          { label: 'Year', key: 'year' },
          { label: 'Color', key: 'color', enumKey: 'colors' },
        ],
      },
      {
        id: 'mechanical', label: 'Mechanical', title: 'Mechanical',
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
        id: 'usage', label: 'Usage', title: 'Usage',
        fields: [
          { label: 'Kilometer', key: 'mileage', format: (_listing, v) => (v ? `${Number(v).toLocaleString('tr-TR')} km` : null) },
          { label: 'Fuel Consumption', key: 'fuelConsumption', format: (_listing, v) => (v ? `${v} L/100km` : null) },
          { label: 'Kilometers/Liter', key: 'kilometersPerLiter', format: (_listing, v) => (v ? `${v} km/L` : null) },
          { label: 'Wheels', key: 'wheels', format: (_listing, v) => (v ? `${v}"` : null) },
        ],
      },
      {
        id: 'history', label: 'History', title: 'History',
        fields: [
          { label: 'Accident History', key: 'accidentHistory', format: (_listing, v) => (v === true ? 'Yes' : v === false ? 'No' : null) },
          { label: 'Accident Details', key: 'accidentDetails' },
          { label: 'Inspection Valid Until', key: 'inspectionValidUntil' },
        ],
      },
      {
        id: 'extras', label: 'Extras', title: 'Extras',
        fields: [{ label: 'Open To Swap', key: 'swap', format: (_listing, v) => (v ? 'Yes' : 'No') }],
      },
    ],
  },
  createComponent: VehicleCreateForm,
  formSchema: {
    initialData: {
      ...VehicleCreateRequestDTO,
      title: '', description: '', price: '', year: '', mileage: '',
      engineCapacity: '', wheels: '', fuelCapacity: '', fuelConsumption: '',
      horsePower: '', kilometersPerLiter: '',
    },
    steps: [
      { id: 1, title: 'Basic Information', description: 'Set the title, description and price of your listing', kind: 'basics', showQuantity: false },
      {
        id: 2, title: 'Vehicle Specifications', description: 'Specify the technical details of your vehicle', kind: 'details',
        sections: [
          {
            id: 'vehicle-basic', title: 'Basic Information', description: 'Brand, model and basic features of the vehicle',
            fields: [
              {
                name: 'vehicleTypeId', label: 'Vehicle Type', type: 'enum', enumKey: 'vehicleTypes', required: true,
                onChange: ({ value, ctx }) => { ctx.setValue('vehicleTypeId', value); ctx.setValue('brandId', ''); ctx.setValue('vehicleModelId', ''); },
              },
              {
                name: 'brandId', label: 'Brand', type: 'enum', enumKey: 'carBrands', required: true,
                getOptions: (ctx) => {
                  const allBrands = ctx.enums?.carBrands || [];
                  const typeId = ctx.formData?.vehicleTypeId;
                  if (!typeId) return allBrands;
                  const models = ctx.enums?.vehicleModels || [];
                  const ids = new Set(models.filter((m) => String(m?.typeId ?? m?.type_id ?? '') === String(typeId)).map((m) => m?.brandId ?? m?.brand_id).filter(Boolean).map((x) => String(x)));
                  if (ids.size === 0) return allBrands;
                  const filtered = allBrands.filter((b) => ids.has(String(b?.id ?? b?.value ?? '')));
                  return filtered.length > 0 ? filtered : allBrands;
                },
                onChange: ({ value, ctx }) => { ctx.setValue('brandId', value); ctx.setValue('vehicleModelId', ''); },
              },
              {
                name: 'vehicleModelId', label: 'Model', type: 'searchable', required: true,
                disabledWhen: (ctx) => !ctx.formData?.vehicleTypeId || !ctx.formData?.brandId,
                getOptions: (ctx) => {
                  const typeId = ctx.formData?.vehicleTypeId;
                  const brandId = ctx.formData?.brandId;
                  const models = ctx.enums?.vehicleModels || [];
                  return models
                    .filter((m) => { const b = m?.brandId ?? m?.brand_id; const t = m?.typeId ?? m?.type_id; if (typeId && String(t) !== String(typeId)) return false; if (brandId && String(b) !== String(brandId)) return false; return true; })
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
              { name: 'year', label: 'Year', type: 'number', required: true, min: 1950, max: new Date().getFullYear() + 1 },
              { name: 'fuelType', label: 'Fuel Type', type: 'enum', enumKey: 'fuelTypes', required: true, visibleWhen: (ctx) => ['CAR', 'MOTORCYCLE', 'SCOOTER', 'TRUCK', 'VAN', 'OTHER'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()) },
              { name: 'color', label: 'Color', type: 'enum', enumKey: 'colors' },
              { name: 'doors', label: 'Door Count', type: 'enum', enumKey: 'doors', visibleWhen: (ctx) => ['CAR', 'TRUCK', 'VAN'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()) },
              { name: 'gearbox', label: 'Gearbox', type: 'enum', enumKey: 'gearTypes', required: true, visibleWhen: (ctx) => String(ctx.formData?._vehicleTypeName || '').toUpperCase() === 'CAR' },
              { name: 'seatCount', label: 'Seat Count', type: 'enum', enumKey: 'seatCounts', visibleWhen: (ctx) => ['CAR', 'TRUCK', 'VAN'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()) },
              { name: 'drivetrain', label: 'Drivetrain', type: 'enum', enumKey: 'drivetrains', visibleWhen: (ctx) => String(ctx.formData?._vehicleTypeName || '').toUpperCase() === 'CAR' },
              { name: 'bodyType', label: 'Body Type', type: 'enum', enumKey: 'bodyTypes', required: true, visibleWhen: (ctx) => String(ctx.formData?._vehicleTypeName || '').toUpperCase() === 'CAR' },
            ],
          },
          {
            id: 'vehicle-tech', title: 'Technical Specifications', description: 'Engine, performance and other technical details',
            fields: [
              { name: 'mileage', label: 'Kilometer (km)', type: 'number', visibleWhen: (ctx) => ['CAR', 'MOTORCYCLE', 'SCOOTER', 'TRUCK', 'VAN', 'OTHER'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()) },
              { name: 'engineCapacity', label: 'Engine Capacity (cc)', type: 'number', requiredWhen: (ctx) => ['MOTORCYCLE', 'SCOOTER'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()), visibleWhen: (ctx) => ['CAR', 'MOTORCYCLE', 'SCOOTER', 'TRUCK', 'VAN', 'OTHER'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()) },
              { name: 'horsePower', label: 'Horse Power', type: 'number', visibleWhen: (ctx) => ['CAR', 'TRUCK', 'VAN', 'OTHER'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()) },
              { name: 'wheels', label: 'Wheel Size (inch)', type: 'number' },
              { name: 'fuelCapacity', label: 'Fuel Capacity (L)', type: 'number', visibleWhen: (ctx) => ['CAR', 'TRUCK', 'VAN', 'OTHER'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()) },
              { name: 'fuelConsumption', label: 'Fuel Consumption (L/100km)', type: 'number', visibleWhen: (ctx) => ['CAR', 'TRUCK', 'VAN', 'OTHER'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()) },
              { name: 'inspectionValidUntil', label: 'Inspection Valid Until', type: 'date', visibleWhen: (ctx) => ['CAR', 'TRUCK', 'VAN', 'OTHER'].includes(String(ctx.formData?._vehicleTypeName || '').toUpperCase()) },
            ],
          },
          {
            id: 'vehicle-extras', title: 'Additional Information', description: 'Accident history and swap status',
            fields: [
              { name: 'accidentHistory', label: 'This vehicle has accident history', type: 'toggle' },
              { name: 'accidentDetails', label: 'Accident Details', type: 'textarea', rows: 3, placeholder: 'Describe the accident or damage details...', fullWidth: true, visibleWhen: (ctx) => Boolean(ctx.formData?.accidentHistory) },
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
          if (modelId && typeId && modelTypeId && String(modelTypeId) !== String(typeId)) errors.vehicleModelId = 'Selected model does not belong to selected vehicle type';
          if (modelId && brandId && modelBrandId && String(modelBrandId) !== String(brandId)) errors.vehicleModelId = 'Selected model does not belong to selected brand';
          return errors;
        },
      },
    ],
    getTitle: ({ isEdit }) => (isEdit ? 'Edit Vehicle Listing' : 'Create Vehicle Listing'),
    getSubtitle: ({ isEdit }) => (isEdit ? 'Update your vehicle listing details' : 'Create your vehicle listing step by step'),
    normalizeInitialData: (data) => {
      if (!data) return null;
      return { ...data, brandId: data?.brandId || data?.brand?.id || '', vehicleModelId: data?.vehicleModelId || data?.model?.id || '', vehicleTypeId: data?.vehicleTypeId || data?.vehicleType?.id || '' };
    },
  },
  service: {
    getById: (id) => vehicleService.getVehicleById(id),
    update: (id, payload) => vehicleService.updateVehicleListing(id, payload),
  },
  createFlow: {
    subtypeSelector: { enumKey: 'vehicleTypes', queryParamKey: 'vehicleTypeId', initialDataKey: 'vehicleTypeId', title: 'Choose vehicle type', description: 'Select a type to tailor the form fields.', paramKey: 'vehicleTypeIds' },
    preFormSelectors: [
      {
        enumKey: 'carBrands', initialDataKey: 'brandId', title: 'Choose brand', description: 'Select a brand to narrow model options.', kind: 'searchable', dependsOn: ['vehicleTypeId'], paramKey: 'brandIds',
        getOptions: ({ enums, selection }) => {
          const allBrands = enums?.carBrands || [];
          const typeId = selection?.vehicleTypeId;
          if (!typeId) return allBrands;
          const models = enums?.vehicleModels || [];
          const brandIds = new Set(models.filter((m) => String(m?.typeId ?? m?.type_id ?? '') === String(typeId)).map((m) => m?.brandId ?? m?.brand_id).filter(Boolean).map((x) => String(x)));
          if (brandIds.size === 0) return allBrands;
          return allBrands.filter((b) => brandIds.has(String(b?.id ?? b?.value ?? '')));
        },
      },
      {
        enumKey: 'vehicleModels', initialDataKey: 'vehicleModelId', title: 'Choose model', description: 'Select a model to tailor the form fields.', kind: 'searchable', dependsOn: ['vehicleTypeId', 'brandId'], paramKey: 'vehicleModelIds',
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
    { value: 'year', label: 'Year' }, { value: 'mileage', label: 'Mileage' },
    { value: 'brand', label: 'Brand' }, { value: 'price', label: 'Price' },
    { value: 'createdAt', label: 'Date Added' },
  ],
  compactBadges: (listing) => [
    { label: listing.brand?.label || listing.brand?.name || listing.brand, icon: '🚗', show: !!listing.brand },
    { label: listing.year, icon: '📅', show: !!listing.year },
    { label: listing.mileage ? `${listing.mileage.toLocaleString('tr-TR')} km` : null, icon: '🛣️', show: !!listing.mileage },
    { label: listing.fuelType, icon: '⛽', show: !!listing.fuelType },
  ].filter(badge => badge.show),
  defaultFilters: { minYear: 1980, maxYear: new Date().getFullYear() },
};

