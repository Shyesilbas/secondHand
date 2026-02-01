# Adding a New Listing Type (Frontend Guide)

This document describes the **minimum required frontend changes** when a new `listingType` (category) is introduced.

The current architecture is **configuration-driven**:
- **Create/Edit UI** is rendered by `GenericListingForm` using `listingConfig.js -> formSchema`
- **Details UI** is rendered by `GenericListingDetails` using `listingConfig.js -> detailsSchema`
- **Validation** is schema-based via `listing/validation/ValidationRegistry.js` reading `formSchema`
- **Filtering** is schema-driven via `components/filters/filterConfigs.js` + `listingService.serializeFilters`

## 1) Create the domain module (new folder)

Create a new package under `src/` (example: `secondhand-frontend/src/furniture/`).

Typical structure (match existing modules like `books/`, `sports/`, `realEstate/`):
- `components/<Type>CreateForm.jsx` (thin wrapper around `GenericListingForm`)
- `hooks/use<Type>.js` (optional but preferred; wraps `useEntity` + service adapter)
- `services/<type>Service.js` (API calls; create/update/getById/filter)
- `<type>.js` or `<types>.js` (DTO + request builders used by the service)

## 2) Add API wiring (service + request builders)

### 2.1 Service
Implement the service functions that `listingConfig.js` expects:
- `getById(id)`
- `update(id, payload)`

And for create:
- `create<Type>Listing(payload)`

Your service should build the backend payload using the existing request builders (examples: `createBooksCreateRequest`, `createRealEstateUpdateRequest`).

### 2.2 Request builder
Add/create the functions that map form data to backend payload:
- `create<Type>CreateRequest(formData)`
- `create<Type>UpdateRequest(formData)`

Make sure field names match backend DTO names.

## 3) Create the CreateForm component (thin wrapper)

Create `src/<type>/components/<Type>CreateForm.jsx` that only:
- calls your create hook/service (`create<Type>`)
- renders `GenericListingForm` with `listingType="<NEW_TYPE>"`

Do not put conditional UI logic here; put it into `formSchema` instead.

## 4) Add Filter schema (search/filter sidebar)

Update:
- `listing/components/filters/filterConfigs.js`

Add a new entry to `filterConfigs` for the new listing type and define fields using `FilterConfig`:
- `addEnumField(...)`
- `addNumericRangeField(...)`
- `addTextField(...)`
- `addDateRangeField(...)`

Notes:
- The filter config is used by both:
  - `FilterSidebar` via `FilterRenderer`
  - `listingService.serializeFilters` to build the backend filter payload
- The `key` values in the filter config must match what `serializeFilters` expects (and what the backend expects).

## 5) Register the new type in `listing/config/listingConfig.js`

Add a new entry to `listingTypeConfig` with at least:
- **UI**
  - `label`
  - `icon`
  - `description`
- **Details**
  - `detailsComponent: GenericListingDetails`
  - `detailsSchema` (sections/fields)
- **Create/Edit**
  - `createComponent: <Type>CreateForm`
  - `formSchema` (see below)
- **Services**
  - `service.getById`
  - `service.update`
- **Filtering**
  - `filterConfig: filterConfigs.<NEW_TYPE>`
  - `sortOptions`
  - `defaultFilters` (optional)
- **Badges**
  - `compactBadges(listing)` (optional but recommended)
- **Subtype selection** (optional)
  - `createFlow.subtypeSelector` if the type has a subtype enum

### 5.1 `detailsSchema`
Used by `GenericListingDetails`. Define either:
- `detailsSchema.fields` (flat)
or
- `detailsSchema.sections[]` (recommended)

Each field supports:
- `label`
- `key`
- `enumKey` (optional)
- `format(listing, value)` (optional)

### 5.2 `formSchema` (the most important part)
Used by `GenericListingForm` + schema-based validation.

Required properties:
- `initialData` (default form state)
- `steps[]` where:
  - Step 1 should be `{ kind: 'basics' }`
  - Step 2+ should be `{ kind: 'details', sections: [...] }`
  - Last step should be `{ kind: 'mediaLocation' }`

Fields inside sections support:
- **render**
  - `name`, `label`, `type` (`text` | `number` | `date` | `enum` | `searchable` | `toggle` | `textarea`)
  - `enumKey` (for `enum`)
  - `getOptions(ctx)` (optional)
  - `disabledWhen(ctx)` / `visibleWhen(ctx)` (optional)
  - `placeholder`, `min`, `max`, `step`, `rows` (optional)
- **validation**
  - `required: true`
  - `requiredWhen(ctx)` (conditional required)
  - `min`/`max` for numbers
  - `validate(value, ctx)` for field-level custom errors

Optional helpers:
- `derivedFields[]` to mirror enum selection into hidden flags (example: `_typeName`)
- `effects[]` to clear dependent fields when some selection changes
- `customValidators[]` for cross-field rules (e.g., “model must belong to brand”)

## 6) Ensure it appears in Create flow

`CreateListingPage.jsx` uses `createFormRegistry` exported from `listingConfig.js`.

Once your new type is added to `listingTypeConfig`, it will automatically:
- show up in the category selection UI
- route into your new CreateForm

## 7) Ensure it works in Browse + My Listings

### 7.1 Browse (`ListingsPage`)
No extra work if:
- `listingTypeConfig` entry exists
- `filterConfig` exists
- backend supports `LISTINGS.FILTER` for that type

### 7.2 My Listings (`MyListingsPage`)
The engine uses `listingService.getMyListings(page, size, listingType)`.

If the new type has `quantity` and should participate in the “Low Stock” alert:
- it should not be treated like `VEHICLE` / `REAL_ESTATE`
- confirm `listing.quantity` is returned by backend for this type

## 8) Final checklist

- [ ] Backend returns the new type in listing type enums (so UI shows it)
- [ ] `listingConfig.js` has new `listingTypeConfig[NEW_TYPE]`
- [ ] `filterConfigs.js` has `filterConfigs[NEW_TYPE]`
- [ ] Service exists and `listingConfig.service.getById/update` are correct
- [ ] Create form is a thin wrapper using `GenericListingForm`
- [ ] `formSchema` has correct fields + rules (required/min/max/conditional)
- [ ] Build passes: `npm run build`

