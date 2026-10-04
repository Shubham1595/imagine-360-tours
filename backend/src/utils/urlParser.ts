/**
 * URL and Website Column Normalization Utilities for Sales CRM
 */

/**
 * Checks if a given spreadsheet or CSV column name corresponds to the Website field.
 * Normalizes headers case-insensitively and ignores spaces and underscores.
 * Matches:
 *  - Website
 *  - Website URL
 *  - Web Site
 *  - Web URL
 *  - Company Website
 *  - Website Link
 *  - Website Address
 *  - website_url
 *  - WEBSITE
 *  - etc.
 */
export function isWebsiteColumn(columnName: string): boolean {
  if (!columnName) return false;
  // Normalize header: lowercase and strip all non-alphanumeric characters (spaces, underscores, hyphens)
  const norm = columnName.toLowerCase().replace(/[^a-z0-9]/g, '');

  return (
    norm === 'website' ||
    norm === 'websiteurl' ||
    norm === 'weburl' ||
    norm === 'companywebsite' ||
    norm === 'websitelink' ||
    norm === 'websiteaddress' ||
    norm === 'site' ||
    norm === 'web' ||
    norm.includes('website') ||
    norm.includes('weburl')
  );
}

/**
 * Normalizes website URLs according to CRM specifications:
 * - If value starts with https://, preserve it.
 * - If value starts with http://, preserve it.
 * - If value starts with www., normalize to https://www.example.com
 * - ONLY add https when the value clearly looks like a domain.
 * - Do NOT modify values that are not valid website-like URLs.
 * - If invalid: return isValid: false, url: null, and a warning message.
 */
export function normalizeWebsiteUrl(input: string | null | undefined): {
  isValid: boolean;
  url: string | null;
  warning?: string;
} {
  if (input === null || input === undefined) {
    return { isValid: true, url: null };
  }

  const trimmed = String(input).trim();
  if (trimmed === '') {
    return { isValid: true, url: null };
  }

  // URLs cannot contain whitespace
  if (/\s/.test(trimmed)) {
    return {
      isValid: false,
      url: null,
      warning: `Invalid website URL '${trimmed}': URLs cannot contain whitespace.`,
    };
  }

  // Disallow email addresses erroneously placed in website column
  if (trimmed.includes('@')) {
    return {
      isValid: false,
      url: null,
      warning: `Invalid website URL '${trimmed}': Value appears to be an email address, not a website URL.`,
    };
  }

  // 1. Preserved: starts with https:// or http://
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      // Ensure hostname has at least one dot (e.g. domain.tld) or is localhost
      if (!parsed.hostname || (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost')) {
        return {
          isValid: false,
          url: null,
          warning: `Invalid website URL '${trimmed}': Hostname is missing a valid domain.`,
        };
      }
      return { isValid: true, url: trimmed };
    } catch {
      return {
        isValid: false,
        url: null,
        warning: `Invalid website URL '${trimmed}': Malformed URL structure.`,
      };
    }
  }

  // 2. Starts with www. -> prefix with https://
  if (/^www\./i.test(trimmed)) {
    const withHttps = `https://${trimmed}`;
    try {
      const parsed = new URL(withHttps);
      if (parsed.hostname && parsed.hostname.includes('.')) {
        return { isValid: true, url: withHttps };
      }
    } catch {}
    return {
      isValid: false,
      url: null,
      warning: `Invalid website URL '${trimmed}': Malformed URL structure.`,
    };
  }

  // 3. ONLY add https when the value clearly looks like a domain.
  // Standard domain regex: labels separated by dots, ending with a TLD of at least 2 letters, optional port, optional path/query
  const domainPattern = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?::\d{1,5})?(?:[/?#].*)?$/i;

  if (domainPattern.test(trimmed)) {
    const withHttps = `https://${trimmed}`;
    try {
      const parsed = new URL(withHttps);
      if (parsed.hostname && parsed.hostname.includes('.')) {
        return { isValid: true, url: withHttps };
      }
    } catch {}
  }

  // If none of the above, it does NOT clearly look like a valid website URL
  return {
    isValid: false,
    url: null,
    warning: `Invalid website URL '${trimmed}': Value does not resemble a valid website domain. Stored as null.`,
  };
}
