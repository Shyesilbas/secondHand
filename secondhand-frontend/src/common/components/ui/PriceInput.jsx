import { useState, useCallback, useEffect } from 'react';
import {formatPrice, parsePrice} from '../../formatters.js';

/** Price input: formats as 35.000,00 on blur, parses on change. value=number, onChange(num). */
export const PriceInput = ({value, onChange, onBlur, placeholder = '0,00', className = '', compact = false, ...rest}) => {
 const [display, setDisplay] = useState(() => (value != null && Number.isFinite(value) && value > 0 ? formatPrice(value) : ''));
 const [focused, setFocused] = useState(false);

 useEffect(() => {
 if (!focused) {
 if (value != null && Number.isFinite(value) && value > 0) {
 setDisplay(formatPrice(value));
 } else if (value == null || value === '' || value === 0) {
 setDisplay('');
 }
 }
 }, [value, focused]);

 const handleChange = useCallback((e) => {
 const raw = e.target.value;
 setDisplay(raw);
 const n = parsePrice(raw);
 onChange?.(n);
 }, [onChange]);

 const handleFocus = useCallback((e) => {
 setFocused(true);
 e.target.select?.();
 }, []);

 const handleBlur = useCallback(() => {
 setFocused(false);
 const n = parsePrice(display);
 if (n != null && n > 0) {
 setDisplay(formatPrice(n));
 } else {
 setDisplay('');
 onChange?.(null);
 }
 onBlur?.();
 }, [display, onBlur, onChange]);

 const baseCls = compact ? 'w-20 px-2 py-1.5 text-xs' : 'w-full px-3.5 py-2 text-sm';
 return (
 <input type="text" inputMode="decimal" value={display} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}
 placeholder={placeholder} className={`${baseCls} border border-border-light rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary ${className}`} {...rest} />
 );
};
