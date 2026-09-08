import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#ff7726",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "DOPHY Affiliate Portal & Admin System",
  description: "Aplikasi Affiliate Marketing & Management System DOPHY (Dopamine Snack)",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/assets/logo-transparent.png", type: "image/png" },
    ],
    shortcut: "/assets/logo-transparent.png",
    apple: "/assets/logo-transparent.png",
  },
  openGraph: {
    title: "DOPHY Affiliate Portal & Admin System",
    description: "Portal Affiliate Marketing & Management System DOPHY (Dopamine Snack)",
    images: [{ url: "/assets/logo-transparent.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased selection:bg-dophy-500 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
