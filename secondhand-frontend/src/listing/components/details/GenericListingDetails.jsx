import { useMemo, useState } from 'react';
import { useEnums } from '../../../common/hooks/useEnums.js';
import { getListingConfig } from '../../config/listingConfig.js';
import { toDisplayText } from '../../utils/listingDisplayFormat.js';

const getValueByPath = (obj, path) => {
 if (!obj || !path) return undefined;
 if (typeof path !== 'string') return undefined;

 return path.split('.').reduce((acc, key) => {
 if (acc == null) return undefined;
 return acc[key];
 }, obj);
};

const DetailItem = ({ label, value }) => (
  <div className="bg-background-secondary/70 border border-border/70 rounded-md p-3.5">
    <dt className="text-xs font-semibold text-text-muted">{label}</dt>
    <dd className="mt-1 text-sm font-semibold text-text-primary">{value || '-'}</dd>
  </div>
);

const GenericListingDetails = ({ listing, flat = false }) => {
  const { enums } = useEnums();

  const config = useMemo(() => getListingConfig(listing?.type), [listing?.type]);
  const schema = config?.detailsSchema;

  const sections = useMemo(() => {
    if (!schema) return [];
    if (Array.isArray(schema.sections)) return schema.sections;
    if (Array.isArray(schema.fields)) return [{ id: 'details', label: 'Genel', fields: schema.fields }];
    return [];
  }, [schema]);

  const [activeSection, setActiveSection] = useState(sections[0]?.id || 'details');

  const active = useMemo(() => sections.find((s) => s.id === activeSection) || sections[0], [sections, activeSection]);

  if (!schema || !sections.length) return null;

  const content = (
    <div className="space-y-4">
      {sections.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {sections.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`px-3 py-1.5 text-xs rounded border font-semibold transition-all cursor-pointer ${
                activeSection === tab.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-secondary border-border hover:border-card-border-hover'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {(active?.fields || [])
          .filter((field) => {
            if (typeof field.visibleWhen === 'function') {
              return field.visibleWhen(listing);
            }
            return true;
          })
          .map((field) => {
            const raw = field.key ? getValueByPath(listing, field.key) : undefined;
            const resolved = typeof field.format === 'function' ? field.format(listing, raw) : toDisplayText(raw, enums, field.enumKey);
            return <DetailItem key={field.key || field.label} label={field.label} value={resolved} />;
          })}
      </div>
    </div>
  );

  if (flat) {
    return <div>{content}</div>;
  }

  return (
    <div className="bg-white rounded-md border border-border p-6">
      {content}
    </div>
  );
};

export default GenericListingDetails;

