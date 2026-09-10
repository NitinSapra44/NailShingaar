'use client';

import { useSession } from 'next-auth/react';

export const useAdmin = () => {
  const { data: session, status } = useSession();

  return {
    isAdmin: session?.user?.role === 'admin',
    loading: status === 'loading',
  };
};
