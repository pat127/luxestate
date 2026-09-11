'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

interface FieldOption {
  id: number;
  value: string;
}

export interface PropertyFieldGroup {
  key: string;
  label: string;
  options: FieldOption[];
}

const KNOWN_KEYS = new Set([
  'statuses', 'types', 'categories', 'furnishing',
  'completion', 'amenities', 'views', 'payment_plans',
  'residential_types', 'commercial_types',
]);

const DEFAULT_PROPERTY_FIELDS: PropertyFieldGroup[] = [
  { key: 'statuses', label: 'Property Statuses', options: [{ id: 1, value: 'Available' }, { id: 2, value: 'Under Offer' }, { id: 3, value: 'Sold' }, { id: 4, value: 'Rented' }, { id: 5, value: 'Off Market' }, { id: 6, value: 'Coming Soon' }] },
  { key: 'types', label: 'Property Types', options: [
    { id: 1, value: 'Apartment' },
    { id: 2, value: 'Villa' },
    { id: 3, value: 'Townhouse' },
    { id: 4, value: 'Penthouse' },
    { id: 5, value: 'Office' },
    { id: 6, value: 'Retail' },
    { id: 7, value: 'Warehouse' },
    { id: 8, value: 'Investment' },
    { id: 9, value: 'Land' },
  ]},
  { key: 'residential_types', label: 'Residential Types', options: [
    { id: 1, value: 'Apartment' },
    { id: 2, value: 'Villa' },
    { id: 3, value: 'Townhouse' },
    { id: 4, value: 'Penthouse' },
  ]},
  { key: 'commercial_types', label: 'Commercial Types', options: [
    { id: 1, value: 'Office' },
    { id: 2, value: 'Retail' },
    { id: 3, value: 'Warehouse' },
    { id: 4, value: 'Investment' },
    { id: 5, value: 'Land' },
  ]},
  { key: 'categories', label: 'Listing Categories', options: [{ id: 1, value: 'Residential' }, { id: 2, value: 'Commercial' }, { id: 3, value: 'Off-Plan' }, { id: 4, value: 'Investment' }] },
  { key: 'furnishing', label: 'Furnishing Status', options: [{ id: 1, value: 'Furnished' }, { id: 2, value: 'Semi-Furnished' }, { id: 3, value: 'Unfurnished' }] },
  { key: 'completion', label: 'Completion Status', options: [{ id: 1, value: 'Ready' }, { id: 2, value: 'Off-Plan' }, { id: 3, value: 'Under Construction' }] },
  { key: 'amenities', label: 'Amenities', options: [{ id: 1, value: 'Swimming Pool' }, { id: 2, value: 'Gym' }, { id: 3, value: 'Concierge' }, { id: 4, value: 'Parking' }, { id: 5, value: 'Security 24/7' }, { id: 6, value: 'Beach Access' }, { id: 7, value: 'Marina View' }, { id: 8, value: 'Golf Course View' }, { id: 9, value: 'Kids Play Area' }, { id: 10, value: 'Spa' }] },
  { key: 'views', label: 'Views', options: [{ id: 1, value: 'Sea View' }, { id: 2, value: 'Burj Khalifa View' }, { id: 3, value: 'Marina View' }, { id: 4, value: 'Golf View' }, { id: 5, value: 'City View' }, { id: 6, value: 'Garden View' }, { id: 7, value: 'Pool View' }] },
  { key: 'payment_plans', label: 'Payment Plans', options: [{ id: 1, value: 'Full Cash' }, { id: 2, value: '10/90 Plan' }, { id: 3, value: '20/80 Plan' }, { id: 4, value: '30/70 Plan' }, { id: 5, value: '40/60 Plan' }, { id: 6, value: '50/50 Plan' }, { id: 7, value: 'Mortgage' }, { id: 8, value: 'Post-Handover' }] },
];

function valuesOf(groups: PropertyFieldGroup[], key: string): string[] {
  return groups.find((g) => g.key === key)?.options.map((o) => o.value) ?? [];
}

let _cache: { groups: PropertyFieldGroup[]; ts: number } | null = null;
const CACHE_TTL = 60_000;

export function usePropertyFields() {
  const [groups, setGroups] = useState<PropertyFieldGroup[]>(_cache?.groups ?? DEFAULT_PROPERTY_FIELDS);
  const [loaded, setLoaded] = useState(!!_cache);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (_cache && Date.now() - _cache.ts < CACHE_TTL) {
      setGroups(_cache.groups);
      setLoaded(true);
      return;
    }

    let cancelled = false;
    supabase
      .from('site_settings')
      .select('data')
      .eq('key', 'property_fields')
      .single()
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          const fetched = data.data as PropertyFieldGroup[];
          _cache = { groups: fetched, ts: Date.now() };
          setGroups(fetched);
        }
        setLoaded(true);
      });

    return () => { cancelled = true; };
  }, [supabase]);

  const statuses = useMemo(() => valuesOf(groups, 'statuses'), [groups]);
  const types = useMemo(() => valuesOf(groups, 'types'), [groups]);
  const categories = useMemo(() => valuesOf(groups, 'categories'), [groups]);
  const furnishing = useMemo(() => valuesOf(groups, 'furnishing'), [groups]);
  const completion = useMemo(() => valuesOf(groups, 'completion'), [groups]);
  const amenities = useMemo(() => valuesOf(groups, 'amenities'), [groups]);
  const views = useMemo(() => valuesOf(groups, 'views'), [groups]);
  const paymentPlans = useMemo(() => valuesOf(groups, 'payment_plans'), [groups]);
  const residentialTypes = useMemo(() => valuesOf(groups, 'residential_types'), [groups]);
  const commercialTypes = useMemo(() => valuesOf(groups, 'commercial_types'), [groups]);
  const customGroups = useMemo(() => groups.filter((g) => !KNOWN_KEYS.has(g.key)), [groups]);

  return {
    groups,
    statuses,
    types,
    categories,
    furnishing,
    completion,
    amenities,
    views,
    paymentPlans,
    residentialTypes,
    commercialTypes,
    customGroups,
    loaded,
  };
}
