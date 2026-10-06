import type { Metadata } from 'next';

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/assets/images/app_logo.png?v=2', type: 'image/png', sizes: 'any' },
    ],
    shortcut: '/assets/images/app_logo.png?v=2',
    apple: '/assets/images/app_logo.png?v=2',
  },
};

export default function LandingPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <head>
        {/* Explicit favicon override — forces browsers past cached favicon.ico */}
        <link rel="icon" type="image/png" href="/assets/images/app_logo.png?v=2" />
        <link rel="shortcut icon" type="image/png" href="/assets/images/app_logo.png?v=2" />
        <link rel="apple-touch-icon" href="/assets/images/app_logo.png?v=2" />
      </head>
      {children}
    </>
  );
}
