// lib/jwt.ts
import jwt, { JwtPayload } from 'jsonwebtoken';

type AppJwtPayload = JwtPayload & {
  id: string;
  role: 'admin' | 'doctor' | 'patient' | 'staff';
  email?: string;
  name?: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET or NEXTAUTH_SECRET is required for JWT auth.');
  }
  return secret;
}

export const generateToken = (user: any) => {
  return jwt.sign(
    {
      id: user._id?.toString?.() || user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, getJwtSecret()) as AppJwtPayload;
};

export type { AppJwtPayload };
