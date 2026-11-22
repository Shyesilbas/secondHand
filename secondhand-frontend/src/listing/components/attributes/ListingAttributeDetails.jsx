import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import Alert from '../../../common/components/ui/Alert.jsx';
import ErrorState from '../../../common/components/ui/ErrorState.jsx';
import Button from '../../../common/components/ui/Button.jsx';
import Skeleton from '../../../common/components/ui/Skeleton.jsx';
import { attributeLabel, formatAttributeValue, listingLevelDefinitions } from './attributeValues.js';
import { DETAIL_GRID } from '../details/detailGrid.js';

/** Detail-page rows for `listing.attributes`; `section.definitionsQuery(listing)` supplies the definitions. */
const ListingAttributeDetails = ({ section, listing, renderRow }) => {
	const { t } = useTranslation();
	const query = useQuery(section.definitionsQuery(listing));

	if (query.isLoading) {
		return (
			<div className={DETAIL_GRID} aria-busy="true">
				{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10" />)}
			</div>
		);
	}
	if (query.isError) {
		return (
			<ErrorState size="compact" title={t('condition_info_failed_load', 'Durum bilgileri yüklenemedi')} onRetry={query.refetch} />
		);
	}

	const rows = listingLevelDefinitions(query.data)
		.map((def) => ({ key: def.key, label: attributeLabel(def), value: formatAttributeValue(def, listing?.attributes?.[def.key]) }))
		.filter((row) => row.value);

	if (!rows.length) {
		return <p className="text-sm text-text-muted">{t('seller_no_condition_specified', 'Satıcı durum bilgisi girmemiş.')}</p>;
	}
	return (
		<dl className={DETAIL_GRID}>
			{rows.map((row) => renderRow(row))}
		</dl>
	);
};

export default ListingAttributeDetails;
