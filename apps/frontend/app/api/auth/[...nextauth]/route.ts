import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

declare module "next-auth" {
  interface User {
    token?: string;
    role?: string;
  }

  interface Session {
    token?: string;
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    token?: string;
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
    role?: string;
  }
}

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    GithubProvider({
      clientId: process.env.GITHUB_CLIENTID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && account.id_token) {
        const response = await fetch(
          `${process.env.BACKEND_URL}/users/google-auth`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              idToken: account.id_token,
            }),
          }
        );

        const data = await response.json();

        if (data.access_token) {
          user.token = data.access_token;
          user.id = data.user.id;
          user.email = data.user.email;
          user.name = data.user.name;
          user.role = data.role;
          return true;
        }

        return false;
      }
      if (account?.provider === "github" && account.access_token) {
        const response = await fetch(
          `${process.env.BACKEND_URL}/users/github-auth`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              accessToken: account.access_token,
            }),
          }
        );

        const data = await response.json();
        if (data.access_token) {
          user.token = data.access_token;
          user.id = data.user.id;
          user.email = data.user.email;
          user.name = data.user.name;
          user.role = data.role;
          return true;
        }
        return false;
      }
      return false;
    },
    async jwt({ token, user }) {
      if (user?.token) {
        token.token = user.token;
      }
      if (user) {
        token.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      }
      if (user?.role) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.token) {
        session.token = token.token as string;
      }
      if (token.user || token.role) {
        session.user = {
          ...session.user,
          ...token.user,
          role: token.role ?? token.user?.role,
        };
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET!,
});

export { handler as GET, handler as POST };
