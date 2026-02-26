/**
 * Session ID utility for anonymous user tracking
 * Generates and stores a unique session ID in localStorage
 */
const SESSION_ID_KEY = 'secondhand_session_id';

/**
 * Get or create a session ID
 * @returns {string} Session ID
 */
export const getOrCreateSessionId = () => {
  try {
    // Check if session ID already exists in localStorage
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    
    if (!sessionId) {
      // Generate a new UUID v4
      sessionId = generateUUID();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    
    return sessionId;
  } catch (error) {
    // If localStorage is not available, generate a temporary session ID
    return generateUUID();
  }
};

/**
 * Generate a cryptographically secure UUID v4
 * Falls back to crypto.getRandomValues for older environments
 * @returns {string} UUID
 */
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback using crypto.getRandomValues
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
};

/**
 * Clear the session ID (useful for testing or logout)
 */
export const clearSessionId = () => {
  try {
    localStorage.removeItem(SESSION_ID_KEY);
  } catch (error) {
  }
};

