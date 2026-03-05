// auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// 🔒 SECURITY: Generate secure bcrypt hash for 'admin123'
// Run this once: const hash = await bcrypt.hash('admin123', 10);
// Default hash for 'admin123' with salt rounds 10:
const ADMIN_PASSWORD_HASH = '$2a$10$M1nhlYzTAhBuJ1NheWsaYu4RcJwV7kRAIbSwrr4Ty4/XjTeUkhKyG';

// Demo users (in production, use database)
const users = [
  {
    id: '1',
    email: 'admin@taskflow.com',
    password: ADMIN_PASSWORD_HASH, // bcrypt hash
    name: 'Admin User',
    role: 'admin',
  },
];

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = users.find((u) => u.email === credentials.email);

        if (!user) {
          // 🔒 SECURITY: Use generic error message to prevent user enumeration
          return null;
        }

        // 🔒 SECURITY: Use bcrypt for password verification
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  // 🔒 SECURITY: Additional security settings
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  trustHost: true,
});
