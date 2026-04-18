import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compareSync } from 'bcryptjs';
import { getPrismaClient } from '../infrastructure/db/prisma/client';
import { UserMapper } from '../infrastructure/db/mappers/UserMapper';

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

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (typeof credentials?.email !== 'string' || typeof credentials.password !== 'string') {
          return null;
        }

        const prisma = getPrismaClient();
        const raw = await prisma.user.findUnique({ where: { email: credentials.email } });

        if (!raw || !raw.isActive) return null;
        if (!compareSync(credentials.password, raw.passwordHash)) return null;

        const user = UserMapper.toDomain(raw);
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
