'use client';

import { createContext, useContext, ReactNode } from 'react';
import {
  useSession,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from 'next-auth/react';

interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? null,
        name: session.user.name ?? null,
      }
    : null;

  const signUp = async (email: string, password: string, fullName?: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: new Error(body.error ?? 'Failed to create account') };
    }

    // Log the new user in immediately — there's no email-verification step
    // with the Credentials provider (unlike Supabase Auth's signUp flow).
    return signIn(email, password);
  };

  const signIn = async (email: string, password: string) => {
    const result = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: new Error('Invalid email or password') };
    }
    return { error: null };
  };

  const signOut = async () => {
    await nextAuthSignOut({ redirect: false });
  };

  return (
    <AuthContext.Provider
      value={{ user, loading: status === 'loading', signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
