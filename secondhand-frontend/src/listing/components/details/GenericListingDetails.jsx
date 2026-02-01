import React, { useMemo, useState } from 'react';
import { useEnums } from '../../../common/hooks/useEnums.js';
import { getListingConfig } from '../../config/listingConfig.js';

const toDisplayText = (value, enums, enumKey) => {
  if (value === null || value === undefined) return null;

  if (Array.isArray(value)) {
    const parts = value
      .map((v) => toDisplayText(v, enums, enumKey))
      .filter((v) => v !== null && v !== undefined && String(v).trim() !== '');
    return parts.length ? parts.join(', ') : null;
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'object') {
    if (value.label) return String(value.label);
    if (value.name) return String(value.name);
    if (value.value) return String(value.value);
    if (value.id != null && enumKey) {
      const list = enums?.[enumKey] || [];
      const found = list.find((o) => (o.id || o.value) === value.id);
      return found?.label || found?.name || String(value.id);
    }
    return null;
  }

  if (enumKey) {
    const list = enums?.[enumKey] || [];
    const found = list.find((o) => (o.id || o.value) === value);
    if (found) return found.label || found.name || String(value);
  }

  return String(value);
};

const getValueByPath = (obj, path) => {
  if (!obj || !path) return undefined;
  if (typeof path !== 'string') return undefined;

  return path.split('.').reduce((acc, key) => {
    if (acc == null) return undefined;
    return acc[key];
  }, obj);
};

const DetailItem = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-text-muted">{label}</dt>
    <dd className="mt-1 text-sm text-text-primary">{value || '-'}</dd>
  </div>
);

const GenericListingDetails = ({ listing }) => {
  const { enums } = useEnums();

  const config = useMemo(() => getListingConfig(listing?.type), [listing?.type]);
  const schema = config?.detailsSchema;

  const sections = useMemo(() => {
    if (!schema) return [];
    if (Array.isArray(schema.sections)) return schema.sections;
    if (Array.isArray(schema.fields)) return [{ id: 'details', label: 'Details', title: schema.title, fields: schema.fields }];
    return [];
  }, [schema]);

  const [activeSection, setActiveSection] = useState(sections[0]?.id || 'details');

  const active = useMemo(() => sections.find((s) => s.id === activeSection) || sections[0], [sections, activeSection]);

  if (!schema || !sections.length) return null;

  const title = schema.title || config?.label || 'Details';

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
        {sections.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {sections.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`px-3 py-1.5 text-sm rounded border ${
                  activeSection === tab.id
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {active?.title ? <h4 className="text-sm font-semibold text-text-muted mb-3">{active.title}</h4> : null}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(active?.fields || []).map((field) => {
          const raw = field.key ? getValueByPath(listing, field.key) : undefined;
          const resolved = typeof field.format === 'function' ? field.format(listing, raw) : toDisplayText(raw, enums, field.enumKey);
          return <DetailItem key={field.key || field.label} label={field.label} value={resolved} />;
        })}
      </div>
    </div>
  );
};

export default GenericListingDetails;

