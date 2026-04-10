import React, { useMemo } from 'react';
import { useEnums } from '../../../common/hooks/useEnums.js';
import { getPrefilterSelectors } from '../../config/listingConfig.js';
import PrefilterOptionField from './PrefilterOptionField.jsx';

const PrefilterFieldsFromConfig = ({ listingType, value, onChange }) => {
  const { enums } = useEnums();
  const selectors = useMemo(() => getPrefilterSelectors(listingType), [listingType]);

  const handleFieldChange = (selector, newVal) => {
    const patch = { [selector.initialDataKey]: newVal ?? '' };
    selectors.forEach((s) => {
      if (s.dependsOn?.includes(selector.initialDataKey)) patch[s.initialDataKey] = '';
    });
    onChange(patch);
  };

  const dependencyLabel = (dependsOnKey) => {
    const parent = selectors.find((s) => s.initialDataKey === dependsOnKey);
    return parent?.label || dependsOnKey;
  };

  if (!selectors.length) return null;

  return (
    <div className="flex flex-col gap-4">
      {selectors.map((sel) => {
        const fieldValue = value[sel.initialDataKey] ?? '';
        const missingDeps = (sel.dependsOn || []).filter((key) => !value[key]);
        const disabled = missingDeps.length > 0;
        const options = sel.getOptions
          ? sel.getOptions({ enums, selection: value })
          : (enums?.[sel.enumKey] || []);

        const hint =
          missingDeps.length > 0
            ? `Select ${missingDeps.map((k) => `"${dependencyLabel(k)}"`).join(' and ')} first.`
            : null;

        return (
          <PrefilterOptionField
            key={sel.initialDataKey}
            selector={sel}
            fieldValue={fieldValue}
            disabled={disabled}
            options={options}
            dependencyHint={hint}
            onSelect={(v) => handleFieldChange(sel, v)}
          />
        );
      })}
    </div>
  );
};

export default PrefilterFieldsFromConfig;
