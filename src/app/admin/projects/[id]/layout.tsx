import type { Metadata } from 'next';
import { generateProjectMetadata } from './metadata';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return generateProjectMetadata({ params });
}

export default function ProjectDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
