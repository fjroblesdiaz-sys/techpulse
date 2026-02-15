import NextAuth, { type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, trigger, session }) {
      console.log("JWT Callback - Account:", account ? "present" : "none");
      console.log("JWT Callback - Token before:", Object.keys(token));
      
      if (account) {
        token.accessToken = account.access_token;
        console.log("JWT Callback - Added accessToken");
      }
      
      console.log("JWT Callback - Token after:", Object.keys(token));
      return token;
    },
    async session({ session, token }) {
      console.log("Session Callback - Token:", Object.keys(token));
      console.log("Session Callback - Has accessToken:", !!token.accessToken);
      
      if (session.user) {
        session.user.id = token.sub as string;
      }
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
