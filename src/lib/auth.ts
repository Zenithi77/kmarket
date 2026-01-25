import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('И-мэйл болон нууц үг оруулна уу');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error('Хэрэглэгч олдсонгүй');
        }

        if (!user.password) {
          throw new Error('Та Google-ээр бүртгүүлсэн байна');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Нууц үг буруу байна');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.full_name,
          image: user.avatar,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email: user.email ?? undefined });

        if (!existingUser) {
          // Create new user for OAuth
          await User.create({
            email: user.email ?? '',
            full_name: user.name ?? '',
            avatar: user.image ?? undefined,
            provider: account.provider,
            providerId: account.providerAccountId,
            role: 'user',
          });
        } else if (!existingUser.provider) {
          // Update existing user with OAuth info
          existingUser.provider = account.provider as 'google';
          existingUser.providerId = account.providerAccountId;
          if (!existingUser.avatar && user.image) {
            existingUser.avatar = user.image;
          }
          await existingUser.save();
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email ?? undefined });
        
        token.id = dbUser?._id.toString() || user.id;
        token.role = dbUser?.role || 'user';
        token.provider = account?.provider;
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
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
