import  { NextAuthConfig } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";

// export const authOptions = NextAuth({
//   providers: [
//     GoogleProvider({
//       clientId: "",
//       clientSecret: "",
//     }),
//   ],
//   callbacks: {
//     async signIn({ account, profile }) {
//       if (account?.provider === "google") {
//         const googleProfile = profile as {
//           email_verified?: boolean;
//           email?: string;
//         };
//         if (
//           googleProfile.email_verified &&
//           googleProfile.email?.endsWith("@example.com")
//         ) {
//           return true;
//         }
//         return false;
//       }

//       return true;
//     },
//   },
// });

export const authConfig = {
  pages: {
    signIn: "/",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/");
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl));
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
