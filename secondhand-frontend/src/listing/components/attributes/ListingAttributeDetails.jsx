import { useQuery } from '@tanstack/react-query';
import Alert from '../../../common/components/ui/Alert.jsx';
import Button from '../../../common/components/ui/Button.jsx';
import Skeleton from '../../../common/components/ui/Skeleton.jsx';
import { attributeLabel, formatAttributeValue, listingLevelDefinitions } from './attributeValues.js';

/** Detail-page rows for `listing.attributes`; `section.definitionsQuery(listing)` supplies the definitions. */
const ListingAttributeDetails = ({ section, listing, renderRow }) => {
	const query = useQuery(section.definitionsQuery(listing));

	if (query.isLoading) {
		return (
			<div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-x-12" aria-busy="true">
				{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-9" />)}
			</div>
		);
	}
	if (query.isError) {
		return (
			<Alert
				message="Durum bilgileri yüklenemedi."
				action={<Button variant="secondary" size="sm" onClick={() => query.refetch()}>Tekrar dene</Button>}
			/>
		);
	}

	const rows = listingLevelDefinitions(query.data)
		.map((def) => ({ key: def.key, label: attributeLabel(def), value: formatAttributeValue(def, listing?.attributes?.[def.key]) }))
		.filter((row) => row.value);

	if (!rows.length) {
		return <p className="py-3 text-sm text-text-muted">Satıcı durum bilgisi girmemiş.</p>;
	}
	return (
		<dl className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12">
			{rows.map((row) => renderRow(row))}
		</dl>
	);
};

export default ListingAttributeDetails;
