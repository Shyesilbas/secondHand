import Button from '../../../common/components/ui/Button.jsx';
import { keyOptions, valueOptions } from './attributeValues.js';

/**
 * ENUM_MAP input (e.g. body parts -> Orijinal / Boyalı / Değişmiş). A part left unmarked is "not answered".
 */
const DamageMapField = ({ definition, value, onChange, label }) => {
	const parts = keyOptions(definition);
	const choices = valueOptions(definition);
	const current = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
	const firstChoice = choices[0]?.value;

	const setPart = (part, choice) => {
		const next = { ...current };
		if (next[part] === choice) delete next[part];
		else next[part] = choice;
		onChange(next);
	};

	const markAll = () => {
		if (!firstChoice) return;
		const next = {};
		parts.forEach((p) => { next[p.value] = current[p.value] ?? firstChoice; });
		onChange(next);
	};

	return (
		<div>
			<div className="mb-2 flex flex-wrap items-center justify-between gap-2">
				<span className="text-sm font-medium text-text-primary">{label}</span>
				<div className="flex items-center gap-1">
					{firstChoice && (
						<Button variant="ghost" size="sm" onClick={markAll}>
							Kalanları {choices[0].label.toLocaleLowerCase('tr-TR')} işaretle
						</Button>
					)}
					{Object.keys(current).length > 0 && (
						<Button variant="ghost" size="sm" onClick={() => onChange({})}>Temizle</Button>
					)}
				</div>
			</div>
			<div className="divide-y divide-border-light rounded border border-border-light">
				{parts.map((part) => (
					<div key={part.value} className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
						<span className="text-sm text-text-secondary">{part.label}</span>
						<div className="flex flex-wrap gap-1" role="radiogroup" aria-label={part.label}>
							{choices.map((choice) => {
								const selected = current[part.value] === choice.value;
								return (
									<button
										key={choice.value}
										type="button"
										role="radio"
										aria-checked={selected}
										onClick={() => setPart(part.value, choice.value)}
										className={`min-h-11 sm:min-h-9 rounded-sm border px-2.5 text-xs font-medium transition-colors ${
											selected
												? 'border-primary bg-background-secondary text-text-primary'
												: 'border-border-light text-text-secondary hover:border-card-border-hover hover:text-text-primary'
										}`}
									>
										{choice.label}
									</button>
								);
							})}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default DamageMapField;
