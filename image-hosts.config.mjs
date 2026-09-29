/**
 * Image Hosts Configuration (add your image hosts here)
 */

function supabaseStoragePattern() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return { protocol: 'https', hostname: new URL(url).hostname, pathname: '/storage/**' };
  } catch {
    return null;
  }
}

const supabasePattern = supabaseStoragePattern();

export const imageHosts = [
    {
        protocol: 'https',
        hostname: 'images.unsplash.com',
    },
    {
        protocol: 'https',
        hostname: 'images.pexels.com',
    },
    {
        protocol: 'https',
        hostname: 'images.pixabay.com',
    },
    {
        protocol: 'https',
        hostname: 'img.rocket.new',
    },
    {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**',
    },
    {
        protocol: 'https',
        hostname: '*.imagekit.io',
        pathname: '/**',
    },
    {
        protocol: 'https',
        hostname: 'hkxstgyxmxiiccstmbnj.supabase.co',
        pathname: '/storage/**',
    },
    ...(supabasePattern ? [supabasePattern] : []),
];
