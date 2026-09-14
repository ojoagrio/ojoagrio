import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { users } from './db/schema';

// A bcrypt hash with no matching plaintext — compared against when the email
// doesn't exist, so authorize() takes roughly the same time either way and
// can't be used to enumerate registered emails via response timing.
const DUMMY_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8bBn0BdM/1Xa2Xj/DkYVCP.4CIQ8mm';

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Next's own `basePath` (/agriolinks, in next.config.mjs) is stripped by
  // Next itself before this code ever sees the request — internally the
  // path is still /api/auth/*, so Auth.js keeps its default basePath here.
  // Only externally-generated links would need the /agriolinks prefix, and
  // this app never builds those directly (signIn/signOut only run server-side).
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const rows = await getDb().select().from(users).where(eq(users.email, email)).limit(1);
        const user = rows[0];

        const valid = await compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !valid) return null;

        return { id: user.id, email: user.email };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
