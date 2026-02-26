import GenericListingDetails from '../components/details/GenericListingDetails.jsx';
import ClothingCreateForm from '../../clothing/components/ClothingCreateForm.jsx';
import {clothingService} from '../../clothing/services/clothingService.js';
import {filterConfigs} from '../components/filters/filterConfigs.js';

export const clothingConfig = {
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
      { label: 'Purchase Year', key: 'purchaseDate', format: (_listing, v) => (v ? String(new Date(v).getFullYear()) : null) },
    ],
  },
  createComponent: ClothingCreateForm,
  formSchema: {
    initialData: {
      title: '', description: '', price: '', currency: 'TRY', quantity: 1,
      brandId: '', clothingTypeId: '', _clothingTypeName: '', color: '', condition: '',
      size: '', shoeSizeEu: '', material: '', clothingGender: '', clothingCategory: '',
      purchaseYear: '', city: '', district: '', imageUrl: '',
    },
    steps: [
      { id: 1, title: 'Basic Information', description: 'Set the title, description and price of your listing', kind: 'basics', showQuantity: true },
      {
        id: 2, title: 'Clothing Specifications', description: 'Specify the details of your clothing item', kind: 'details',
        sections: [
          {
            id: 'clothing-details', title: 'Product Details', description: 'Book information and features',
            fields: [
              { name: 'brandId', label: 'Brand', type: 'enum', enumKey: 'clothingBrands', required: true },
              { name: 'clothingTypeId', label: 'Type', type: 'enum', enumKey: 'clothingTypes', required: true },
              { name: 'color', label: 'Color', type: 'enum', enumKey: 'colors', required: true },
              { name: 'condition', label: 'Condition', type: 'enum', enumKey: 'clothingConditions', required: true },
              { name: 'clothingGender', label: 'Clothing Gender', type: 'enum', enumKey: 'clothingGenders', required: true },
              { name: 'clothingCategory', label: 'Clothing Category', type: 'enum', enumKey: 'clothingCategories', required: true },
              {
                name: 'size', label: 'Size', type: 'enum', enumKey: 'clothingSizes', required: true,
                visibleWhen: (ctx) => {
                  const t = String(ctx.formData?._clothingTypeName || '').toUpperCase();
                  const footwear = ['SHOES', 'SNEAKERS', 'BOOTS', 'SANDALS', 'HEELS', 'FLATS'].includes(t);
                  const accessory = ['HAT', 'CAP', 'SCARF', 'GLOVES', 'BELT', 'TIE', 'BAG'].includes(t);
                  return Boolean(t) && !footwear && !accessory;
                },
              },
              {
                name: 'shoeSizeEu', label: 'Shoe Size (EU)', type: 'number', required: true, min: 20, max: 55,
                visibleWhen: (ctx) => ['SHOES', 'SNEAKERS', 'BOOTS', 'SANDALS', 'HEELS', 'FLATS'].includes(String(ctx.formData?._clothingTypeName || '').toUpperCase()),
              },
              { name: 'material', label: 'Material', type: 'text' },
              { name: 'purchaseYear', label: 'Purchase Year', type: 'number', required: true, min: 1900, max: new Date().getFullYear() },
            ],
          },
        ],
      },
      { id: 3, title: 'Location', description: 'Set the location of your item', kind: 'mediaLocation' },
    ],
    derivedFields: [{ sourceField: 'clothingTypeId', enumKey: 'clothingTypes', targetField: '_clothingTypeName', uppercase: true }],
    effects: [
      (ctx) => {
        const t = String(ctx.formData?._clothingTypeName || '').toUpperCase();
        const footwear = ['SHOES', 'SNEAKERS', 'BOOTS', 'SANDALS', 'HEELS', 'FLATS'].includes(t);
        const accessory = ['HAT', 'CAP', 'SCARF', 'GLOVES', 'BELT', 'TIE', 'BAG'].includes(t);
        const apparel = Boolean(t) && !footwear && !accessory;
        if (footwear && ctx.formData?.size) ctx.setValue('size', '');
        if (apparel && ctx.formData?.shoeSizeEu) ctx.setValue('shoeSizeEu', '');
        if (accessory) { if (ctx.formData?.size) ctx.setValue('size', ''); if (ctx.formData?.shoeSizeEu) ctx.setValue('shoeSizeEu', ''); }
      },
    ],
    getTitle: ({ isEdit }) => (isEdit ? 'Edit Clothing Listing' : 'Create Clothing Listing'),
    getSubtitle: ({ isEdit }) => (isEdit ? 'Update your clothing listing details' : 'Create your clothing listing step by step'),
    normalizeInitialData: (data) => {
      if (!data) return null;
      return { ...data, brandId: data?.brandId || data?.brand?.id || '', clothingTypeId: data?.clothingTypeId || data?.clothingType?.id || '' };
    },
  },
  service: {
    getById: (id) => clothingService.getClothingDetails(id),
    update: (id, payload) => clothingService.updateClothingListing(id, payload),
  },
  createFlow: {
    subtypeSelector: { enumKey: 'clothingTypes', queryParamKey: 'clothingTypeId', initialDataKey: 'clothingTypeId', title: 'Choose clothing type', description: 'Select a type to tailor the form fields.', paramKey: 'types' },
    preFormSelectors: [
      { enumKey: 'clothingBrands', initialDataKey: 'brandId', title: 'Choose brand', description: 'Select a brand to tailor the form fields.', kind: 'searchable', paramKey: 'brands' },
      { enumKey: 'colors', initialDataKey: 'color', title: 'Choose color', description: 'Select a color to tailor the form fields.', kind: 'searchable', dependsOn: ['clothingTypeId'], prefilter: false },
      { enumKey: 'clothingConditions', initialDataKey: 'condition', title: 'Choose condition', description: 'Select a condition to tailor the form fields.', kind: 'grid', dependsOn: ['clothingTypeId'], prefilter: false },
      { enumKey: 'clothingGenders', initialDataKey: 'clothingGender', title: 'Choose clothing gender', description: 'Select a clothing gender to tailor the form fields.', kind: 'grid', dependsOn: ['clothingTypeId'], prefilter: false },
      { enumKey: 'clothingCategories', initialDataKey: 'clothingCategory', title: 'Choose clothing category', description: 'Select a clothing category to tailor the form fields.', kind: 'grid', dependsOn: ['clothingTypeId'], prefilter: false },
    ],
  },
  filterConfig: filterConfigs.CLOTHING,
  sortOptions: [
    { value: 'brand', label: 'Brand' }, { value: 'type', label: 'Type' },
    { value: 'condition', label: 'Condition' }, { value: 'clothingGender', label: 'Clothing Gender' },
    { value: 'clothingCategory', label: 'Clothing Category' }, { value: 'purchaseDate', label: 'Purchase Date' },
    { value: 'price', label: 'Price' }, { value: 'createdAt', label: 'Date Added' },
  ],
  compactBadges: (listing) => [
    { label: listing.brand?.label || listing.brand?.name || listing.brand, icon: '🏷️', show: !!listing.brand },
    { label: listing.clothingType?.label || listing.clothingType?.name || listing.clothingType, icon: '👕', show: !!listing.clothingType },
    { label: listing.color, icon: '🎨', show: !!listing.color },
    { label: listing.condition, icon: '⭐', show: !!listing.condition },
    { label: listing.clothingGender, icon: '👤', show: !!listing.clothingGender },
    { label: listing.clothingCategory, icon: '👶', show: !!listing.clothingCategory },
    { label: listing.purchaseDate ? String(new Date(listing.purchaseDate).getFullYear()) : null, icon: '📅', show: !!listing.purchaseDate },
  ].filter(badge => badge.show),
  defaultFilters: {},
};

