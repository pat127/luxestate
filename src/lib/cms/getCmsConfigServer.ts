import { createClient } from '@/lib/supabase/server';
import type { CMSData } from '@/contexts/CMSContext';

export interface ServerCmsConfig {
  data: CMSData | null;
  updatedAt: string | null;
}

/** Fetch CMS config on the server so the first paint uses live content, not Rocket defaults. */
export async function getCmsConfigServer(): Promise<ServerCmsConfig> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('data, updated_at')
      .eq('key', 'cms_config')
      .single();

    if (error || !data?.data || typeof data.data !== 'object' || Object.keys(data.data).length === 0) {
      return { data: null, updatedAt: null };
    }

    return {
      data: data.data as CMSData,
      updatedAt: (data as { updated_at?: string }).updated_at ?? null,
    };
  } catch {
    return { data: null, updatedAt: null };
  }
}
