import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getSupabase } from '@/lib/supabase';
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

        const supabase = getSupabase();

        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .maybeSingle();

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
          id: user.id,
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
        const supabase = getSupabase();

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email ?? '')
          .maybeSingle();

        if (!existingUser) {
          // Create new user for OAuth - mark as needing profile completion
          await supabase.from('users').insert({
            email: user.email ?? '',
            full_name: user.name ?? '',
            avatar: user.image ?? undefined,
            provider: account.provider,
            provider_id: account.providerAccountId,
            role: 'user',
            profile_completed: false,
          });
          // Add flag to redirect to complete-profile
          (user as any).isNewUser = true;
        } else if (!existingUser.provider) {
          // Update existing user with OAuth info
          await supabase
            .from('users')
            .update({
              provider: account.provider,
              provider_id: account.providerAccountId,
              avatar: existingUser.avatar || user.image || undefined,
            })
            .eq('id', existingUser.id);
        } else if (!existingUser.profile_completed) {
          // Existing OAuth user without completed profile
          (user as any).isNewUser = true;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        const supabase = getSupabase();
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email ?? '')
          .maybeSingle();

        token.id = dbUser?.id || user.id;
        token.role = dbUser?.role || 'user';
        token.provider = account?.provider;
        token.profileCompleted = dbUser?.profile_completed ?? true;
        token.isNewUser = (user as any).isNewUser || false;
      }

      // Handle session update (when profile is completed)
      if (trigger === 'update') {
        const supabase = getSupabase();
        const { data: dbUser } = await supabase
          .from('users')
          .select('profile_completed')
          .eq('email', token.email ?? '')
          .maybeSingle();
        if (dbUser) {
          token.profileCompleted = dbUser.profile_completed;
          token.isNewUser = false;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        (session as any).profileCompleted = token.profileCompleted;
        (session as any).isNewUser = token.isNewUser;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If it's a new user (first time Google sign-up), redirect to complete profile
      // This is handled client-side now, so we just return the default URL
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
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
