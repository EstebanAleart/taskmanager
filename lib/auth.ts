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

      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (dbUser) {
        // Link auth0Id and activate if needed
        const updates: Record<string, unknown> = {};
        if (!dbUser.auth0Id && profile?.sub) updates.auth0Id = profile.sub;
        if (dbUser.status !== "active") updates.status = "active";
        if (Object.keys(updates).length > 0) {
          await prisma.user.update({ where: { id: dbUser.id }, data: updates });
        }
      } else {
        // Create user on first login
        const name = user.name || user.email.split("@")[0];
        const initials = name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        // Get or create a default department
        let defaultDept = await prisma.department.findFirst();
        if (!defaultDept) {
          defaultDept = await prisma.department.create({
            data: {
              name: "general",
              label: "General",
              color: "text-blue-400",
              bgColor: "bg-blue-500/15",
            },
          });
        }

        await prisma.user.create({
          data: {
            name,
            email: user.email,
            auth0Id: profile?.sub || null,
            status: "active",
            role: "miembro",
            initials,
            departmentId: defaultDept.id,
            avatar: user.image || "",
          },
        });
      }

      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, name: true, role: true, initials: true, departmentId: true, status: true },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
          session.user.initials = dbUser.initials;
          session.user.departmentId = dbUser.departmentId;
          session.user.status = dbUser.status;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
