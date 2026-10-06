'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UAE_LOCATIONS, type UAELocation } from '@/lib/uaeLocations';

let _cache: { locations: UAELocation[]; ts: number } | null = null;
const CACHE_TTL = 60_000;

export function useCommunities() {
  const [locations, setLocations] = useState<UAELocation[]>(_cache?.locations ?? UAE_LOCATIONS);
  const [loaded, setLoaded] = useState(!!_cache);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (_cache && Date.now() - _cache.ts < CACHE_TTL) {
      setLocations(_cache.locations);
      setLoaded(true);
      return;
    }

    let cancelled = false;
    supabase
      .from('site_settings')
      .select('data')
      .eq('key', 'communities')
      .single()
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          const fetched = data.data as UAELocation[];
          _cache = { locations: fetched, ts: Date.now() };
          setLocations(fetched);
        }
        setLoaded(true);
      });

    return () => { cancelled = true; };
  }, [supabase]);

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
