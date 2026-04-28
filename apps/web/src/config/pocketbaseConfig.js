/**
 * Configuration priority for PocketBase URL:
 * 1. import.meta.env.VITE_POCKETBASE_URL (Frontend environment variable)
 * 2. '/hcgi/platform' (Proxy relative fallback for this specific platform environment)
 */

export const POCKETBASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_POCKETBASE_URL) || 
  '/hcgi/platform';

console.log('[PocketBase Config] Resolved URL:', POCKETBASE_URL);

/**
 * Returns the configured PocketBase URL
 * @returns {string} The PocketBase URL
 */
export const getPocketBaseUrl = () => POCKETBASE_URL;