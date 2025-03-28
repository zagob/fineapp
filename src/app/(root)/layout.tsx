import { Menu } from "@/components/Menu";
import { Profile } from "@/components/Profile";
import { SignOut } from "@/components/signOut";
import { auth, signIn } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session) return (
    <main>
        <div className="text-2xl">Not authenticated</div>
        <button
          onClick={async () => {
            "use server";
            await signIn("google");
          }}
        >
          SignIn
        </button>
      </main>
  )

  return (
    <main className="min-h-screen px-12 py-8">
      <div className="flex items-center justify-between gap-4">
        <Menu />
        <div className="flex items-center gap-4">
          <Profile session={session} />

          <SignOut />
        </div>
      </div>
      {children}
    </main>
  );
}
