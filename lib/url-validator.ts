/**
 * URL validation utility
 */

export interface URLValidationResult {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
}

export function validateURL(input: string): URLValidationResult {
  // Trim whitespace
  const trimmed = input.trim();

  // Check if empty
  if (!trimmed) {
    return {
      isValid: false,
      error: 'URL is required',
    };
  }

  // Add https:// if no protocol specified
  let urlString = trimmed;
  if (!/^https?:\/\//i.test(urlString)) {
    urlString = `https://${urlString}`;
  }

  // Validate URL format
  try {
    const url = new URL(urlString);

    // Check for valid protocol
    if (!['http:', 'https:'].includes(url.protocol)) {
      return {
        isValid: false,
        error: 'URL must use HTTP or HTTPS protocol',
      };
    }

    // Check for valid hostname
    if (!url.hostname || url.hostname.length < 3) {
      return {
        isValid: false,
        error: 'URL must have a valid hostname',
      };
    }

    // Check for at least one dot in hostname (basic domain validation)
    if (!url.hostname.includes('.')) {
      return {
        isValid: false,
        error: 'URL must have a valid domain name',
      };
    }

    return {
      isValid: true,
      normalizedUrl: url.href,
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format',
    };
  }
}

/**
 * Check if URL is likely reachable (basic heuristics)
 */
export function isLikelyReachable(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Exclude localhost/private IPs for production use
    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
