import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEnums } from '../../../common/hooks/useEnums.js';
import { getListingConfig } from '../../config/listingConfig.js';
import { toDisplayText } from '../../utils/listingDisplayFormat.js';
import ListingAttributeDetails from '../attributes/ListingAttributeDetails.jsx';
import { detailLabel } from '../../config/listingFormCopy.js';
import { DETAIL_GRID } from './detailGrid.js';

const getValueByPath = (obj, path) => {
  if (!obj || !path) return undefined;
  if (typeof path !== 'string') return undefined;

  return path.split('.').reduce((acc, key) => {
    if (acc == null) return undefined;
    return acc[key];
  }, obj);
};

const DetailRow = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="text-sm text-text-tertiary">{detailLabel(label)}</dt>
    <dd className="mt-1 break-words text-sm font-medium tabular-nums text-text-primary">
      {value || '—'}
    </dd>
  </div>
);

const GenericListingDetails = ({ listing, flat = false }) => {
  const { t } = useTranslation();
  const { enums } = useEnums();

  const config = useMemo(() => getListingConfig(listing?.type), [listing?.type]);
  const schema = config?.detailsSchema;

  const sections = useMemo(() => {
    if (!schema) return [];
    // An attributes tab is shown only when the seller answered something.
    const hasAttributes = Object.keys(listing?.attributes || {}).length > 0;
    if (Array.isArray(schema.sections)) {
      return schema.sections
        .filter((s) => s.kind !== 'attributes' || hasAttributes)
        .filter((s) => typeof s.visibleWhen !== 'function' || s.visibleWhen(listing));
    }
    if (Array.isArray(schema.fields)) return [{ id: 'details', label: 'Genel', fields: schema.fields }];
    return [];
  }, [schema, listing]);

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
    <div>
      {sections.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          {sections.map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`rounded border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${isActive
                  ? 'border-accent-teal bg-accent-teal-50 text-accent-teal-800'
                  : 'border-border-light bg-background-secondary text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
                  }`}
              >
                {detailLabel(tab.label)}
              </button>
            );
          })}
        </div>
      )}

      {active?.kind === 'component' && active.component ? (
        <active.component listing={listing} />
      ) : active?.kind === 'attributes' ? (
        <ListingAttributeDetails
          section={active}
          listing={listing}
          renderRow={(row) => <DetailRow key={row.key} label={row.label} value={row.value} />}
        />
      ) : visibleFields.length === 0 ? (
        <p className="text-sm text-text-muted">{t("no_features_specified", "Belirtilmiş özellik bulunmuyor.")}</p>
      ) : (
        <dl className={DETAIL_GRID}>
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
    <div className="rounded border border-border-light bg-background-primary p-6 shadow-sm">
      {content}
    </div>
  );
};

export default GenericListingDetails;

