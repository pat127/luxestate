const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestate6357.builtwithrocket.new';

export type PropertyCategory = 'residential' | 'commercial' | 'project';

export function getListingCanonical(category: 'residential' | 'commercial' | 'projects'): string {
  return `${siteUrl}/${category}`;
}

export function getPropertyCanonical(propertyId: string | number): string {
  return `${siteUrl}/properties/${propertyId}`;
}

export function getProjectCanonical(projectId: string | number): string {
  return `${siteUrl}/projects/${projectId}`;
}

export function getFilteredListingCanonical(
  category: 'residential' | 'commercial',
  filter?: string
): string {
  if (!filter) return getListingCanonical(category);
  return `${siteUrl}/${category}?type=${encodeURIComponent(filter)}`;
}

export function normalizeCanonical(url: string): string {
  try {
    const urlObj = new URL(url);
    let normalized = urlObj.toString();
    if (normalized.endsWith('/') && urlObj.pathname !== '/') {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return url;
  }
}

export function getCategoryFromPath(path: string): PropertyCategory | null {
  if (path.includes('/residential')) return 'residential';
  if (path.includes('/commercial')) return 'commercial';
  if (path.includes('/projects')) return 'project';
  return null;
}
