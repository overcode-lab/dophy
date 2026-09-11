import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#f05713",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "DOPHY Creator Partner Portal & Admin System",
  description: "Aplikasi Creator Partner & Management System DOPHY (Dopamine Snack)",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/assets/logo-transparent.png", type: "image/png" }],
    shortcut: "/assets/logo-transparent.png",
    apple: "/assets/logo-transparent.png",
  },
  openGraph: {
    title: "DOPHY Creator Partner Portal & Admin System",
    description: "Portal Creator Partner & Management System DOPHY (Dopamine Snack)",
    images: [{ url: "/assets/logo-transparent.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={plusJakartaSans.variable} suppressHydrationWarning>
      <body
        className="font-sans antialiased bg-slate-50 text-slate-900 selection:bg-dophy-500 selection:text-white min-h-screen"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
