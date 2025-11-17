'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

export function UserNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-4">
      {session?.user ? (
        <>
          {session.user.role === 'ADMIN' && !isAdminPage && (
            <Link
              href="/admin"
              className="text-sm font-medium text-gray-700 hover:text-gray-800"
            >
              {t('navigation.adminArea')}
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-sm font-medium text-gray-700 hover:text-gray-800"
          >
            {t('navigation.logout')}
          </button>
        </>
      ) : (
        <button
          onClick={() => signIn()}
          className="text-sm font-medium text-gray-700 hover:text-gray-800"
        >
          {t('navigation.login')}
        </button>
      )}
    </div>
  );
}
