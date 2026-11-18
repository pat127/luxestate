import type { Metadata } from 'next';

export const metadata: Metadata = {
  icons: {
    icon: [{ url: '/api/favicon', type: 'image/png', sizes: 'any' }],
    shortcut: '/api/favicon',
    apple: '/api/favicon',
  },
};

export default function LandingPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
