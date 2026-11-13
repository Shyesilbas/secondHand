# Sports Catalog UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`listing`](../../../src/main/java/com/serhat/secondhand/listing/README.md)
> - **Architecture Deep Dive:** [`docs/catalog-and-category-polymorphism.md`](../../../docs/catalog-and-category-polymorphism.md)

## 1. Scope
Request builders (`sports.js`) and the catalog client (`services/sportsService.js`) for the sports vertical. The form and detail schema live in `listing/config/sportsConfig.js`; the module has no own route or queries.

- **Catalog source:** `src/main/resources/data/sports/sports.json` (29 disciplines, 163 equipment types, 5 conditions). Never hardcode discipline or equipment lists in the frontend.
- **Enum keys:** `sportDisciplines`, `sportEquipmentTypes`, `sportConditions` from `useEnums`.

## 2. Form Rules
- **Discipline -> equipment cascade:** changing `disciplineId` clears `equipmentTypeId`; equipment options are filtered by `disciplineId`, falling back to `OTHER_EQUIPMENT` when a discipline has none (`getEquipmentOptions` in `sportsConfig.js`).
- **Required fields:** `disciplineId`, `equipmentTypeId`, `conditionId`; backend checks them in `SportsRequiredFieldsValidator` and the discipline/equipment match in `SportsHierarchyValidator`.
- **Payloads:** `createSportsCreateRequest` / `createSportsUpdateRequest` wrap the shared listing base payload and send only IDs.
