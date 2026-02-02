import { formatDateTime } from '../../common/formatters.js';

export const sortPriceHistoryAsc = (history) => {
  const list = Array.isArray(history) ? [...history] : [];
  return list.sort((a, b) => new Date(a?.changeDate).getTime() - new Date(b?.changeDate).getTime());
};

export const sortPriceHistoryDesc = (history) => {
  const list = Array.isArray(history) ? [...history] : [];
  return list.sort((a, b) => new Date(b?.changeDate).getTime() - new Date(a?.changeDate).getTime());
};

export const formatHistoryDateLabel = (changeDate) => {
  if (!changeDate) return '';
  return String(formatDateTime(changeDate, 'tr-TR')).split(' ')[0] || '';
};

export const getHistoryCurrency = (entry, fallbackCurrency) => {
  return entry?.currency || fallbackCurrency || null;
};

export const computePercentageChange = (oldPrice, newPrice) => {
  const base = Number(oldPrice);
  const next = Number(newPrice);
  if (!Number.isFinite(base) || !Number.isFinite(next) || base === 0) return null;
  return ((next - base) / base) * 100;
};

export const computeHistoryStats = (history, fallbackCurrency) => {
  const desc = sortPriceHistoryDesc(history);
  if (!desc.length) return null;

  const latest = desc[0];
  const oldest = desc[desc.length - 1];

  const current = Number(latest?.newPrice);
  const initial = Number(oldest?.oldPrice ?? oldest?.newPrice);
  const currency = getHistoryCurrency(latest, fallbackCurrency);

  const values = desc
    .map((e) => Number(e?.newPrice))
    .filter((n) => Number.isFinite(n));

  const min = values.length ? Math.min(...values) : null;
  const max = values.length ? Math.max(...values) : null;

  const diff = Number.isFinite(current) && Number.isFinite(initial) ? current - initial : null;
  const pct = Number.isFinite(initial) && initial !== 0 && diff != null ? (diff / initial) * 100 : null;

  return {
    currency,
    current: Number.isFinite(current) ? current : null,
    initial: Number.isFinite(initial) ? initial : null,
    min: Number.isFinite(min) ? min : null,
    max: Number.isFinite(max) ? max : null,
    diff,
    pct,
    changesCount: desc.length,
    latestChangeDate: latest?.changeDate || null,
    oldestChangeDate: oldest?.changeDate || null,
  };
};

