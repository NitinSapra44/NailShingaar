import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user;
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') return null;
  return session.user;
}
