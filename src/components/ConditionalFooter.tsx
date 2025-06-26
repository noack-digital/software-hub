'use client';

import { useSearchParams } from 'next/navigation';
import { Footer } from './Footer';

export function ConditionalFooter() {
  const searchParams = useSearchParams();
  const hideFooter = searchParams?.get('hideFooter') === 'true';

  if (hideFooter) {
    return null;
  }

  return <Footer />;
}