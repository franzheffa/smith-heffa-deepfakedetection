import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getPrismaClient } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";

function normalizeEnvValue(value?: string) {
  return value?.replace(/^"+|"+$/g, "").replace(/\\n/g, "").trim();
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: normalizeEnvValue(process.env.GOOGLE_CLIENT_ID),
      clientSecret: normalizeEnvValue(process.env.GOOGLE_CLIENT_SECRET),
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile?.email) {
        token.email = profile.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      try {
        const prisma = getPrismaClient();

        const dbUser = await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name ?? undefined,
            image: user.image ?? undefined,
          },
          create: {
            email: user.email,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
          },
        });

        await recordAuditEvent({
          action: "auth.sign_in",
          actorId: dbUser.id,
          actorType: "USER",
          status: "SUCCESS",
          details: {
            email: user.email,
          },
        }).catch(() => undefined);
      } catch {
        return false;
      }

      return true;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
});
