import type { Metadata } from 'next';
import { generateMetadata as getMetadata } from './metadata';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return getMetadata({ params });
}

export default function PropertyDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
