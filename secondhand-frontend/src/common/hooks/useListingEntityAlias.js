import { useEntity } from './useEntity.js';

/**
 * useEntity çıktısını domain isimleriyle eşler (book/vehicle/… tekrarını azaltır).
 * adapter useMemo(() => createXAdapter(svc), []) ile çağrıda sabitlenmeli.
 */
export const useListingEntityAlias = (adapter, options) => {
  const { entityId = null, defaultData, entityName, keys } = options;
  const result = useEntity({
    entityId,
    service: adapter,
    defaultData,
    entityName,
  });
  return {
    ...result,
    [keys.entity]: result.entity,
    [keys.fetch]: result.fetchEntity,
    [keys.create]: result.createEntity,
    [keys.update]: result.updateEntity,
    [keys.delete]: result.deleteEntity,
  };
};
