import { Menu } from "@/components/Menu";
import { Profile } from "@/components/Profile";
import { SignOut } from "@/components/signOut";
import { auth } from "@/lib/auth";
import { LoginPage } from "@/components/LoginPage";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  console.log({
    session,
  });
  if (!session) {
    return <LoginPage />;
  }

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
