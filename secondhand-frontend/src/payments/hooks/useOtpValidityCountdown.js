import { useEffect, useMemo, useState } from 'react';

/** Geri sayım gösterimi (mm:ss); saniye için null/NaN ise em dash */
export function formatOtpValidityMmSs(seconds) {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return '—';
  const capped = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(capped / 60)).padStart(2, '0');
  const ss = String(capped % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

/**
 * Kod gönderildiğinde başlayan TTL geri sayacı (client).
 * @param {number|null|undefined} expiresAtMs epoch ms
 */
export function useOtpValidityCountdown(expiresAtMs) {
  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    if (expiresAtMs == null || typeof expiresAtMs !== 'number') {
      setSecondsLeft(null);
      return;
    }

    const tick = () =>
      Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));

    setSecondsLeft(tick());
    const id = setInterval(() => setSecondsLeft(tick()), 1000);
    return () => clearInterval(id);
  }, [expiresAtMs]);

  const formatted = useMemo(() => formatOtpValidityMmSs(secondsLeft), [secondsLeft]);
  const active = expiresAtMs != null && typeof expiresAtMs === 'number';
  const isExpired = active && secondsLeft === 0;

  return { secondsLeft, formatted, isExpired, active };
}
