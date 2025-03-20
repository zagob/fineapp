import type { Metadata } from "next";
import '../styles/globals.css'

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased bg-neutral-900 text-neutral-50">
      <body>{children}</body>
    </html>
  );
}
