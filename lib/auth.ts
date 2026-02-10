import NextAuth from "next-auth";
import Auth0 from "next-auth/providers/auth0";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Auth0({
      clientId: process.env.AUTH_AUTH0_ID!,
      clientSecret: process.env.AUTH_AUTH0_SECRET!,
      issuer: process.env.AUTH_AUTH0_ISSUER!,
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      if (!user.email) return false;

      // Link Auth0 user to existing user in DB by email
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (dbUser && !dbUser.auth0Id && profile?.sub) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { auth0Id: profile.sub },
        });
      }

      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, name: true, role: true, initials: true, departmentId: true },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
          session.user.initials = dbUser.initials;
          session.user.departmentId = dbUser.departmentId;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
