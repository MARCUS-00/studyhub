import { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";

export const NextAuthOptions: AuthOptions = {
  providers: [
    Credentials({
      credentials: {
        userId: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.userId || !credentials.password) return null;

        // Try email lookup first, then fall back to registration number
        let user = await prisma.user.findUnique({
          where: { mail_id: credentials.userId },
        });

        if (!user) {
          const details = await prisma.user_details.findUnique({
            where: { reg_no: credentials.userId },
            include: { users: true },
          });
          user = details?.users ?? null;
        }

        if (!user?.password) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.mail_id,
          name: user.first_name,
          image: user.prof_image,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    newUser: "/signup",
  },
  callbacks: {
    // authorize already returns id + role — store them in the token once.
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.uid;
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
};
