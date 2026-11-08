import { useQuery } from '@tanstack/react-query';
import { attributeLabel, formatAttributeValue, listingLevelDefinitions } from './attributeValues.js';

/**
 * Answered attributes of an attributes section as `{label, value}` rows, handed to `render`.
 * Shares the cached definitions query with the form section; renders nothing until it has rows.
 */
const ListingAttributeSummary = ({ section, ctx, attributes, render }) => {
	const query = useQuery(section.definitionsQuery(ctx));
	const rows = listingLevelDefinitions(query.data)
		.map((def) => ({ label: attributeLabel(def), value: formatAttributeValue(def, attributes?.[def.key]) }))
		.filter((row) => row.value);
	return rows.length ? render(rows) : null;
};

export default ListingAttributeSummary;
