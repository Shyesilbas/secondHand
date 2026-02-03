import React, { useMemo } from 'react';
import EnumDropdown from '../../../common/components/ui/EnumDropdown.jsx';
import { useEnums } from '../../../common/hooks/useEnums.js';
import { getPrefilterSelectors } from '../../config/listingConfig.js';

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

  if (!selectors.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {selectors.map((sel) => {
        const fieldValue = value[sel.initialDataKey] ?? '';
        const disabled = (sel.dependsOn || []).some((key) => !value[key]);
        const options = sel.getOptions
          ? sel.getOptions({ enums, selection: value })
          : (enums?.[sel.enumKey] || []);

        return (
          <EnumDropdown
            key={sel.initialDataKey}
            label={sel.label}
            enumKey={sel.enumKey}
            value={fieldValue}
            onChange={(v) => handleFieldChange(sel, v)}
            multiple={false}
            className="w-full"
            options={Array.isArray(options) && options.length > 0 ? options : undefined}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
};

export default PrefilterFieldsFromConfig;
