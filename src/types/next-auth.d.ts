import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
    profileCompleted?: boolean;
    isNewUser?: boolean;
  }

  interface User {
    role?: string;
    isNewUser?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    provider?: string;
    profileCompleted?: boolean;
    isNewUser?: boolean;
  }
}
