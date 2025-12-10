import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

export class AdminAuthError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AdminAuthError';
  }
}

type AdminTokenPayload = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
};

export async function requireAdmin(): Promise<AdminTokenPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token');

  if (!token) {
    throw new AdminAuthError();
  }

  try {
    const secret = process.env.NEXTAUTH_SECRET || 'admin-secret';
    const payload = verify(token.value, secret) as AdminTokenPayload;
    return payload;
  } catch {
    throw new AdminAuthError();
  }
}



