import React, {useState, useCallback, useEffect} from 'react';
import {formatPrice, parsePrice} from '../../formatters.js';

/** Price input: formats as 35.000,00 on blur, parses on change. value=number, onChange(num). */
export const PriceInput = ({value, onChange, onBlur, placeholder = '0,00', className = '', compact = false, ...rest}) => {
  const [display, setDisplay] = useState(() => (value != null && Number.isFinite(value) ? formatPrice(value) : ''));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused && value != null && Number.isFinite(value)) setDisplay(formatPrice(value));
  }, [value, focused]);

  const handleChange = useCallback((e) => {
    const raw = e.target.value;
    setDisplay(raw);
    const n = parsePrice(raw);
    onChange?.(n);
  }, [onChange]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    const n = parsePrice(display);
    if (n != null) setDisplay(formatPrice(n));
    onBlur?.();
  }, [display, onBlur]);

  const baseCls = compact ? 'w-20 px-2 py-1.5 text-sm' : 'w-32 min-w-[8rem] px-3 py-2.5 text-base';
  return (
    <input type="text" inputMode="decimal" value={display} onChange={handleChange} onFocus={() => setFocused(true)} onBlur={handleBlur}
      placeholder={placeholder} className={`${baseCls} border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${className}`} {...rest} />
  );
};
