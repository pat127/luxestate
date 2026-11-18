import type { Metadata } from 'next';
import { generatePropertyMetadata } from './metadata';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return generatePropertyMetadata({ params });
}

export default function PropertyDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
