import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'color-scheme';
const CHANGE_EVENT = 'secondhand:color-scheme-change';

const readStoredScheme = () => {
  try {
    const val = window.localStorage.getItem(STORAGE_KEY);
    return val === 'dark' || val === 'light' ? val : null;
  } catch {
    return null;
  }
};

const readSystemScheme = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getSnapshot = () => {
  if (typeof window === 'undefined') return 'light';
  return readStoredScheme() ?? readSystemScheme();
};

const getServerSnapshot = () => 'light';

const applySchemeToDocument = (storedScheme) => {
  if (typeof document === 'undefined') return;
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (storedScheme === 'dark' || storedScheme === 'light') {
    if (meta) meta.setAttribute('content', storedScheme);
    document.documentElement.dataset.theme = storedScheme;
  } else {
    if (meta) meta.setAttribute('content', 'light dark');
    delete document.documentElement.dataset.theme;
  }

  const resolved = storedScheme ?? readSystemScheme();
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', resolved === 'dark' ? '#0B1120' : '#0F172A');
  }
};

const subscribe = (listener) => {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia?.('(prefers-color-scheme: dark)');

  const onMediaChange = () => {
    // Never delete a stored override on OS change; only re-sync document meta and notify subscribers.
    applySchemeToDocument(readStoredScheme());
    listener();
  };

  const onStorage = (e) => {
    if (e.key === null || e.key === STORAGE_KEY) {
      applySchemeToDocument(readStoredScheme());
      listener();
    }
  };

  const onCustom = () => listener();

  mq?.addEventListener?.('change', onMediaChange);
  window.addEventListener('storage', onStorage);
  window.addEventListener(CHANGE_EVENT, onCustom);

  return () => {
    mq?.removeEventListener?.('change', onMediaChange);
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CHANGE_EVENT, onCustom);
  };
};

/**
 * Two-state smart toggle: switches to the opposite of the currently rendered scheme.
 * Stores the literal value when diverging from OS preference, and removes it when returning to OS preference.
 */
export const toggleColorScheme = () => {
  if (typeof window === 'undefined') return;
  const current = getSnapshot();
  const target = current === 'dark' ? 'light' : 'dark';
  const system = readSystemScheme();
  const nextStored = target === system ? null : target;

  try {
    if (nextStored) {
      window.localStorage.setItem(STORAGE_KEY, nextStored);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage unavailable; still apply to current document session.
  }

  applySchemeToDocument(nextStored);
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const useColorScheme = () => {
  const colorScheme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    colorScheme,
    isDark: colorScheme === 'dark',
    toggleColorScheme,
  };
};
