declare module "next-auth" {
    /**
     * The shape of the user object returned in the OAuth providers' `profile` callback,
     * or the second parameter of the `session` callback, when using a database.
     */
    interface User {
      id?: string;
      name?: string;
      email?: string;
      image?: string;
    }
    /**
     * The shape of the account object returned in the OAuth providers' `account` callback,
     * Usually contains information about the provider being used, like OAuth tokens (`access_token`, etc).
     */
    interface Account {
      provider?: string;
      type?: string;
      providerAccountId?: string;
    }
   
    /**
     * Returned by `useSession`, `auth`, contains information about the active session.
     */
    interface Session {
      user?: User;
      expires?: string;
    }
  }
   
  declare module "next-auth/jwt" {
    interface JWT {
      id?: string;
    }
  }