import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 AUTH ATTEMPT:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ No credentials provided');
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        console.log('👤 User found:', user ? 'YES' : 'NO');
        console.log('🔑 Has password hash:', user?.password ? 'YES' : 'NO');

        if (!user || !user.password) {
          console.log('❌ User not found or no password');
          throw new Error('Invalid credentials');
        }

        console.log('🔒 Comparing passwords...');
        console.log('   Input password:', credentials.password);
        console.log('   Hash in DB:', user.password.substring(0, 20) + '...');
        
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        console.log('✅ Password match:', isCorrectPassword);

        if (!isCorrectPassword) {
          console.log('❌ PASSWORD MISMATCH!');
          throw new Error('Invalid credentials');
        }

        console.log('🎉 LOGIN SUCCESS!');
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: '/',
    error: '/',
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

