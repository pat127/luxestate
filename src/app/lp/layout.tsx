import type { Metadata } from 'next';

export const metadata: Metadata = {
  icons: {
    icon: [{ url: '/assets/images/app_logo.png', type: 'image/png' }],
    shortcut: '/assets/images/app_logo.png',
    apple: '/assets/images/app_logo.png',
  },
};

export default function LandingPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
