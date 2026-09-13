// NexoCore — NextAuth v5 Configuration
// Multi-tenant: tenant_id inyectado en el JWT callback

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/shared/database/prisma";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: {
            workspaces: {
              include: { workspace: true },
            },
          },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in: store user id
      if (user) {
        token.uid = user.id;
      }

      // On first login, load the user's default workspace
      if (trigger === "signIn" && user) {
        const workspaceUser = await prisma.workspaceUser.findFirst({
          where: { userId: user.id },
          include: { workspace: true },
          orderBy: { joinedAt: "asc" },
        });

        if (workspaceUser) {
          token.tenantId = workspaceUser.workspaceId;
          token.tenantSlug = workspaceUser.workspace.slug;
          token.industry = workspaceUser.workspace.industry;
          token.plan = workspaceUser.workspace.plan;
          token.role = workspaceUser.role;
        }
      }

      // Allow session update to switch workspace — verify ownership before applying
      if (trigger === "update" && session?.tenantId && token.uid) {
        const requestedTenantId = session.tenantId;

        // Verify the current user is a member of the requested workspace
        const membership = await prisma.workspaceUser.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId: requestedTenantId,
              userId: token.uid as string,
            },
          },
          include: { workspace: true },
        });

        if (!membership) {
          console.warn(
            `[auth] rejected workspace switch: user ${token.uid} is not a member of workspace ${requestedTenantId}`,
          );
          return token;
        }

        const ws = membership.workspace;
        token.tenantId = ws.id;
        token.tenantSlug = ws.slug;
        token.industry = ws.industry;
        token.plan = ws.plan;
        token.role = membership.role;
      }

      return token;
    },
    async session({ session, token }) {
      // Expose tenant info to the client session
      if (token) {
        session.user = {
          ...session.user,
          id: token.uid as string,
          tenantId: token.tenantId as string | undefined,
          tenantSlug: token.tenantSlug as string | undefined,
          industry: token.industry as string | undefined,
          plan: token.plan as string | undefined,
          role: token.role as string | undefined,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
});
