'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Footer } from './Footer';

function ConditionalFooterContent() {
  const searchParams = useSearchParams();
  const hideFooter = searchParams?.get('hideFooter') === 'true';

  if (hideFooter) {
    return null;
  }

  return <Footer />;
}

export function ConditionalFooter() {
  return (
    <Suspense fallback={<Footer />}>
      <ConditionalFooterContent />
    </Suspense>
  );
}