import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/',
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      if (trigger === 'update' && session && typeof session.name === 'string') {
        token.name = session.name;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
