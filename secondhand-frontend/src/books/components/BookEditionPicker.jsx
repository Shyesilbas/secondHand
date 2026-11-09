import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Search } from 'lucide-react';
import Alert from '../../common/components/ui/Alert.jsx';
import Button from '../../common/components/ui/Button.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import { inputNormal } from '../../common/components/forms/inputStyles.js';
import { useDebouncedValue } from '../../common/hooks/useDebouncedValue.js';
import { bookEditionLookupQuery } from '../services/bookCatalogQuery.js';
import { applyBookEdition, clearBookEdition } from '../utils/bookEdition.js';

const editionMeta = (e, t) => [e.publisher, e.publicationYear, e.pageCount ? `${e.pageCount} ${t ? t('pages_suffix', 'sayfa') : 'sayfa'}` : null, e.formatLabel]
	.filter(Boolean)
	.join(' · ');

const Cover = ({ url }) => (
	<div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border-light bg-background-tertiary">
		{url ? <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" /> : <BookOpen className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />}
	</div>
);

const EditionRow = ({ edition, onPick, t }) => (
	<li>
		<button
			type="button"
			onClick={() => onPick(edition)}
			className="flex w-full items-start gap-3 rounded px-3 py-2 text-left hover:bg-background-secondary focus:bg-background-secondary focus:outline-none"
		>
			<Cover url={edition.coverUrl} />
			<div className="min-w-0">
				<p className="truncate text-sm font-medium text-text-primary">{edition.title}</p>
				<p className="truncate text-sm text-text-secondary">{edition.authors}</p>
				<p className="truncate text-xs text-text-tertiary tabular-nums">
					{editionMeta(edition, t)}{edition.isbn ? ` · ISBN ${edition.isbn}` : ''}
				</p>
			</div>
		</button>
	</li>
);

/**
 * Finds the book in the catalog by ISBN or by title / author and links the edition to the listing; its facts
 * then fill the form read-only. A book the catalog does not have is entered by hand below (unverified).
 * The listing payload carries only `editionId` and the copied values, so a page reload keeps the link but not
 * the cover preview, which then comes from the listing photo.
 */
const BookEditionPicker = ({ ctx }) => {
	const { t } = useTranslation();
	const [term, setTerm] = useState('');
	const [picked, setPicked] = useState(null);
	const debounced = useDebouncedValue(term, 300);
	const query = useQuery(bookEditionLookupQuery(debounced));
	const editionId = ctx.formData?.editionId;
	const results = Array.isArray(query.data) ? query.data : [];

	if (editionId) {
		const e = picked && String(picked.id) === String(editionId) ? picked : null;
		return (
			<div className="flex items-start justify-between gap-4 rounded border border-border-light bg-background-secondary p-4">
				<div className="flex min-w-0 items-start gap-3">
					<Cover url={e?.coverUrl || ctx.formData?.imageUrl} />
					<div className="min-w-0">
						<p className="truncate text-sm font-medium text-text-primary">{e?.title || ctx.formData?.title}</p>
						<p className="truncate text-sm text-text-secondary">{ctx.formData?.author}</p>
						<p className="mt-1 text-xs text-text-tertiary tabular-nums">
							{t('from_catalog', 'Katalogdan')} · {[ctx.formData?.publisher, ctx.formData?.publicationYear].filter(Boolean).join(' · ')}
							{ctx.formData?.isbn ? ` · ISBN ${ctx.formData.isbn}` : ''}
						</p>
					</div>
				</div>
				<Button variant="ghost" size="sm" className="shrink-0" onClick={() => clearBookEdition(ctx)}>
					{t('remove_link', 'Bağlantıyı kaldır')}
				</Button>
			</div>
		);
	}

	const showResults = debounced.trim().length >= 2;
	return (
		<div className="space-y-3">
			<div className="relative">
				<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" strokeWidth={1.5} />
				<input
					type="text"
					value={term}
					onChange={(event) => setTerm(event.target.value)}
					placeholder={t('book_search_placeholder', 'ISBN, kitap adı veya yazar')}
					aria-label={t('search_book_in_catalog', 'Katalogda kitap ara')}
					className={`${inputNormal} pl-9`}
				/>
			</div>
			{showResults && query.isLoading && (
				<div className="space-y-2" aria-busy="true">
					{['first', 'second', 'third'].map((slot) => (
						<div key={slot} className="flex items-start gap-3 px-3 py-2">
							<Skeleton className="h-16 w-12 rounded-sm" />
							<div className="flex-1 space-y-2 pt-1">
								<Skeleton className="h-4 w-1/2" />
								<Skeleton className="h-3 w-1/3" />
							</div>
						</div>
					))}
				</div>
			)}
			{showResults && query.isError && (
				<Alert
					type="error"
					message={t('book_catalog_search_error', 'Katalog araması yapılamadı. Bilgileri aşağıya elle girebilirsin.')}
					action={<Button variant="secondary" size="sm" onClick={() => query.refetch()}>{t('retry', 'Tekrar dene')}</Button>}
				/>
			)}
			{showResults && query.isSuccess && results.length === 0 && (
				<p className="text-sm text-text-secondary">{t('book_not_found_manual_hint', 'Katalogda bulunamadı. Kitap bilgilerini aşağıya elle girebilirsin; ilan doğrulanmamış olarak görünür.')}</p>
			)}
			{showResults && results.length > 0 && (
				<ul className="max-h-80 divide-y divide-border-light overflow-y-auto rounded border border-border">
					{results.map((edition) => (
						<EditionRow
							key={edition.id}
							edition={edition}
							t={t}
							onPick={(e) => {
								setPicked(e);
								applyBookEdition(ctx, e, { previousTypeId: ctx.formData?.bookTypeId });
								setTerm('');
							}}
						/>
					))}
				</ul>
			)}
		</div>
	);
};

export default BookEditionPicker;
