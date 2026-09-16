// Google Analytics 4 utility for LuxEstate sales intelligence

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/**
 * Track a custom GA4 event. Safe to call in any environment —
 * silently no-ops when gtag is not loaded.
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

// ─── Real Estate Specific Tracking ───────────────────────────────────────────

/** Fired when a property detail page is viewed */
export function trackPropertyView(params: {
  propertyId: string;
  propertyName: string;
  propertyType?: string;
  location?: string;
  price?: string;
  listingType?: string;
}): void {
  trackEvent('property_view', {
    property_id: params.propertyId,
    property_name: params.propertyName,
    property_type: params.propertyType ?? 'unknown',
    location: params.location ?? 'unknown',
    price: params.price ?? 'unknown',
    listing_type: params.listingType ?? 'unknown',
  });
}

/** Fired when a filter is applied on a listings page */
export function trackFilterSelection(params: {
  filterType: string;
  filterValue: string;
  page?: string;
}): void {
  trackEvent('filter_selection', {
    filter_type: params.filterType,
    filter_value: params.filterValue,
    page: params.page ?? 'listings',
  });
}

/** Fired when a sort option is changed on a listings page */
export function trackSortSelection(params: {
  sortValue: string;
  page?: string;
}): void {
  trackEvent('sort_selection', {
    sort_value: params.sortValue,
    page: params.page ?? 'listings',
  });
}

/** Fired when an inquiry / enquiry form is successfully submitted */
export function trackInquirySubmission(params: {
  formType: 'property_enquiry' | 'project_inquiry' | 'contact';
  propertyId?: string;
  propertyName?: string;
  budget?: string;
  source?: string;
}): void {
  trackEvent('inquiry_submission', {
    form_type: params.formType,
    property_id: params.propertyId ?? 'n/a',
    property_name: params.propertyName ?? 'n/a',
    budget: params.budget ?? 'n/a',
    source: params.source ?? 'website',
  });
}
