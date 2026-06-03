'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { UAE_LOCATIONS, type UAELocation } from '@/lib/uaeLocations';

let _cache: { locations: UAELocation[]; ts: number } | null = null;
const CACHE_TTL = 60_000;

export async function fetchCommunities(): Promise<UAELocation[]> {
  if (_cache && Date.now() - _cache.ts < CACHE_TTL) {
    return _cache.locations;
  }

  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();
  const { data } = await supabase
    .from('site_settings')
    .select('data')
    .eq('key', 'communities')
    .single();

  if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
    const fetched = data.data as UAELocation[];
    _cache = { locations: fetched, ts: Date.now() };
    return fetched;
  }

  return UAE_LOCATIONS;
}

export function useCommunities() {
  const [locations, setLocations] = useState<UAELocation[]>(_cache?.locations ?? UAE_LOCATIONS);
  const [loaded, setLoaded] = useState(!!_cache);

  useEffect(() => {
    let cancelled = false;
    fetchCommunities().then((result) => {
      if (!cancelled) {
        setLocations(result);
        setLoaded(true);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const areas = useMemo(() => locations.map((l) => l.area), [locations]);

  const allCommunities = useMemo(
    () => locations.flatMap((l) => l.communities),
    [locations],
  );

  const emirates = useMemo(
    () => [...new Set(locations.map((l) => l.emirate))],
    [locations],
  );

  const getAreasForEmirate = useCallback(
    (emirate: string) => locations.filter((l) => l.emirate === emirate).map((l) => l.area),
    [locations],
  );

  const getCommunitiesForArea = useCallback(
    (area: string) => {
      const found = locations.find((l) => l.area === area);
      return found ? found.communities : [];
    },
    [locations],
  );

  return { locations, areas, allCommunities, emirates, getAreasForEmirate, getCommunitiesForArea, loaded };
}
