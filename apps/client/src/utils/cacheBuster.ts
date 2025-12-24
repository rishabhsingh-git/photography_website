/**
 * Cache-busting utility for development
 * Adds timestamp query parameter to force browser to fetch fresh files
 */

// Generate a unique cache-busting timestamp
export const CACHE_BUST = `?v=${Date.now()}`;

// For development: always append cache-busting to imports
if (import.meta.env.DEV) {
  // Override fetch to add cache-busting
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (typeof input === 'string' && input.startsWith('/')) {
      // Add cache-busting to local assets
      const separator = input.includes('?') ? '&' : '?';
      input = `${input}${separator}_cb=${Date.now()}`;
    }
    return originalFetch(input, init);
  };
}

// Clear all caches on page load in development
if (import.meta.env.DEV && 'caches' in window) {
  window.addEventListener('load', async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('🧹 [CacheBuster] Cleared all caches');
    } catch (err) {
      console.warn('⚠️ [CacheBuster] Could not clear caches:', err);
    }
  });
}

