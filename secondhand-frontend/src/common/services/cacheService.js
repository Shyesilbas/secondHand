const readRaw = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (_) {
    return null;
  }
};

const writeRaw = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (_) {
    return false;
  }
};

const removeRaw = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (_) {
    return false;
  }
};

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch (_) {
    return null;
  }
};

export const cacheService = {
  get: (key, { ttlMs } = {}) => {
    const raw = readRaw(key);
    if (!raw) return null;

    const parsed = safeJsonParse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const storedAt = parsed.t;
    const data = parsed.v;

    if (ttlMs != null && Number.isFinite(ttlMs) && storedAt && Date.now() - storedAt > ttlMs) {
      removeRaw(key);
      return null;
    }

    return data ?? null;
  },

  set: (key, value) => {
    return writeRaw(key, JSON.stringify({ t: Date.now(), v: value }));
  },

  remove: (key) => {
    return removeRaw(key);
  },
};

