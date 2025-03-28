'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

export function UserNav() {
  const { data: session } = useSession();

  return (
    <div className="flex items-center gap-4">
      {session?.user ? (
        <>
          {session.user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="text-sm font-medium text-gray-700 hover:text-gray-800"
            >
              Admin-Bereich
            </Link>
          )}
          <button
            onClick={() => signOut()}
            className="text-sm font-medium text-gray-700 hover:text-gray-800"
          >
            Abmelden
          </button>
        </>
      ) : (
        <button
          onClick={() => signIn()}
          className="text-sm font-medium text-gray-700 hover:text-gray-800"
        >
          Anmelden
        </button>
      )}
    </div>
  );
}
