import { Suspense } from 'react';
import { HomePageContent } from '@/components/HomePageContent';

function HomePageFallback() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Lade Software Hub...</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageFallback />}>
      <HomePageContent />
    </Suspense>
  );
}
