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
 * Generate a UUID v4
 * @returns {string} UUID
 */
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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

