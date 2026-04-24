import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import Apple from 'next-auth/providers/apple';
import Credentials from 'next-auth/providers/credentials';
import Facebook from 'next-auth/providers/facebook';
import Google from 'next-auth/providers/google';
import { compareSync } from 'bcryptjs';
import { ensureStudentForUser } from '../infrastructure/auth/ensureStudentForUser';
import { UserMapper } from '../infrastructure/db/mappers/UserMapper';
import { getPrismaClient } from '../infrastructure/db/prisma/client';
import { authConfig } from '../auth.config';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
  interface User {
    role?: string;
  }
}

const prisma = getPrismaClient();

function oauthProviders() {
  const list = [];
  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    list.push(
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      }),
    );
  }
  if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) {
    list.push(
      Facebook({
        clientId: process.env.AUTH_FACEBOOK_ID,
        clientSecret: process.env.AUTH_FACEBOOK_SECRET,
      }),
    );
  }
  if (process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET) {
    list.push(
      Apple({
        clientId: process.env.AUTH_APPLE_ID,
        clientSecret: process.env.AUTH_APPLE_SECRET,
      }),
    );
  }
  return list;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...oauthProviders(),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (typeof credentials?.email !== 'string' || typeof credentials.password !== 'string') {
          return null;
        }

        const raw = await prisma.user.findUnique({ where: { email: credentials.email } });

        if (!raw || !raw.isActive) return null;
        if (!raw.passwordHash) return null;
        if (!compareSync(credentials.password, raw.passwordHash)) return null;

        const user = UserMapper.toDomain(raw);
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt(params) {
      const token = authConfig.callbacks.jwt(params);
      if (params.user?.id) {
        await ensureStudentForUser(params.user.id);
      }
      return token;
    },
  },
});

export const authOptions = { auth };
