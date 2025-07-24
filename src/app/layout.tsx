
import type { Metadata } from "next";
import "../styles/globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "FineApp - Gestão Financeira Pessoal",
  description: "Aplicativo completo para controle de finanças pessoais, com categorização de gastos, transferências entre contas e relatórios detalhados.",
  keywords: ["finanças", "controle financeiro", "gestão pessoal", "orçamento", "economia"],
  authors: [{ name: "FineApp Team" }],
  creator: "FineApp",
  publisher: "FineApp",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://fineapp.com"),
  openGraph: {
    title: "FineApp - Gestão Financeira Pessoal",
    description: "Controle suas finanças de forma simples e eficiente",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "FineApp - Gestão Financeira Pessoal",
    description: "Controle suas finanças de forma simples e eficiente",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="pt-BR"
      data-theme="dark"
      className="antialiased dark:bg-neutral-900 dark:text-neutral-100"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#171717" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-neutral-900 text-neutral-100">
        <ErrorBoundary>
          <Providers session={session}>
            {children}
            <Toaster 
              position="top-right"
              richColors
              closeButton
              duration={4000}
            />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
