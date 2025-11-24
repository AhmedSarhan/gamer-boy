/**
 * Generate a simple user fingerprint for anonymous rating tracking
 * Uses browser fingerprinting techniques (non-invasive)
 */
export function generateUserFingerprint(): string {
  if (typeof window === "undefined") {
    return "server-side";
  }

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ];

  const fingerprint = components.join("|");
  return hashString(fingerprint);
}

/**
 * Simple hash function for fingerprint generation
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Store fingerprint in localStorage for consistency
 */
export function getUserFingerprint(): string {
  if (typeof window === "undefined") {
    return "server-side";
  }

  const STORAGE_KEY = "user_fingerprint";
  let fingerprint = localStorage.getItem(STORAGE_KEY);

  if (!fingerprint) {
    fingerprint = generateUserFingerprint();
    localStorage.setItem(STORAGE_KEY, fingerprint);
  }

  return fingerprint;
}
