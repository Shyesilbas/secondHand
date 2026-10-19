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

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border-light text-sm">
    <dt className="text-text-secondary font-normal shrink-0">{label}</dt>
    <dd className="font-medium text-text-primary text-right tabular-nums break-words">
      {value || '-'}
    </dd>
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

  const visibleFields = (active?.fields || []).filter((field) => {
    if (typeof field.visibleWhen === 'function') {
      return field.visibleWhen(listing);
    }
    return true;
  });

  const content = (
    <div className="space-y-2">
      {sections.length > 1 && (
        <div className="flex flex-wrap gap-1.5 border-b border-border-light pb-3 mb-2">
          {sections.map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`px-3 py-1.5 text-xs rounded font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-background-secondary text-text-secondary hover:text-text-primary hover:bg-background-tertiary border border-border-light'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {visibleFields.length === 0 ? (
        <p className="text-sm text-text-muted py-3">Belirtilmiş özellik bulunmuyor.</p>
      ) : (
        <dl className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12">
          {visibleFields.map((field) => {
            const raw = field.key ? getValueByPath(listing, field.key) : undefined;
            const resolved =
              typeof field.format === 'function'
                ? field.format(listing, raw)
                : toDisplayText(raw, enums, field.enumKey);
            return <DetailRow key={field.key || field.label} label={field.label} value={resolved} />;
          })}
        </dl>
      )}
    </div>
  );

  if (flat) {
    return <div>{content}</div>;
  }

  return (
    <div className="rounded border border-border bg-background-primary p-6">
      {content}
    </div>
  );
};

export default GenericListingDetails;

